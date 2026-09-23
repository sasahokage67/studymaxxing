---
name: modern-design
description: Guidelines and principles for modern UI/UX design, frontend aesthetics, typography, layouts, and micro-interactions. Use whenever discussing or writing frontend code, CSS, Tailwind, or user interfaces.
---

# Modern UI/UX & Frontend Standards (Anti-Slop)

This skill enforces high-end design craftsmanship and eliminates generic AI-generated aesthetic clichés.

## 1. Visual Anti-Patterns (ЧТО КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО)
- **AI Purple Cliché:** Никаких фиолетово-синих градиентов на темном фоне, неоновых размытий и псевдо-киберпанка.
- **Icon in a Bubble:** Запрещены разноцветные круглые плашки под иконками (пастельный розовый/синий кружок с SVG иконкой по центру).
- **Giant Shadows:** Никаких `shadow-2xl` без четкого контура. Тени должны быть тонкими или заменяться границами (`border`).
- **Low-density fluff:** Огромные отступы `p-20` с тремя словами текста посреди экрана.
- **Card Overload:** Не оборачивать каждый элемент в отдельную карточку с рамкой. Использовать визуальные разделители и типографику.

## 2. Typography & Layout Architecture
- **Font Stack:**
  - Sans: Geist, Inter, Plus Jakarta Sans.
  - Mono: JetBrains Mono, Geist Mono (для таймеров, метрик, процентов, кода).
- **Headings:**
  - `tracking-tight` или `tracking-tighter` для заголовков H1/H2.
  - Контраст весов: `font-semibold` / `font-bold` для заголовков против `font-normal text-muted-foreground` для пояснений.
- **Density & Grid:**
  - Bento Grids с четкими семантическими пропорциями (например, 2:1, 1:1:1).
  - Использовать `gap-3` или `gap-4` вместо гигантских пробелов.

## 3. Color & Contrast Rules
- **Dark Mode First:**
  - Background: глубокий нейтральный черный (`#09090b` / `zinc-950`), панель: `#121215` / `zinc-900`.
  - Borders: субтильные, полупрозрачные (`border-white/[0.08]`).
  - Text: Primary `#f4f4f5`, Secondary `#a1a1aa`, Muted `#71717a`.
- **Accent Color:**
  - Ровно ОДИН яркий функциональный акцент на экран (например, индиго `#6366f1`, изумруд `#10b981`, или сигнальный оранжевый `#f97316` для таймера).

## 4. Interaction & Motion
- **Button States:**
  - Default -> Hover (осветление на 5%) -> Active (subtle scale-down `active:scale-[0.98]`).
  - Фокус: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none`.
- **Micro-transitions:** 
  - `transition-all duration-150 ease-out`. Без затянутых и тормозящих анимаций.
- **Status Indicators:**
  - Пульсирующие индикаторы для Live-состояний (микрофон, запись, 15-секундный таймер).
