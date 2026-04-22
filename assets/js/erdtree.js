/* ═══════════════════════════════════════
   ERDTREE — Soft Pollen Sprite Particles
   Assembly effect with sinusoidal turbulence,
   IntersectionObserver visibility guard
   ═══════════════════════════════════════ */
(function () {
  "use strict";

  const canvas = document.getElementById("erdtree-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const PARTICLE_COUNT = 180;
  let w, h, particles = [], assembled = false, isVisible = false;

  /* ── Generate Erdtree silhouette targets ── */
  function getTreeTargets(w, h) {
    const cx = w / 2;
    const pts = [];
    /* Trunk: narrow column */
    for (let i = 0; i < 16; i++) {
      pts.push({ x: cx + (Math.random() - 0.5) * 10, y: h - 30 - i * 9 });
    }
    /* Canopy: elliptical cloud */
    for (let i = pts.length; i < PARTICLE_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const rx = 50 + Math.random() * 90;
      const ry = 30 + Math.random() * 70;
      pts.push({
        x: cx + Math.cos(a) * rx,
        y: h * 0.28 + Math.sin(a) * ry * 0.5 - Math.random() * 35
      });
    }
    return pts;
  }

  /* ── Create soft radial gradient sprite (cached) ── */
  let spriteCanvas;
  function createSprite() {
    spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const sctx = spriteCanvas.getContext("2d");
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(212, 175, 55, 0.9)");
    grad.addColorStop(0.4, "rgba(212, 175, 55, 0.4)");
    grad.addColorStop(1, "rgba(212, 175, 55, 0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
  }
  createSprite();

  function resize() {
    const parent = canvas.parentElement;
    w = parent.clientWidth;
    h = 380;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function init() {
    resize();
    const targets = getTreeTargets(w, h);
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        tx: targets[i].x,
        ty: targets[i].y,
        size: 3 + Math.random() * 4,
        alpha: 0.3 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        /* Turbulence params (unique per particle) */
        freq: 0.5 + Math.random() * 1.5,
        amp: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  let frameTime = 0;

  function animate(time) {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      /* Sinusoidal turbulence — living magic feel */
      const turbX = Math.sin(time * 0.001 * p.freq + p.phase) * p.amp;
      const turbY = Math.cos(time * 0.0008 * p.freq + p.phase * 1.3) * p.amp * 0.7;

      if (assembled) {
        /* Ease toward target + turbulence overlay */
        p.x += (p.tx + turbX - p.x) * 0.025;
        p.y += (p.ty + turbY - p.y) * 0.025;
      } else {
        /* Free float + turbulence */
        p.x += p.vx + turbX * 0.1;
        p.y += p.vy + turbY * 0.1;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      /* Draw soft sprite */
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(spriteCanvas, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
    });

    ctx.globalAlpha = 1;
  }

  /* ── IntersectionObserver: assemble when footer visible ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;
      assembled = entry.isIntersecting;
    });
  }, { threshold: 0.15 });

  init();
  observer.observe(canvas);
  requestAnimationFrame(animate);

  /* ── Debounced Resize ── */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
})();
