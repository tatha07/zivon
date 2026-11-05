ZivonSim.register('b-03', {
  init: function(ctx) {
    ctx.ready = true;
    ctx.blockPos = 0;
    ctx.velocity = 0;
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

    // Read values
    var F_app = parseFloat(ctx.values.applied_force !== undefined ? ctx.values.applied_force : (ctx.values.right_force || 24));
    var F_fric = parseFloat(ctx.values.friction_force !== undefined ? ctx.values.friction_force : (ctx.values.left_force || 8));
    var mass = parseFloat(ctx.values.mass || 4);

    var F_net = F_app - F_fric;
    var accel = F_net / mass;

    // Animate position
    if (!ctx.paused) {
      ctx.velocity += accel * 0.016;
      if (F_net <= 0 && ctx.velocity < 0) ctx.velocity = 0;
      ctx.blockPos += ctx.velocity * 0.8;
      if (ctx.blockPos > W - 100) ctx.blockPos = -20;
    }

    // Ground line
    var groundY = H * 0.65;
    g.beginPath();
    g.moveTo(20, groundY);
    g.lineTo(W - 20, groundY);
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.stroke();

    // Hatching under ground
    for (var x = 24; x < W - 20; x += 16) {
      g.beginPath();
      g.moveTo(x, groundY);
      g.lineTo(x - 8, groundY + 10);
      g.strokeStyle = GRAPHITE;
      g.lineWidth = 1.5;
      g.stroke();
    }

    // Moving Block
    var bx = Math.max(30, Math.min(W - 120, (W * 0.35) + (ctx.blockPos % (W * 0.5))));
    var bw = 70, bh = 46;
    var by = groundY - bh;

    g.fillStyle = PAPER;
    g.fillRect(bx, by, bw, bh);
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.strokeRect(bx, by, bw, bh);

    g.fillStyle = INK;
    g.font = '700 16px Caveat, cursive';
    g.textAlign = 'center';
    g.fillText(mass + ' kg', bx + bw/2, by + bh/2 + 5);

    // Force vectors
    function drawArrow(x1, y1, x2, y2, color, label) {
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.sqrt(dx*dx + dy*dy);
      if (len < 5) return;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.strokeStyle = color;
      g.lineWidth = 3;
      g.stroke();

      var angle = Math.atan2(dy, dx);
      var head = 10;
      g.beginPath();
      g.moveTo(x2, y2);
      g.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
      g.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
      g.closePath();
      g.fillStyle = color;
      g.fill();

      g.font = '700 13px "Courier Prime", monospace';
      g.fillStyle = color;
      g.fillText(label, (x1 + x2)/2, y1 - 8);
    }

    if (F_app > 0) drawArrow(bx + bw, by + bh/2, bx + bw + Math.min(120, F_app * 3), by + bh/2, PEN_BLUE, 'F_app = ' + F_app + 'N');
    if (F_fric > 0) drawArrow(bx, by + bh/2, bx - Math.min(80, F_fric * 3), by + bh/2, RED, 'Fric = ' + F_fric + 'N');

    // Net Force indicator bar
    g.font = '700 14px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.fillStyle = INK;
    g.fillText('Net Force F_net: ' + F_net.toFixed(1) + ' N', 24, 30);
    g.fillStyle = PEN_BLUE;
    g.fillText('Acceleration a = F/m: ' + accel.toFixed(2) + ' m/s²', 24, 52);
    g.fillStyle = GRAPHITE;
    g.fillText('Velocity: ' + ctx.velocity.toFixed(1) + ' m/s', 24, 74);
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