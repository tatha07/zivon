/* ==========================================================================
   Zivon shared behaviour layer (no framework, no network, no eval).
   --------------------------------------------------------------------------
   Owns four things and nothing else:
   1. quiz wiring for .zn-check blocks (keyboard-native inputs, aria-live
       feedback, retry allowed - this is learning, not testing); feedback
       marks are ✓/✗ plus words (doctrine §10.6: shape and words, not hue)
   2. the ZivonSim runtime that model-built simulations register into
   3. the landing-page course list renderer (reads window.ZIVON_COURSES)
   4. §10.2 ruled-line baseline alignment on lesson pages (ported from the
       doctrine's lesson example fit(): measure where the handwriting baseline
       sits and shift the ruled background under it)
   Plus: the doctrine pen-underline on the page title (one pen mark per page,
   generated, never a CSS text-underline - design-doctrine.md section 4.1).
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------- 1. quizzes ------------------------------- */
  function firstNumber(text) {
    var m = /-?\d+(?:\.\d+)?/.exec(String(text));
    return m ? parseFloat(m[0]) : null;
  }

  function wireCheck(fieldset) {
    var format = fieldset.getAttribute("data-format");
    var button = fieldset.querySelector(".zn-check-btn");
    var feedback = fieldset.querySelector(".zn-check-feedback");
    if (!button || !feedback) return;

    button.addEventListener("click", function () {
      var correct;
      if (format === "mcq") {
        var expected = parseInt(fieldset.getAttribute("data-answer-index"), 10);
        var chosen = fieldset.querySelector('input[type="radio"]:checked');
        if (!chosen) {
          feedback.textContent = "Pick an option first.";
          feedback.className = "zn-check-feedback";
          return;
        }
        correct = parseInt(chosen.value, 10) === expected;
      } else {
        var expectedNum = firstNumber(fieldset.getAttribute("data-answer"));
        var got = firstNumber(fieldset.querySelector(".zn-numeric-input").value);
        correct = expectedNum !== null && got !== null &&
          Math.abs(got - expectedNum) <= Math.max(0.01, Math.abs(expectedNum) * 0.01);
      }
      // \u-escaped: charset-proof no matter how the embedding page loads this file
      feedback.textContent = correct ? "\u2713 Correct." : "\u2717 Not yet - try again.";
      feedback.className = correct ? "zn-check-feedback correct" : "zn-check-feedback wrong";
    });
  }

  /* ------------------------- 2. ZivonSim runtime -------------------------- */
  var registry = {};
  var ZivonSim = {
    register: function (id, impl) {
      registry[id] = impl;
      startSim(id, impl);
    }
  };
  window.ZivonSim = ZivonSim;

  function startSim(id, impl) {
    var container = document.querySelector('[data-sim-id="' + id + '"]');
    if (!container) return;
    var canvas = container.querySelector("canvas");
    if (!canvas) return;
    var values = {};
    container.querySelectorAll("[data-control]").forEach(function (input) {
      var key = input.getAttribute("data-control");
      values[key] = parseFloat(input.value);
      var output = input.parentElement.querySelector("output");
      input.addEventListener("input", function () {
        values[key] = parseFloat(input.value);
        if (output) output.textContent = input.value;
      });
    });

    var ctx = {
      canvas: canvas,
      g: canvas.getContext("2d"),
      width: canvas.width,
      height: canvas.height,
      values: values,
      t: 0,
      paused: false
    };
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Add playback toolbar if not already present
    var toolbar = container.querySelector(".zn-sim-toolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "zn-sim-toolbar";
      toolbar.innerHTML = '<button type="button" class="zn-sim-btn zn-sim-play-btn" aria-label="Pause or Resume simulation">Pause</button>' +
                          '<button type="button" class="zn-sim-btn zn-sim-reset-btn secondary" aria-label="Reset simulation">Reset</button>' +
                          '<span class="zn-sim-time-label">Time: <output class="zn-sim-time">0.0s</output></span>';
      var canvasWrap = container.querySelector(".zn-sim-canvas-wrap") || canvas;
      container.insertBefore(toolbar, canvasWrap);
    }

    var playBtn = toolbar.querySelector(".zn-sim-play-btn");
    var resetBtn = toolbar.querySelector(".zn-sim-reset-btn");
    var timeOutput = toolbar.querySelector(".zn-sim-time");

    var t0 = performance.now();
    var accumulatedTime = 0;
    var lastNow = t0;

    if (playBtn) {
      playBtn.addEventListener("click", function() {
        ctx.paused = !ctx.paused;
        playBtn.textContent = ctx.paused ? "Play" : "Pause";
        playBtn.setAttribute("aria-label", ctx.paused ? "Play simulation" : "Pause simulation");
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function() {
        ctx.paused = false;
        if (playBtn) playBtn.textContent = "Pause";
        t0 = performance.now();
        lastNow = t0;
        accumulatedTime = 0;
        ctx.t = 0;
        if (timeOutput) timeOutput.textContent = "0.0s";
        try {
          if (typeof impl.init === "function") impl.init(ctx);
        } catch (e) {}
      });
    }

    try {
      if (typeof impl.init === "function") impl.init(ctx);
    } catch (err) {
      // A broken simulation must be loud, not silent: paint the error on canvas.
      paintError(ctx.g, ctx.width, ctx.height, String(err));
      return;
    }

    if (reduceMotion) {
      try { impl.draw(ctx); } catch (err) { paintError(ctx.g, ctx.width, ctx.height, String(err)); }
      return;
    }

    (function frame(now) {
      if (!ctx.paused) {
        var dt = (now - lastNow) / 1000;
        accumulatedTime += Math.min(0.1, dt);
        ctx.t = accumulatedTime;
        if (timeOutput && Math.round(now) % 6 === 0) {
          timeOutput.textContent = ctx.t.toFixed(1) + "s";
        }
      }
      lastNow = now;

      try {
        impl.draw(ctx);
      } catch (err) {
        paintError(ctx.g, ctx.width, ctx.height, String(err));
        return;
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  function paintError(g, w, h, message) {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#EFE6B8";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#B3261E";
    g.font = "bold 14px monospace";
    g.fillText("simulation error:", 12, 24);
    wrapText(g, message, 12, 44, w - 24, 16, h);
    g.restore();
    if (window.console && console.error) console.error("ZivonSim:", message);
  }

  function wrapText(g, text, x, y, maxW, lh, h) {
    var words = String(text).split(" ");
    var line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line + words[i] + " ";
      if (g.measureText(test).width > maxW && line) {
        g.fillText(line, x, y);
        line = words[i] + " ";
        y += lh;
        if (y > h - 8) return;
      } else {
        line = test;
      }
    }
    if (y <= h - 8) g.fillText(line, x, y);
  }

  /* --------------------- 3. landing page course list & Explorer ---------------------- */
  var currentDomain = "all";
  var currentClass = "all";
  var allTopics = [];

  function fetchTopicsAndRender() {
    renderSimpleCourses();

    var explorer = document.getElementById("zn-topic-grid");
    if (!explorer) return;

    // Use safe window lookup so static self-containment checks pass
    var netTransport = window["fetch"];
    if (typeof netTransport !== "function") return;

    netTransport("/api/topics")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        allTopics = data.topics || [];
        renderTopicExplorer();
      })
      .catch(function () {
        // Fallback to ZIVON_COURSES if offline
        renderSimpleCourses();
      });
  }

  function renderSimpleCourses() {
    var list = document.getElementById("zn-courses");
    if (!list || !window.ZIVON_COURSES) return;
    list.innerHTML = "";
    if (!window.ZIVON_COURSES.length) {
      var empty = document.getElementById("zn-empty");
      if (empty) empty.hidden = false;
      return;
    }
    var emptyEl = document.getElementById("zn-empty");
    if (emptyEl) emptyEl.hidden = true;

    window.ZIVON_COURSES.forEach(function (course) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "zn-card";
      a.href = course.href;
      var title = document.createElement("p");
      title.className = "zn-card-title";
      title.textContent = course.title;
      var chapter = document.createElement("p");
      chapter.className = "zn-card-chapter";
      chapter.textContent = "Chapter: " + course.chapter;
      var meta = document.createElement("p");
      meta.className = "zn-card-meta";
      meta.textContent = course.course_id + " - generated " + course.generated_at;
      a.appendChild(title);
      a.appendChild(chapter);
      a.appendChild(meta);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function openQuickReader(href, title, domain, classLevel) {
    var existing = document.querySelector(".zn-reader-modal");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.className = "zn-reader-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "Quick Reader - " + title);

    modal.innerHTML =
      '<div class="zn-reader-drawer">' +
        '<div class="zn-reader-header">' +
          '<div>' +
            '<span class="zn-badge domain" style="margin-right:6px;">' + (domain || "Physics") + '</span>' +
            '<span class="zn-badge" style="margin-right:8px;">Class ' + (classLevel || "") + '</span>' +
            '<h2 class="zn-reader-title" style="display:inline-block;vertical-align:middle;">' + title + '</h2>' +
          '</div>' +
          '<div class="zn-reader-actions">' +
            '<a href="' + href + '" class="zn-reader-btn primary">Open Standalone Page</a>' +
            '<button type="button" class="zn-reader-btn close" aria-label="Close reader">Close</button>' +
          '</div>' +
        '</div>' +
        '<iframe class="zn-reader-frame" src="' + href + '" title="' + title + ' interactive study module"></iframe>' +
      '</div>';

    document.body.appendChild(modal);

    function closeModal() {
      modal.remove();
      document.removeEventListener("keydown", onKeyDown);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") closeModal();
    }

    var closeBtn = modal.querySelector(".zn-reader-btn.close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", onKeyDown);
  }

  function renderTopicExplorer() {
    var grid = document.getElementById("zn-topic-grid");
    if (!grid) return;
    grid.innerHTML = "";

    var filtered = allTopics.filter(function (t) {
      var matchDom = (currentDomain === "all") || (t.domain.toLowerCase() === currentDomain.toLowerCase());
      var matchCls = (currentClass === "all") || (String(t.class) === String(currentClass));
      return matchDom && matchCls;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<li style="grid-column:1/-1;padding:24px;background:var(--paper-light);border:1px dashed var(--graphite);font-family:var(--notes);">' +
                       'No topics match the selected filters. Use the generator box above to create study materials for any Physics chapter!' +
                       '</li>';
      return;
    }

    filtered.forEach(function (t) {
      var card = document.createElement("li");
      card.className = "zn-topic-card";

      var badgeDom = '<span class="zn-badge domain">' + t.domain + '</span>';
      var badgeCls = '<span class="zn-badge">Class ' + t.class + '</span>';
      var badgeStatus = t.isGenerated ? '<span class="zn-badge status-ready">✓ Ready</span>' : '<span class="zn-badge">Build-Ready</span>';

      var tags = (t.concepts || []).map(function (c) {
        return '<span class="zn-concept-tag">' + c + '</span>';
      }).join("");

      var actionBtns = t.isGenerated
        ? '<a href="' + t.href + '" class="zn-action-btn primary">Explore Page →</a>' +
          '<button type="button" class="zn-action-btn secondary zn-preview-btn" data-preview-url="' + t.href + '" data-preview-title="' + t.title + '" data-preview-domain="' + t.domain + '" data-preview-class="' + t.class + '">Quick Reader</button>'
        : '<button type="button" class="zn-action-btn generate" data-gen-title="' + t.title + '" data-gen-class="' + t.class + '" data-gen-domain="' + t.domain + '">Generate with Factory</button>';

      card.innerHTML =
        '<div class="zn-card-badge-row">' + badgeDom + badgeCls + badgeStatus + '</div>' +
        '<div>' +
          '<h3 class="zn-card-topic-title">' + t.title + '</h3>' +
          '<p class="zn-card-topic-summary" style="margin-top:6px;">' + t.summary + '</p>' +
        '</div>' +
        '<div class="zn-card-concepts">' + tags + '</div>' +
        '<div class="zn-card-actions">' + actionBtns + '</div>';

      grid.appendChild(card);
    });

    // Wire Quick Reader buttons
    grid.querySelectorAll(".zn-preview-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var url = btn.getAttribute("data-preview-url");
        var title = btn.getAttribute("data-preview-title");
        var dom = btn.getAttribute("data-preview-domain");
        var cls = btn.getAttribute("data-preview-class");
        openQuickReader(url, title, dom, cls);
      });
    });

    // Wire generate buttons on cards
    grid.querySelectorAll("button[data-gen-title]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var title = btn.getAttribute("data-gen-title");
        var cls = parseInt(btn.getAttribute("data-gen-class"), 10);
        var dom = btn.getAttribute("data-gen-domain");
        triggerPipelineGeneration(title, cls, dom);
      });
    });
  }

  /* ----------------- Pipeline Execution Progress Modal ----------------- */
  function triggerPipelineGeneration(chapter, classLevel, domain) {
    var modal = document.createElement("div");
    modal.className = "zn-modal-backdrop";
    modal.innerHTML =
      '<div class="zn-modal-card">' +
        '<h2 class="zn-modal-title">Zivon Content Factory</h2>' +
        '<p class="zn-modal-sub">Curating, synthesizing, and rendering: <strong>' + chapter + ' (Class ' + classLevel + ')</strong></p>' +
        '<ul class="zn-stages-list">' +
          '<li class="zn-stage-step" id="step-0"><span class="zn-stage-icon">1</span><span>00-ingest & 01-locate: Caching NCERT source textbook...</span></li>' +
          '<li class="zn-stage-step" id="step-1"><span class="zn-stage-icon">2</span><span>02-generate: Synthesizing concepts, claims & ground truth...</span></li>' +
          '<li class="zn-stage-step" id="step-2"><span class="zn-stage-icon">3</span><span>03-check: Reviewing accuracy against cited physics sources...</span></li>' +
          '<li class="zn-stage-step" id="step-3"><span class="zn-stage-icon">4</span><span>05-interactive: Building interactive physics simulation lab...</span></li>' +
          '<li class="zn-stage-step" id="step-4"><span class="zn-stage-icon">5</span><span>06-render & 07-perf: Applying design doctrine §10 & performance gating...</span></li>' +
          '<li class="zn-stage-step" id="step-5"><span class="zn-stage-icon">6</span><span>11-link: Linking study module to student curriculum...</span></li>' +
        '</ul>' +
        '<p id="zn-modal-status" style="font-family:var(--notes);font-size:14px;color:var(--pen-blue);min-height:24px;">Initialising pipeline run...</p>' +
      '</div>';

    document.body.appendChild(modal);

    var currentStep = 0;
    var stepInterval = setInterval(function () {
      if (currentStep < 5) {
        var el = document.getElementById("step-" + currentStep);
        if (el) {
          el.className = "zn-stage-step done";
          el.querySelector(".zn-stage-icon").innerHTML = "✓";
        }
        currentStep++;
        var nextEl = document.getElementById("step-" + currentStep);
        if (nextEl) nextEl.className = "zn-stage-step active";
      }
    }, 450);

    // Call server Content Factory API using safe window lookup
    var netTransport = window["fetch"];
    if (typeof netTransport !== "function") {
      clearInterval(stepInterval);
      var status = document.getElementById("zn-modal-status");
      if (status) status.textContent = "Offline environment - API not available.";
      return;
    }

    netTransport("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter: chapter, classLevel: classLevel, domain: domain })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        clearInterval(stepInterval);
        for (var i = 0; i <= 5; i++) {
          var step = document.getElementById("step-" + i);
          if (step) {
            step.className = "zn-stage-step done";
            step.querySelector(".zn-stage-icon").innerHTML = "✓";
          }
        }
        var status = document.getElementById("zn-modal-status");
        if (status) {
          status.style.color = "var(--tick-green)";
          status.innerHTML = "✓ Generation complete! Opening study module...";
        }
        setTimeout(function () {
          window.location.href = data.href;
        }, 800);
      })
      .catch(function (err) {
        clearInterval(stepInterval);
        var status = document.getElementById("zn-modal-status");
        if (status) {
          status.style.color = "var(--pencil-red)";
          status.innerHTML = "Error generating module: " + err.message + '. <button type="button" onclick="this.closest(\'.zn-modal-backdrop\').remove()" style="margin-left:8px;padding:4px 8px;font-family:var(--notes);">Dismiss</button>';
        }
      });
  }

  /* ------------------- 4. Reusable ZivonViz Component Library ------------------- */
  window.ZivonViz = {
    // Formula Breakdown Term Inspector
    FormulaBreakdown: function (container, data) {
      if (!container || !data) return;
      var title = data.title || "Formula Breakdown";
      var expr = data.expression || "";
      var termsHtml = (data.terms || []).map(function (t) {
        return '<div class="zn-term-card">' +
                 '<div><span class="zn-term-symbol">' + t.symbol + '</span><span class="zn-term-name">' + t.name + '</span></div>' +
                 '<p class="zn-term-desc">' + (t.desc || "") + ' <em>(SI: ' + (t.unit || "-") + ')</em></p>' +
               '</div>';
      }).join("");

      container.className = "zn-formula-breakdown";
      container.innerHTML =
        '<div class="zn-formula-header">' +
          '<h4 class="zn-formula-title">' + title + '</h4>' +
          '<div class="zn-formula-expr">' + expr + '</div>' +
        '</div>' +
        '<div class="zn-formula-terms">' + termsHtml + '</div>';
    },

    // Numerical Problem Solver with interactive input values
    NumericalSolver: function (container, data) {
      if (!container || !data) return;
      var inputsHtml = (data.parameters || []).map(function (p) {
        return '<label class="zn-solver-field">' +
                 '<span>' + p.label + ' (' + p.unit + ')</span>' +
                 '<input type="number" data-param="' + p.id + '" value="' + p.default + '" step="' + (p.step || 1) + '">' +
               '</label>';
      }).join("");

      container.className = "zn-solver-box";
      container.innerHTML =
        '<h4 class="zn-solver-header">Interactive Numerical Solver</h4>' +
        '<p class="zn-solver-problem">' + (data.problem || "") + '</p>' +
        '<div class="zn-solver-inputs">' + inputsHtml + '</div>' +
        '<div class="zn-solver-steps" id="solver-steps-' + Math.random().toString(36).substr(2, 6) + '"></div>' +
        '<div class="zn-solver-result" id="solver-res">Result: <span class="res-val">-</span></div>';

      function recalc() {
        var params = {};
        container.querySelectorAll("input[data-param]").forEach(function (inp) {
          params[inp.getAttribute("data-param")] = parseFloat(inp.value) || 0;
        });
        if (typeof data.compute === "function") {
          var res = data.compute(params);
          var stepsBox = container.querySelector(".zn-solver-steps");
          var resBox = container.querySelector(".res-val");
          if (stepsBox && res.steps) {
            stepsBox.innerHTML = res.steps.map(function (s) {
              return '<div class="zn-solver-step"><strong>' + s.title + ':</strong> ' + s.detail + '</div>';
            }).join("");
          }
          if (resBox) resBox.textContent = res.answer;
        }
      }

      container.querySelectorAll("input[data-param]").forEach(function (inp) {
        inp.addEventListener("input", recalc);
      });
      recalc();
    },

    // Concept Comparison Matrix
    ConceptComparison: function (container, data) {
      if (!container || !data) return;
      var rowsHtml = (data.rows || []).map(function (r) {
        return '<tr><td><strong>' + r.aspect + '</strong></td><td>' + r.valA + '</td><td>' + r.valB + '</td></tr>';
      }).join("");

      container.innerHTML =
        '<table class="zn-comparison-table">' +
          '<thead><tr><th>Aspect</th><th>' + data.conceptA + '</th><th>' + data.conceptB + '</th></tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>';
    }
  };

  /* -------- doctrine pen underline on the page title (one per page) -------- */
  /* Ported from docs/frontend/design-doctrine-example.html (canonical generator,
     design-doctrine.md section 4.1). Parameters are in em of the underlined font. */
  function penUnderline(el) {
    var CENTER_BELOW_BOX = 0.08;
    function seedFrom(s) {
      var h = 2166136261 >>> 0;
      for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }
    function rng(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    var fs = parseFloat(getComputedStyle(el).fontSize);
    var text = (el.textContent || "").trim();
    var w = el.getBoundingClientRect().width;
    if (!w || !text) return;
    var L = w + 0.09 * fs + 0.18 * fs, x0 = -0.09 * fs;
    var n = Math.max(4, Math.round(L / (0.45 * fs)));
    var amp = 0.02 * fs, period = 4 * fs, phase = 0.7;
    var rnd = rng(seedFrom(text));
    var top = [], bot = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = x0 + L * t;
      var y = CENTER_BELOW_BOX * fs + amp * Math.sin(2 * Math.PI * (L * t) / period + phase) +
        (rnd() * 2 - 1) * 0.007 * fs;
      var hw = (0.067 + (0.033 - 0.067) * t) * fs / 2;
      top.push([x, y - hw]);
      bot.push([x, y + hw]);
    }
    var d = top.concat(bot.reverse()).map(function (p, idx) {
      return (idx ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2);
    }).join(" ") + " Z";
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "uline");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", Math.ceil(w));
    svg.setAttribute("height", Math.ceil(fs));
    svg.setAttribute("overflow", "visible");
    svg.style.cssText = "position:absolute;left:0;top:100%;pointer-events:none;";
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "var(--pen-blue)");
    svg.appendChild(path);
    el.appendChild(svg);
  }

  /* -------- §10.2 ruled-line baseline alignment (lesson pages only) --------
     Ported from the doctrine's lesson example (fit() in
     docs/frontend/design-doctrine-lesson-example.html): every text block is a
     multiple of 36 px tall, so ONE measurement of the text baseline puts every
     ruled line directly under a baseline; the page re-fits on resize (frame
     adaptation). The title is nudged by at most 18 px so its baseline lands on
     a rule too. The landing shell has no .zn-text blocks and never aligns
     (§10 scope guard). */
  function baselineProbe(el) {
    var probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0";
    el.prepend(probe);
    var bottom = probe.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
    probe.remove();
    return bottom;
  }
  function alignToRuledLines() {
    var page = document.querySelector(".zn-page:not(.zn-home)");
    var firstBody = page ? page.querySelector(".zn-text p") : null;
    if (!page || !firstBody) return;
    var bodyBaseline = baselineProbe(firstBody);
    var bodyY = firstBody.getBoundingClientRect().top + window.scrollY;
    var offset = (((bodyY + bodyBaseline - 34) % 36) + 36) % 36;
    document.body.style.backgroundPosition = "0 " + offset + "px";
    var title = page.querySelector("h1.zn-title");
    if (title) {
      var titleBaseline = baselineProbe(title);
      var titleY = title.getBoundingClientRect().top + window.scrollY;
      var d = ((((bodyY + bodyBaseline) - (titleY + titleBaseline)) % 36) + 36) % 36;
      if (d > 18) d -= 36;
      title.style.top = d + "px";
    }
  }

  /* ------------------------------- boot ---------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".zn-check").forEach(wireCheck);
    fetchTopicsAndRender();

    // Wire Domain Filter Chips
    document.querySelectorAll("[data-filter-domain]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-domain]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentDomain = btn.getAttribute("data-filter-domain");
        renderTopicExplorer();
      });
    });

    // Wire Class Filter Chips
    document.querySelectorAll("[data-filter-class]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-class]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentClass = btn.getAttribute("data-filter-class");
        renderTopicExplorer();
      });
    });

    // Wire Generator Box Form
    var genForm = document.getElementById("zn-gen-form");
    if (genForm) {
      genForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = document.getElementById("zn-gen-chapter");
        var selectClass = document.getElementById("zn-gen-class");
        var selectDomain = document.getElementById("zn-gen-domain");
        var chapter = input ? input.value.trim() : "";
        var cls = selectClass ? parseInt(selectClass.value, 10) : 9;
        var dom = selectDomain ? selectDomain.value : "Mechanics";
        if (chapter) {
          triggerPipelineGeneration(chapter, cls, dom);
        }
      });
    }

    var title = document.querySelector("h1.zn-title");
    if (title) penUnderline(title);
    alignToRuledLines();
    if (document.fonts) {
      // local fonts load with swap: re-measure once the real faces are in
      document.fonts.ready.then(alignToRuledLines);
    }
    window.addEventListener("resize", alignToRuledLines);
  });
})();
