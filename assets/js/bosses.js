/* ═══════════════════════════════════════
   BOSSES — GSAP Cross-Fade Background
   Smooth transitions between boss arenas
   ═══════════════════════════════════════ */
(function () {
  "use strict";

  const bgOverlay = document.getElementById("bossBg");
  if (!bgOverlay) return;

  const hasGSAP = typeof gsap !== "undefined";
  let activeCard = null;

  /* Preload images for instant swap */
  document.querySelectorAll(".boss-card[data-boss-bg]").forEach((card) => {
    const img = new Image();
    img.src = card.dataset.bossBg;
  });

  function showBg(url) {
    bgOverlay.style.backgroundImage = `url(${url})`;

    if (hasGSAP) {
      gsap.to(bgOverlay, { opacity: 0.18, duration: 0.8, ease: "power2.out" });
    } else {
      bgOverlay.classList.add("is-active");
    }
  }

  function hideBg() {
    if (hasGSAP) {
      gsap.to(bgOverlay, { opacity: 0, duration: 0.6, ease: "power2.in" });
    } else {
      bgOverlay.classList.remove("is-active");
    }
  }

  const isTouch = matchMedia("(pointer: coarse)").matches;

  document.querySelectorAll(".boss-card[data-boss-bg]").forEach((card) => {
    if (isTouch) {
      /* Touch: tap to toggle */
      card.addEventListener("click", () => {
        if (activeCard === card) {
          hideBg();
          activeCard = null;
        } else {
          showBg(card.dataset.bossBg);
          activeCard = card;
        }
      });
    } else {
      /* Desktop: hover */
      card.addEventListener("mouseenter", () => showBg(card.dataset.bossBg));
      card.addEventListener("mouseleave", () => hideBg());
    }
  });
})();
