ZivonSim.register('b-03', {
  init: function(ctx) {
    ctx.ready = true;
  },
  draw: function(ctx) {
    var canvas = ctx.canvas, g = ctx.g;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    var W = canvas.clientWidth || ctx.width || 480;
    var H = canvas.clientHeight || ctx.height || 288;
    var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var PAPER_LIGHT = '#F6F0CF', PAPER = '#EFE6B8', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E', RED = '#B3261E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    var u = parseFloat(ctx.values.object_distance || 36);
    var f = parseFloat(ctx.values.focal_length || 18);

    // Thin lens formula: 1/f = 1/v - 1/u (with u negative)
    // 1/v = 1/f + 1/(-u) = 1/f - 1/u => v = (u * f) / (u - f)
    var v = (u !== f) ? (u * f) / (u - f) : 9999;
    var m = (u !== 0) ? -v / u : 1;

    var scale = 3.6;
    var cx = W * 0.52;
    var cy = H * 0.55;

    // Principal Axis
    g.beginPath();
    g.moveTo(20, cy);
    g.lineTo(W - 20, cy);
    g.strokeStyle = GRAPHITE;
    g.lineWidth = 1.5;
    g.setLineDash([4, 4]);
    g.stroke();
    g.setLineDash([]);

    // Convex Lens shape
    g.fillStyle = 'rgba(31, 58, 158, 0.12)';
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.beginPath();
    g.ellipse(cx, cy, 14, 90, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Mark Focal points
    var fPx = f * scale;
    g.fillStyle = INK;
    g.beginPath(); g.arc(cx - fPx, cy, 3, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(cx + fPx, cy, 3, 0, Math.PI*2); g.fill();
    g.font = '700 13px Caveat, cursive';
    g.textAlign = 'center';
    g.fillText('F₁', cx - fPx, cy + 18);
    g.fillText('F₂', cx + fPx, cy + 18);
    g.fillText('O', cx, cy + 18);

    // Object
    var objH = 40;
    var ox = cx - (u * scale);
    g.beginPath();
    g.moveTo(ox, cy);
    g.lineTo(ox, cy - objH);
    g.strokeStyle = INK;
    g.lineWidth = 3.5;
    g.stroke();
    // Arrowhead
    g.beginPath();
    g.moveTo(ox - 5, cy - objH + 8);
    g.lineTo(ox, cy - objH);
    g.lineTo(ox + 5, cy - objH + 8);
    g.fillStyle = INK;
    g.fill();
    g.fillText('Obj', ox, cy - objH - 6);

    // Image
    var imgH = objH * m;
    var ix = cx + (v * scale);
    if (Math.abs(v) < 150) {
      g.beginPath();
      g.moveTo(ix, cy);
      g.lineTo(ix, cy + imgH);
      g.strokeStyle = (v > 0) ? RED : '#2F6B2F';
      g.lineWidth = 3;
      g.stroke();
      // Arrowhead
      var sgn = (imgH >= 0) ? 1 : -1;
      g.beginPath();
      g.moveTo(ix - 5, cy + imgH - sgn*8);
      g.lineTo(ix, cy + imgH);
      g.lineTo(ix + 5, cy + imgH - sgn*8);
      g.fillStyle = (v > 0) ? RED : '#2F6B2F';
      g.fill();
      g.fillText((v > 0 ? 'Real Img' : 'Virt Img'), ix, cy + imgH + (sgn > 0 ? 16 : -8));
    }

    // Ray 1: Parallel to axis then through F2
    g.strokeStyle = PEN_BLUE;
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(ox, cy - objH);
    g.lineTo(cx, cy - objH);
    g.lineTo(cx + fPx * 2.5, cy - objH + ((cy - (cy - objH)) / fPx) * fPx * 2.5);
    g.stroke();

    // Ray 2: Straight through optical center O
    g.beginPath();
    g.moveTo(ox, cy - objH);
    g.lineTo(cx + (cx - ox), cy + objH);
    g.stroke();

    // Readout
    g.font = '700 13px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.fillStyle = INK;
    g.fillText('Object distance u = -' + u.toFixed(1) + ' cm', 20, 26);
    g.fillText('Focal length f = +' + f.toFixed(1) + ' cm', 20, 44);
    g.fillStyle = (v > 0) ? RED : '#2F6B2F';
    g.fillText('Image distance v = ' + (v !== 9999 ? v.toFixed(1) + ' cm (' + (v > 0 ? 'Real, Inverted' : 'Virtual, Erect') + ')' : 'Infinity'), 20, 62);
    g.fillText('Magnification m = ' + m.toFixed(2) + 'x', 20, 80);
  }
});

(function() {
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".zn-solver-box").forEach(function(box) {
      var type = box.getAttribute("data-solver-type");
      var stepsEl = box.querySelector(".zn-solver-steps");
      var resEl = box.querySelector(".res-val");
      var inputs = box.querySelectorAll("input[data-param]");

      function update() {
        var vals = {};
        inputs.forEach(function(inp) {
          vals[inp.getAttribute("data-param")] = parseFloat(inp.value) || 0;
        });

        if (type === "mechanics-net-force") {
          var F_app = vals.applied_force !== undefined ? vals.applied_force : 50;
          var F_fric = vals.friction_force !== undefined ? vals.friction_force : 10;
          var m = vals.mass !== undefined ? vals.mass : 20;
          var F_net = Math.max(0, F_app - F_fric);
          var a = m > 0 ? F_net / m : 0;
          var t = 3;
          var v = a * t;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Net Unbalanced Force:</strong> F_net = F_app - F_fric = ' + F_app + ' N - ' + F_fric + ' N = ' + F_net.toFixed(1) + ' N</div>' +
              '<div class="zn-solver-step"><strong>2. Resultant Acceleration:</strong> a = F_net / m = ' + F_net.toFixed(1) + ' N / ' + m + ' kg = ' + a.toFixed(2) + ' m/s²</div>' +
              '<div class="zn-solver-step"><strong>3. Final Velocity (t = 3s):</strong> v = u + at = 0 + (' + a.toFixed(2) + ')(3) = ' + v.toFixed(2) + ' m/s</div>';
          }
          if (resEl) resEl.textContent = 'a = ' + a.toFixed(2) + ' m/s², v(3s) = ' + v.toFixed(2) + ' m/s';
        } else if (type === "optics-lens") {
          var u = vals.u !== undefined ? vals.u : 30;
          var f = vals.f !== undefined ? vals.f : 15;
          var v = (u !== f) ? (u * f) / (u - f) : 9999;
          var m_mag = (u !== 0) ? -v / u : 1;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Lens Formula:</strong> 1/v = 1/f - 1/u &rArr; v = (u &times; f) / (u - f)</div>' +
              '<div class="zn-solver-step"><strong>2. Image Distance:</strong> v = (' + u + ' &times; ' + f + ') / (' + u + ' - ' + f + ') = ' + (v !== 9999 ? v.toFixed(1) + ' cm' : 'Infinity') + '</div>' +
              '<div class="zn-solver-step"><strong>3. Magnification:</strong> m = -v/u = ' + m_mag.toFixed(2) + 'x (' + (v > 0 ? 'Real, Inverted' : 'Virtual, Erect') + ')</div>';
          }
          if (resEl) resEl.textContent = 'v = ' + (v !== 9999 ? v.toFixed(1) + ' cm' : 'Infinity') + ', m = ' + m_mag.toFixed(2) + 'x';
        } else if (type === "electrostatics-coulomb") {
          var q1 = vals.q1 !== undefined ? vals.q1 : 2;
          var q2 = vals.q2 !== undefined ? vals.q2 : 3;
          var r = vals.r !== undefined ? vals.r : 0.3;
          var k = 8.99e9;
          var F = (r > 0) ? (k * (Math.abs(q1) * 1e-6) * (Math.abs(q2) * 1e-6)) / (r * r) : 0;
          var nature = (q1 * q2 > 0) ? "Repulsive" : "Attractive";
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Point Charges:</strong> q₁ = ' + q1 + ' μC, q₂ = ' + q2 + ' μC at distance r = ' + r + ' m</div>' +
              '<div class="zn-solver-step"><strong>2. Coulomb Law:</strong> F = (8.99 &times; 10⁹) &times; |' + q1 + ' &times; ' + q2 + '| &times; 10⁻¹² / (' + r + ')²</div>' +
              '<div class="zn-solver-step"><strong>3. Resultant Force:</strong> ' + F.toFixed(4) + ' N (' + nature + ')</div>';
          }
          if (resEl) resEl.textContent = 'F = ' + F.toFixed(4) + ' N (' + nature + ')';
        } else if (type === "waves-speed") {
          var freq = vals.freq !== undefined ? vals.freq : 256;
          var lambda = vals.lambda !== undefined ? vals.lambda : 1.3;
          var v = freq * lambda;
          var T = freq > 0 ? 1 / freq : 0;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Wave Speed Formula:</strong> v = f &times; &lambda;</div>' +
              '<div class="zn-solver-step"><strong>2. Computation:</strong> v = ' + freq + ' Hz &times; ' + lambda + ' m = ' + v.toFixed(1) + ' m/s</div>' +
              '<div class="zn-solver-step"><strong>3. Wave Period:</strong> T = 1/f = ' + (T * 1000).toFixed(2) + ' ms</div>';
          }
          if (resEl) resEl.textContent = 'v = ' + v.toFixed(1) + ' m/s (T = ' + (T * 1000).toFixed(2) + ' ms)';
        } else if (type === "thermo-first-law") {
          var Q = vals.Q !== undefined ? vals.Q : 500;
          var W = vals.W !== undefined ? vals.W : 200;
          var dU = Q - W;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. First Law Equation:</strong> &Delta;Q = &Delta;U + &Delta;W &rArr; &Delta;U = &Delta;Q - &Delta;W</div>' +
              '<div class="zn-solver-step"><strong>2. Thermodynamic Balance:</strong> &Delta;U = ' + Q + ' J - ' + W + ' J = ' + dU + ' J</div>' +
              '<div class="zn-solver-step"><strong>3. Internal Energy Change:</strong> ' + (dU >= 0 ? 'Increases by ' + dU + ' J (Heating)' : 'Decreases by ' + Math.abs(dU) + ' J (Cooling)') + '</div>';
          }
          if (resEl) resEl.textContent = '&Delta;U = ' + (dU >= 0 ? '+' : '') + dU + ' Joules';
        }
      }

      inputs.forEach(function(inp) {
        inp.addEventListener("input", update);
      });
      update();
    });
  });
})();