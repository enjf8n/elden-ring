/* ═══════════════════════════════════════
   THREE.JS — Optimized Golden Particle Field
   IntersectionObserver visibility guard,
   proper dispose on cleanup, FPS cap
   ═══════════════════════════════════════ */
(function () {
  "use strict";

  const canvas = document.getElementById("three-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  /* ── Config ── */
  const IS_MOBILE = matchMedia("(max-width: 768px)").matches;
  const PARTICLE_COUNT = IS_MOBILE ? 500 : 1600;
  const FPS_CAP = IS_MOBILE ? 30 : 60;
  const FRAME_INTERVAL = 1000 / FPS_CAP;

  /* ── Scene Setup ── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !IS_MOBILE, powerPreference: "low-power" });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  /* ── Golden Particles ── */
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const SPREAD = 12;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 2] = (Math.random() - 0.5) * 6;
    velocities[i3]     = (Math.random() - 0.5) * 0.002;
    velocities[i3 + 1] = Math.random() * 0.002 + 0.0008;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xD4AF37,
    size: IS_MOBILE ? 0.022 : 0.015,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Elden Ring Torus ── */
  const ringGeo = new THREE.TorusGeometry(1.6, 0.035, 24, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    transparent: true,
    opacity: 0.2
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.35;
  scene.add(ring);

  /* Shard fragments inside ring */
  const shardGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 / 5) * i;
    const shardGeo = new THREE.BoxGeometry(0.015, 0.25 + Math.random() * 0.25, 0.015);
    const shardMat = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.12 + Math.random() * 0.08
    });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    shard.position.set(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0);
    shard.rotation.z = angle + Math.PI / 2;
    shardGroup.add(shard);
  }
  ring.add(shardGroup);

  /* ── Visibility Guard (IntersectionObserver) ── */
  let isVisible = true;
  let animId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !animId) animate(performance.now());
    },
    { threshold: 0 }
  );
  observer.observe(canvas);

  /* ── Animation Loop ── */
  let lastTime = 0;
  const HALF_SPREAD = SPREAD / 2;

  function animate(time) {
    if (!isVisible) { animId = null; return; }
    animId = requestAnimationFrame(animate);

    /* FPS cap */
    if (time - lastTime < FRAME_INTERVAL) return;
    lastTime = time;

    /* Update particles */
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      /* Boundary wrap */
      if (Math.abs(pos[i3]) > HALF_SPREAD) velocities[i3] *= -1;
      if (pos[i3 + 1] > HALF_SPREAD) pos[i3 + 1] = -HALF_SPREAD;
      if (Math.abs(pos[i3 + 2]) > 3) velocities[i3 + 2] *= -1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    /* Ring rotation */
    ring.rotation.y += 0.0015;
    ring.rotation.z += 0.0004;

    /* Camera sway */
    camera.position.x = Math.sin(time * 0.0002) * 0.25;
    camera.position.y = Math.cos(time * 0.00015) * 0.15;

    renderer.render(scene, camera);
  }

  animId = requestAnimationFrame(animate);

  /* ── Debounced Resize ── */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }, 150);
  });

  /* ── Cleanup on page leave ── */
  window.addEventListener("pagehide", () => {
    if (animId) cancelAnimationFrame(animId);
    observer.disconnect();
    particleGeo.dispose();
    particleMat.dispose();
    ringGeo.dispose();
    ringMat.dispose();
    shardGroup.children.forEach((s) => { s.geometry.dispose(); s.material.dispose(); });
    renderer.dispose();
  });
})();
