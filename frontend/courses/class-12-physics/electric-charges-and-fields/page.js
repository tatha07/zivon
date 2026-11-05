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

    var PAPER_LIGHT = '#F6F0CF', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E', RED = '#B3261E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    var q1 = parseFloat(ctx.values.charge_q1 !== undefined ? ctx.values.charge_q1 : 5);
    var q2 = parseFloat(ctx.values.charge_q2 !== undefined ? ctx.values.charge_q2 : -5);
    var r = parseFloat(ctx.values.separation_r !== undefined ? ctx.values.separation_r : 3);

    // Coulomb calculation F = k * |q1*q2| / r^2
    var k = 8.99; // in scaled units
    var forceMag = (k * Math.abs(q1 * q2)) / (r * r);
    var isRepulsive = (q1 * q2) > 0;

    var cy = H * 0.55;
    var cx = W / 2;
    var distPx = r * 30;
    var x1 = cx - distPx/2;
    var x2 = cx + distPx/2;

    // Draw field lines sketch
    g.strokeStyle = 'rgba(90, 87, 72, 0.25)';
    g.lineWidth = 1.2;
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      g.beginPath();
      g.moveTo(x1 + 18 * Math.cos(a), cy + 18 * Math.sin(a));
      g.lineTo(x1 + 45 * Math.cos(a), cy + 45 * Math.sin(a));
      g.stroke();
      g.beginPath();
      g.moveTo(x2 + 18 * Math.cos(a), cy + 18 * Math.sin(a));
      g.lineTo(x2 + 45 * Math.cos(a), cy + 45 * Math.sin(a));
      g.stroke();
    }

    // Charges
    function drawCharge(x, y, q, label) {
      var color = (q >= 0) ? RED : PEN_BLUE;
      g.beginPath();
      g.arc(x, y, 20, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 2;
      g.stroke();

      g.fillStyle = '#FFFFFF';
      g.font = '700 22px Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText((q >= 0 ? '+' : '−'), x, y);

      g.font = '700 13px "Courier Prime", monospace';
      g.fillStyle = INK;
      g.fillText(label + ' (' + q + 'μC)', x, y + 34);
    }

    drawCharge(x1, cy, q1, 'q₁');
    drawCharge(x2, cy, q2, 'q₂');

    // Force vectors
    var fLen = Math.min(65, forceMag * 4);
    var fDir1 = isRepulsive ? -1 : 1;
    var fDir2 = isRepulsive ? 1 : -1;

    function drawF(x, y, dir, col, text) {
      g.beginPath();
      g.moveTo(x, y - 26);
      g.lineTo(x + dir * fLen, y - 26);
      g.strokeStyle = col;
      g.lineWidth = 3;
      g.stroke();
      g.beginPath();
      g.moveTo(x + dir * fLen, y - 26);
      g.lineTo(x + dir * (fLen - 8), y - 30);
      g.lineTo(x + dir * (fLen - 8), y - 22);
      g.fillStyle = col;
      g.fill();
    }

    if (fLen > 2) {
      drawF(x1, cy, fDir1, isRepulsive ? RED : PEN_BLUE, 'F₁₂');
      drawF(x2, cy, fDir2, isRepulsive ? RED : PEN_BLUE, 'F₂₁');
    }

    // Readout
    g.font = '700 14px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = INK;
    g.fillText('Separation r = ' + r.toFixed(1) + ' m', 20, 20);
    g.fillStyle = isRepulsive ? RED : PEN_BLUE;
    g.fillText('Coulomb Force F = ' + forceMag.toFixed(2) + ' N (' + (isRepulsive ? 'REPULSIVE' : 'ATTRACTIVE') + ')', 20, 40);
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