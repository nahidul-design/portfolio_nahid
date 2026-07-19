# Design system — v2 (full redesign)

**This file replaces the previous version entirely.** The old system (Geist
single-family sans, warm-white/near-black/slate-blue tokens, the arc-shaped
home gallery) is discarded — none of it carries forward. If you find old
references to Geist, `--color-accent: #3d4a5c`, or the arc gallery anywhere
in code or in your own memory of this project, treat them as dead and
replace them; don't reconcile with them.

Source of truth for the new design is the Figma file below, not this
document — this file is a working record of what's been pulled from Figma
and verified, plus the structural decisions layered on top. Where a value
below isn't marked "verified," pull it from Figma with `get_design_context`
before implementing rather than guessing or reusing an old-system value.

**Figma file**: `https://www.figma.com/design/NhGgsN3qtvhzFMHQ0nP9IA/Test`
(fileKey `NhGgsN3qtvhzFMHQ0nP9IA`). Three top-level frames:

| Frame | Node ID | Contents |
|---|---|---|
| Hero | `96:5` | The single-page home design |
| Case Study — Template (Ledger) | `98:2` | The `/work/[slug]` template |
| 404 — Not Found | `99:27` | The custom 404 |

## Typeface

Three families, each with one job — verified against the actual Figma text
nodes, not inferred.

- **Kaushan Script** — wordmark only ("Nahidul Islam."). 24px, tracking
  `-0.96px` (-4% at that size). Regular weight. Never used for anything else
  on the site. *(verified: node `96:7`)*
- **Instrument Serif** — display headings. Set in **uppercase**, tight
  tracking (`-1.92px` at 96px ≈ -2%). Regular weight — hierarchy comes from
  size, not weight, since this family has no meaningful bold. *(verified:
  node `96:13`)*
  - **Two-tone opacity treatment**: within a multi-line display heading, the
    emphasized line sits at full ink opacity while the surrounding lines sit
    at `rgba(27, 30, 31, 0.55)`. On the hero statement ("Making /
    complicated things / feel obvious.") the middle line is full-strength
    and the first/third lines are the dimmed 55% — the eye lands on the
    center line first. Reproduce this per-line opacity split on every
    Instrument Serif display heading, not just the hero.
- **Barlow** — body copy and all UI text (labels, meta, nav links, buttons).
  **Tracking is -3% (`-0.03em`) on sentence-case text only** — verified at
  three sizes: 14px→`-0.42px`, 20px→`-0.6px`, 24px→`-0.72px`. *(nodes
  `96:8`, `98:14`, `96:75`)*
  - **Uppercase UI labels carry NO negative tracking** — they sit at 0.
    Verified on "CONTACT" (`96:10`), "PRODUCT DESIGNER" (`96:15`) and the
    meta-table labels, all 16px uppercase with no tracking value set. This
    is deliberate and typographically correct: uppercase needs the extra
    breathing room. An earlier draft of this file claimed -3% applied
    universally — it does not. Use `tracking-normal` on uppercase labels.
  - **Weight is the emphasis mechanism within a label.** Paired labels split
    Medium (500) + Regular (400): "**5+ years** of experience",
    "**Available** for work" — the Medium half also takes full ink while the
    Regular half sits at 60%. *(node `96:14`)*

Small uppercase labels (nav links, meta-table labels like "ROLE" /
"TIMELINE") are Barlow at 16px, uppercase, `rgba(27, 30, 31, 0.6)` — a
lighter, distinct muted tone from the display heading's 0.55 dim. Don't
conflate the two opacities; they're tuned differently for their contexts.

## Color

Only what's been sampled directly from layers so far:

- **Ink**: `#1b1e1f` — the one solid text/ink color seen everywhere (wordmark,
  full-opacity heading lines, meta-table values, hairline rules).
- **Muted text (UI/meta)**: `rgba(27, 30, 31, 0.6)` — nav location text,
  uppercase meta labels.
- **Dimmed text (display heading, non-emphasized lines)**: `rgba(27, 30, 31, 0.55)`.

- **Available dot**: `#22c55e` — the only saturated colour on the page so
  far, used exclusively for the "available for work" status dot. *(sampled
  from the exported SVG, node `96:18`)*
- **Page background**: `#ffffff`. The hero frames carry no fill, so the white
  canvas shows through. (The dark `#1b1e1f` in the Intro Animation frames is
  that animation's own background, not the page's.)

**Not yet verified — pull before use, don't invent:** surface/card colors,
hairline color if it differs from ink at low opacity. The old system's
warm-white `#f8f7f4` / slate-blue `#3d4a5c` tokens do **not** carry forward —
re-sample from Figma rather than assuming continuity.

## Site architecture — single page

The site is no longer nav + separate `/` `/about` `/work/[slug]` pages with
independent shells. Home is now **one scrolling page** assembling every
section; only case studies and 404 remain separate routes.

Home, top to bottom:

1. **Nav** — sticky, wordmark left (Kaushan Script), location text + Contact
   link right. *(Figma: `01 Nav`, node `96:6`)*
2. **Hero** — *built.* [components/Hero.tsx](components/Hero.tsx): the
   Instrument Serif statement with an "Idea block" (copy + dark "Let's
   Discuss" pill) pinned top-right of the headline on `lg`, a three-column
   meta row, then the carousel. *(Figma: `96:12`, `96:74`)*
3. **Work index** — the entry point into the case-study list.
4. **Three showcase strips** — full case-study preview modules in three
   layout variants (full-width single, two-up, three-up), each showing a
   project screen + title + category + year. *(Figma: the three `04 Showcase
   A — Dashboard` frames inside `Frame 10`, nodes `96:30`, `96:37`, `96:52`
   — currently all populated with the same placeholder "Ledger" project;
   real distinct projects needed per strip)*
5. **About + experience** — combined section: personal/about copy plus a
   résumé-style experience list (role, company, dates) and education.
   *(Figma: `About col`, node `96:156`, and `07 Résumé`, node `96:82` — these
   sit as separate frames in Figma; combine them into one section per this
   spec)*
6. **Testimonial** — a pull-quote/slogan moment. *(Figma: `Frame 2`, node
   `96:161`, two "Slogan" text layers — content not yet in metadata, pull
   with `get_design_context` when building this section)*
7. **UI Picker promo** — teaser for a separate "UI Picker" mini-experience
   ("Think you have a good eye? — five quick rounds of design judgment...").
   *(Figma: `10 UI Picker`, node `96:115`)*
8. **Contact** — "Let's talk.", email link, LinkedIn + WhatsApp.
   *(Figma: `11 Contact`, node `96:132`)*
9. **Footer** — wordmark + copyright. *(Figma: `12 Footer`, node `96:151`)*

Note the Figma canvas Y-order doesn't exactly match this list (e.g. About
sits before the showcase strips on the canvas, and Résumé sits after the
testimonial) — canvas position isn't necessarily scroll order in a WIP file.
**The section order above is the authoritative spec for implementation.**
Treat the Figma node references as content/style sources per section, not as
proof of final order.

## Motion stack

Lenis (smooth scroll) + GSAP with ScrollTrigger, Draggable and InertiaPlugin.
Draggable/Inertia ship **free and bundled** in `gsap` since the 2025 Webflow
acquisition — no Club GreenSock licence, no separate package.

- [lib/gsap.ts](lib/gsap.ts) registers all three plugins once, client-side only.
  Always import gsap and plugins from here, never from `gsap` directly, or the
  plugins won't be registered.
- [components/SmoothScroll.tsx](components/SmoothScroll.tsx) runs Lenis with
  `autoRaf: false`, driven from `gsap.ticker`, with
  `lenis.on("scroll", ScrollTrigger.update)`. **One shared ticker** — don't
  add a second rAF loop, or ScrollTrigger's measurements drift out of sync
  with Lenis's smoothed position.
- `gsap.ticker.lagSmoothing(0)` is set there, so any ticker callback must
  clamp its own `dt` (a backgrounded tab otherwise resumes with one huge step).

### Hero carousel

[components/HeroCarousel.tsx](components/HeroCarousel.tsx). Rules that keep it
working:

- **One `offset` value is the single source of truth.** Auto-drift and drag
  both write to it, which is what lets them blend instead of fighting. Drag
  goes through a detached GSAP proxy element whose delta is folded into
  `offset` on both `onDrag` and `onThrowUpdate` — so release inertia keeps
  feeding the same value.
- **Wrap is `((offset % setWidth) + setWidth) % setWidth`**, applied as
  `x = -wrapped`. The double-modulo matters: plain `%` returns negatives once
  offset goes below zero, which breaks the loop. `trackX` therefore stays in
  `(-setWidth, 0]`, and coverage holds as long as
  `(copies - 1) * setWidth >= viewport` — which the measure effect guarantees
  by growing `copies`.
- **`DRIFT_SIGN = -1` gives left→right.** Flip that one constant to reverse;
  nothing else changes.
- Hover eases drift to 0 over 0.6s via `gsap.to` on a `{value}` object —
  never a hard stop. `onPressInit` does the same, since touch fires no hover.
- Velocity → `skewX` (±9° cap) and `scaleX` (+0.04 cap) per frame, lerped with
  a **dt-corrected** factor (`1 - (1-k)^(dt*60)`) so it feels identical at 60
  and 144Hz. Idle drift produces ~0.25° — effectively neutral at rest.
- `prefers-reduced-motion` is handled in JS via `useReducedMotion`-style
  matchMedia: no drift, no skew/scale, **drag still works**. The CSS block in
  globals.css does not cover GSAP.

### Intro loader

[components/IntroLoader.tsx](components/IntroLoader.tsx), rendered from the
home page. Plays on **every load** (deliberately no first-visit gating — an
earlier sessionStorage version was removed on request). Pacing: pill holds
1.2s → collapses to the 56×56 mark over 0.5s → 0.9s clip-path curtain lift,
with the hero words starting 250ms before the curtain clears (~2.6s total).
Click accelerates via `timeScale(4)` — never jump-cut. Reduced motion skips
straight to the hero. Hero words are **visible in SSR** and hidden only by
the loader's own `tl.set` — that invariant is what keeps reduced-motion and
no-JS visits rendering normally (plus a `<noscript>` rule hiding the overlay).

### Motion language (site-wide)

Two registers, deliberately distinct:

- **Hero headline only**: the "liquid" signature — per-word rise from 30px
  with blur(8px)→0 and a skewY settle, `back.out(1.7)` overshoot, 50ms
  stagger, driven by the intro timeline targeting `[data-hero-word]`. No
  overflow masks on the headline (they'd clip the overshoot and blur).
  Transform and blur/opacity run as **two parallel tweens** — GSAP can't
  split easing per property in one tween.
- **Everything else — one default treatment, "fade-blur-up"**:
  [components/ScrollReveals.tsx](components/ScrollReveals.tsx) (mounted in
  the root layout, re-binds on route change). Every element — cards,
  paragraphs, labels, meta text, stats, tabs, dividers, buttons — reveals
  the same way: `y:18, opacity:0, blur(8px)` → neutral, 0.8s, ease
  `"reveal"` (= `cubic-bezier(0.16,1,0.3,1)`, registered as a CustomEase in
  [lib/gsap.ts](lib/gsap.ts)). Triggers once at 15% into the viewport;
  above-fold elements fire on load. The tween ends with
  `clearProps: "filter,transform"` so settled elements don't keep paying for
  a `blur(0px)` compositor layer. Reduced motion bails out entirely
  (instant appearance).

> ### ⚠️ STANDING CONVENTION — apply without being asked
>
> **Every new element, section, or component gets the default fade-blur-up
> reveal automatically.** This is not a per-request feature; it is the
> baseline. Building a section without it is a bug, not a missing
> enhancement — do not wait to be told, and do not ask whether to add it.
>
> Use the shared utility. **Never reimplement the animation**, never write a
> bespoke tween, a plain opacity fade, or an alternative reveal variant:
>
> | Need | Write |
> |---|---|
> | Element settles as one unit | `<Reveal as="section">` or `data-reveal` |
> | Repeated/grouped children stagger 60ms | `<Reveal as="ul" group>` or `data-reveal-group` |
> | Interactive element (`btn-liquid`, any CSS transition on opacity/transform) | wrap it: `<Reveal><a className="btn-liquid"…/></Reveal>` |
>
> [components/Reveal.tsx](components/Reveal.tsx) is the typed, discoverable
> path; the raw attributes are equivalent and equally fine. `Reveal` is
> polymorphic and renders the tag you name, so it adds **no extra DOM node**
> and stays a server component — sections never need `"use client"` just to
> animate.
>
> Spec, for reference (already encoded in the utility — don't re-enter these
> numbers anywhere): opacity 0→1, translateY 18px→0, blur(8px)→0, 0.8s,
> `cubic-bezier(0.16,1,0.3,1)`, ScrollTrigger once at 15% into view,
> ~60ms stagger for groups.
>
> **The only exception** is the hero headline, which keeps its own
> word-by-word liquid reveal (`[data-hero-word]`, driven by the intro
> timeline). Nothing else gets a custom treatment.
- **Loader coordination — the intro owns the initial viewport.** At t=0
  (under its opaque overlay) the loader hides every reveal target whose top
  edge starts inside the viewport, marks it `data-intro-owned`, and reveals
  everything together at 2.4s with the same values/ease as ScrollReveals —
  one entrance for nav, meta, idea block, and carousel, synchronized with
  the headline words (2.35s). ScrollReveals selects
  `:not([data-intro-owned])` and only ever handles below-fold content; it
  still defers binding until the loader's `nh-intro-reveal` event (2.4s),
  with a 4s timeout backstop — don't remove one side without the other.
  Two failed designs to not repeat: binding everything at 1.9s let
  top-of-page reveals finish invisibly behind the overlay (page read as
  static); binding at 2.4s without ownership snapped already-uncovered
  bottom content (carousel/meta) back to hidden mid-curtain — the curtain
  uncovers bottom-up, so anything scroll-bound after 1.7s re-hides visible
  content.
- **Never make an element both a reveal target and a CSS-transition owner
  for the same properties.** GSAP writes inline `opacity`/`transform` every
  frame; a CSS `transition` on those properties re-smooths each write and
  the element visibly lags/sticks mid-state (the Discuss pill shipped
  washed-out this way). Interactive elements with `btn-liquid` or any
  hover transition get revealed via a plain wrapper element instead.

Buttons: pills use the `btn-liquid` utility (globals.css) — colour shift plus
a squish-then-settle scale overshoot on hover and a press compress. On a
fully-rounded pill a border-radius "squish" is invisible (radius already at
max), so the give is expressed through asymmetric scale instead.

## `/work/[slug]` — case study template

Its own route, own template, separate from the single-page home. Structure,
top to bottom *(verified against `98:2` "Case Study — Template (Ledger)")*:

1. **Nav** — same wordmark, but right side is "← All work" + Contact
   (differs from home nav, which has no back-link).
2. **Title hero** — project title in Instrument Serif ("Ledger — Financing
   dashboard."), then a hairline, then a **meta table**: ROLE / TIMELINE /
   CATEGORY / YEAR as four equal-width columns, each an uppercase Barlow
   16px label (60% opacity) over a 20px Barlow value at -3% tracking.
   *(verified: node `98:12`)*
3. **Cover** — full-bleed project image.
4. **Overview** — heading + one paragraph, in a two-column layout (heading
   left in a fixed-width rail, copy right).
5. **Problem** — same two-column row pattern, hairline above.
6. **What I did** — same two-column row pattern, hairline above.
7. **Screen module — full width** — one large project screen + a short
   caption line underneath.
8. **Screen module — two-up tall** — two side-by-side tall screens (for
   scrolling marketing-page screenshots), shared caption underneath.
9. **Outcome** — heading + paragraph + a row of stat callouts (big number +
   small label, e.g. "−38% / support tickets"), separated by vertical
   hairlines.
10. **Next project** — "NEXT CASE STUDY" label, next project title, a
    "go to next" pill link, plus a preview thumbnail of that next project.
11. **Footer** — same as home.

The Overview/Problem/What-I-did rows and the two screen-module patterns are
reusable — every case study should compose from the same handful of section
components with different content, not bespoke markup per project.

## 404

Custom, not a generic Next.js fallback: nav (wordmark + Contact, no
back-link), then centered "404" in display type, a one-line message ("This
page doesn't exist — but the work does."), and a "Back home" link with an
arrow icon. *(verified structure: node `99:27`)*

## Content model

The MDX frontmatter schema from the old system (`title`, `category`,
`createdFor`, `timeline`, `description`, `whatSolved`, `outcome`,
`coverImage`, `detailImage`, `order`) needs revisiting against the richer
case-study template above — the new template has more sections (Problem,
What I did, two screen modules, Outcome *stats*, Next project) than the old
frontmatter has fields for. Don't force-fit the new template onto the old
schema; design the content model from what the template actually needs.

## Verifying changes

Screenshots in this session's browser pane have been unreliable — the pane
has repeatedly reported `document.visibilityState: "hidden"` with zero
animation frames firing, which silently breaks anything JS/rAF-driven
(Framer/Motion animations, computed layout that depends on a frame having
painted). Prefer:

- `get_screenshot` / `get_design_context` against Figma directly for design
  verification — pull real values instead of eyeballing.
- Computed-style checks via `javascript_tool` and SSR HTML inspection
  (`curl`/`Invoke-WebRequest` the dev server) for build verification — these
  don't depend on the pane's renderer being active.
- Always ask the user to eyeball the running dev server before calling a
  visual change done — don't rely on an in-session screenshot as the only
  proof, and don't run a production build (`next build`) against a live dev
  server on the same port, since it can overwrite the dev server's `.next`
  output and kill it.
