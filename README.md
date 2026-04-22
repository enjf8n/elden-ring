# Elden Ring — Путешествие в Междуземье

Иммерсивный мультистраничный фан‑трибьют игре **Elden Ring** и её DLC **Shadow of the Erdtree**.
Тёмно‑фэнтезийная дизайн‑система, кинематографичные оверлеи, 3D‑фон и кастомный курсор
на GSAP — всё на чистом HTML/CSS/JS, без сборщиков и фреймворков.

🌐 **Live demo:** https://enjf8n.github.io/elden-ring/

---

## Что внутри

Пять связанных страниц, объединённых единым дизайн‑языком и плавными переходами:

| Страница           | Файл              | Про что                                                    |
| ------------------ | ----------------- | ---------------------------------------------------------- |
| Пролог             | `index.html`      | Hero, история создания, геймплейные столпы, таймлайн       |
| Междуземье         | `world.html`      | Интерактивный SVG‑атлас мира с зумом по регионам           |
| Бестиарий          | `bosses.html`     | Bento‑сетка боссов с динамической сменой фонового арта     |
| DLC                | `shadow.html`     | Shadow of the Erdtree: прогрессия, статистика, обратный отсчёт |
| Социум             | `community.html`  | Индустрия, сообщество, исторический таймлайн жанра souls‑like |

## Стек

- **HTML5** (семантическая разметка, Schema.org JSON‑LD, Open Graph)
- **CSS3** — CSS custom properties, Grid + Flexbox, `clamp()`‑типографика, glassmorphism, анимированный grain + виньетка
- **JavaScript (ES6+)** — ванильный, без сборщика
- **[GSAP](https://gsap.com/)** + ScrollTrigger — scroll‑reveals, параллакс, `quickSetter` для 120 FPS курсора
- **[Lenis](https://lenis.darkroom.engineering/)** — инерционный скролл, синхронизированный с ScrollTrigger
- **[Three.js](https://threejs.org/)** — WebGL‑слой для частиц фона
- **[Splide.js](https://splidejs.com/)** — слайдеры
- **Google Fonts** — Cinzel Decorative, Cinzel, Marcellus, JetBrains Mono

Все библиотеки подгружаются по CDN — репозиторий чисто статический.

## Ключевые технические решения

- **Токенная дизайн‑система** — палитра «Abyss / Gold», типографика и spacing как CSS‑переменные; перестроить тему можно в десятке значений.
- **Z‑index scale** — явная шкала: оверлеи (1–2) → хедер (9995) → модалка (9996) → page‑transition (9998) → курсор (9999). Никакого случайного `z-index: 999999`.
- **Отказоустойчивый курсор** — `cursor: none` включается только когда JS поставил `body.cursor-ready`; если GSAP не прогрузился, пользователь видит нативный курсор.
- **`prefers-reduced-motion`** — если ОС просит меньше анимаций: выключаем Lenis, GSAP reveals, кастомный курсор, WebGL‑фон, page‑transitions.
- **`pointer: coarse`** — на тач‑устройствах кастомный курсор автоматически скрывается.
- **SEO** — JSON‑LD Article + BreadcrumbList, OG‑метатеги, русский `lang`.
- **Доступность** — `aria-expanded`/`aria-controls` на мобильной навигации, `aria-label` на бургере.

## Запуск локально

Любой статический сервер подойдёт. Самое простое:

```bash
git clone https://github.com/enjf8n/elden-ring.git
cd elden-ring
python3 -m http.server 8765
# открыть http://localhost:8765/
```

Или с Node:

```bash
npx serve .
```

## Структура

```
elden-ring/
├── index.html          # Пролог
├── world.html          # Междуземье (SVG‑атлас)
├── bosses.html         # Бестиарий
├── shadow.html         # Shadow of the Erdtree
├── community.html      # Социум
└── assets/
    ├── css/main.css    # Дизайн‑система, все страницы
    ├── js/main.js      # Курсор, Lenis, GSAP, мобильная навигация
    ├── js/map.js       # Логика SVG‑атласа (world.html)
    ├── js/bosses.js    # Смена фона по hover (bosses.html)
    └── img/            # Статика и текстуры UI
```

## Лицензия

Код под [MIT](LICENSE). Elden Ring, Shadow of the Erdtree и связанные материалы
принадлежат **FromSoftware, Inc.** и **Bandai Namco Entertainment Inc.** —
это некоммерческий фан‑проект.
