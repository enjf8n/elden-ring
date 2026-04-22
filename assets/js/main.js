/* ═══════════════════════════════════════
   ELDEN RING — GLOBAL JS (v4 AAA Refactor)
   GSAP quickSetter cursor, Lenis sync,
   scroll-triggered reveals, page transitions
   ═══════════════════════════════════════ */
(function () {
  "use strict";

  /* Respect the user's reduced-motion preference */
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ CURSOR — GSAP quickSetter for 120 FPS ═══ */
  function initCursor() {
    const cursor = document.getElementById("cursor");
    if (!cursor || matchMedia("(pointer: coarse)").matches || prefersReducedMotion) return;

    /* Use GSAP quickSetter for sub-frame positioning */
    if (typeof gsap === "undefined") return;
    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");
    let mouse = { x: 0, y: 0 };

    document.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    /* Reveal cursor after first move */
    document.addEventListener("mousemove", function reveal() {
      document.body.classList.add("cursor-ready");
      document.removeEventListener("mousemove", reveal);
    });

    /* Smooth follow at ticker rate */
    let cx = 0, cy = 0;
    gsap.ticker.add(() => {
      cx += (mouse.x - cx) * 0.18;
      cy += (mouse.y - cy) * 0.18;
      xSet(cx - 12);
      ySet(cy - 12);
    });

    /* Hover effect on interactive elements */
    const hoverTargets = "a, button, .boss-card, .map-region, [data-hover]";
    document.addEventListener("mouseenter", (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.add("is-hover");
    }, true);
    document.addEventListener("mouseleave", (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.remove("is-hover");
    }, true);
  }

  /* ═══ HEADER SCROLL ═══ */
  function initHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const check = () => header.classList.toggle("is-scrolled", scrollY > 60);
    addEventListener("scroll", check, { passive: true });
    check();
  }

  /* ═══ MOBILE NAV ═══ */
  function initMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    /* Wire accessible attributes defensively — works even without markup updates */
    if (!toggle.hasAttribute("aria-controls")) toggle.setAttribute("aria-controls", nav.id || "mainNav");
    if (!toggle.hasAttribute("aria-expanded")) toggle.setAttribute("aria-expanded", "false");

    const sync = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", () => sync(!nav.classList.contains("is-open")));
    /* Close on link click */
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => sync(false))
    );
  }

  /* ═══ LENIS SMOOTH SCROLL ═══ */
  function initLenis() {
    if (typeof Lenis === "undefined" || prefersReducedMotion) return null;
    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.5
      });

      /* Sync Lenis → GSAP ScrollTrigger */
      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        /* Standalone fallback */
        (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
      }

      return lenis;
    } catch (e) { return null; }
  }

  /* ═══ GSAP SCROLL REVEALS ═══ */
  function initGSAP() {
    if (typeof gsap === "undefined") return;

    const hasST = typeof ScrollTrigger !== "undefined";
    if (hasST) gsap.registerPlugin(ScrollTrigger);

    const allAos = document.querySelectorAll("[data-aos]");

    /* Reduced motion: just show content instantly, no scroll-triggered fades/parallax */
    if (prefersReducedMotion) {
      allAos.forEach((el) => gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" }));
      return;
    }

    allAos.forEach((el) => {
      const inHero = el.closest(".hero");

      if (inHero) {
        /* Hero: animate immediately — staggered entrance */
        gsap.fromTo(el,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.15 }
        );
      } else if (hasST) {
        /* Below-fold: scroll-triggered */
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true }
          }
        );
      }
    });

    /* Hero parallax — gentle fade only */
    const heroContent = document.querySelector(".hero-content");
    if (heroContent && hasST) {
      gsap.to(heroContent, {
        y: -30,
        opacity: 0.7,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ═══ SPLIDE SLIDERS ═══ */
  function initSliders() {
    if (typeof Splide === "undefined") return;
    document.querySelectorAll(".splide").forEach((el) => {
      new Splide(el, {
        perPage: 3,
        gap: "20px",
        arrows: false,
        pagination: true,
        autoplay: true,
        interval: 4000,
        breakpoints: { 1024: { perPage: 2 }, 700: { perPage: 1 } }
      }).mount();
    });
  }

  /* ═══ PAGE TRANSITIONS ═══ */
  function initPageTransitions() {
    const overlay = document.getElementById("pageTransition");
    if (!overlay || prefersReducedMotion) return;

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("javascript") || link.target === "_blank") return;

      e.preventDefault();
      overlay.classList.add("is-entering");
      setTimeout(() => { location.href = href; }, 420);
    });
  }

  /* ═══ BOOT ═══ */
  initCursor();
  initHeader();
  initMobileNav();
  initLenis();
  initGSAP();
  initSliders();
  initPageTransitions();
})();
