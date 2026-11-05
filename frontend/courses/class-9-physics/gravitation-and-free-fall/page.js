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