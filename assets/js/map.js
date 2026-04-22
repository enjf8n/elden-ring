/* ═══════════════════════════════════════
   MAP — Interactive SVG Atlas
   Animated viewBox zoom, parchment modal
   ═══════════════════════════════════════ */
(function () {
  "use strict";

  const regionData = {
    limgrave:     { title: "Лимгрейв",              text: "Зелёные равнины и руины, где начинается путь каждого Погасшего. Стормвиль — замок Годрика Привитого — возвышается над побережьем." },
    liurnia:      { title: "Лиурния Озёр",           text: "Туманные озёра и Академия Райя Лукарии. Ренналла, Королева Полной Луны, погружена в безумие перерождения." },
    caelid:       { title: "Каэлид",                 text: "Красные небеса, гниющие псы. В замке Рыжей Гривы генерал Радан ведёт бесконечную войну с Алой Гнилью." },
    altus:        { title: "Плато Альтус",           text: "Столица Лейнделл — золотой город у корней Древа Эрд. Последний оплот защитников Кольца." },
    underground:  { title: "Замогилье",              text: "Подземные города с искусственными звёздами. Нокрон и Нокстелла — цивилизации, что существовали до Древа." },
    volcano:      { title: "Вулкан Гельмир",         text: "Усадьба Вулкано. Рикард пожелал поглотить самих богов. Лава, змеи и тёмные ритуалы." },
    mountaintops: { title: "Горные Вершины Гигантов", text: "Замёрзшие пустоши. Огненный Гигант — последний страж Пламени Погребения." },
    farum:        { title: "Фарум-Азула",            text: "Парящие руины вне времени. Плацидусакс — двуглавый дракон, бывший Повелитель Элдена." }
  };

  const modal = document.getElementById("mapModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const modalClose = document.getElementById("modalClose");
  const svg = document.getElementById("worldMap");
  if (!modal || !svg) return;

  const hasGSAP = typeof gsap !== "undefined";
  const originalViewBox = svg.getAttribute("viewBox");

  /* ── Region Click → Zoom + Modal ── */
  document.querySelectorAll(".map-region").forEach((region) => {
    region.addEventListener("click", () => {
      const key = region.dataset.region;
      const data = regionData[key];
      if (!data) return;

      /* Animate viewBox to center on clicked region */
      if (hasGSAP) {
        const bbox = region.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        const targetVB = `${cx - 150} ${cy - 120} 300 240`;

        gsap.to(svg, {
          attr: { viewBox: targetVB },
          duration: 0.7,
          ease: "power3.out"
        });
      }

      /* Open modal with parchment entrance */
      modalTitle.textContent = data.title;
      modalText.textContent = data.text;
      modal.classList.add("is-open");

      if (hasGSAP) {
        const modalBox = modal.querySelector(".modal");
        gsap.fromTo(modalBox,
          { opacity: 0, scale: 0.95, y: 20, filter: "sepia(0.7) brightness(0.6)" },
          { opacity: 1, scale: 1, y: 0, filter: "sepia(0) brightness(1)", duration: 0.5, ease: "power2.out" }
        );
      }
    });
  });

  /* ── Close Modal → Reset viewBox ── */
  function closeModal() {
    modal.classList.remove("is-open");
    if (hasGSAP) {
      gsap.to(svg, {
        attr: { viewBox: originalViewBox },
        duration: 0.6,
        ease: "power2.inOut"
      });
    }
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
})();
