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

- **Square Peg** — wordmark only ("Nahidul Islam."), rendered via the
  `--font-script` token in `app/fonts.ts`. 32px, tracking `-0.04em` (the same
  `tracking-wordmark` token as before — it's em-based, so it scales with the
  new size automatically rather than needing a re-derived px value). Regular
  weight. Never used for anything else on the site. Superseded Kaushan Script
  site-wide (Nav, HomeFooter, IntroLoader) per a later Figma pass — if you
  find `Kaushan_Script` anywhere, it's stale. *(verified: node `173:104`
  nav, `173:254` footer, `96:164`/`96:167` loader)*
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

1. **Nav** — sticky, wordmark left (Kaushan Script), location text + a
   Résumé link right that opens `/resume.pdf` in a new tab (was a Contact
   link earlier in the build; Figma's own node changed to match). *(Figma:
   `01 Nav`, node `96:6`)*
2. **Hero** — *built.* [components/Hero.tsx](components/Hero.tsx): the
   Instrument Serif statement with an "Idea block" (copy + dark "Let's
   Discuss" pill) pinned top-right of the headline on `lg`, a three-column
   meta row, then the carousel. *(Figma: `96:12`, `96:74`)*
3. **About** — *built.* [components/About.tsx](components/About.tsx): bio
   (two-tone Instrument Serif) on the left; a two-layer scroll parallax on
   the right via [components/AboutParallax.tsx](components/AboutParallax.tsx)
   — see "About parallax" below. The old hairline + "figma • Framer • vibe
   code" tools line under the bio is gone; that content now lives in its own
   Tools section immediately after, so the two didn't stay duplicated.
   *(Figma: `About col`, node `96:156`; parallax layers node `173:276`)*
4. **Tools** — *built.* [components/Tools.tsx](components/Tools.tsx): a
   Résumé-style label-left/rows-right table — Design / AI & Creative /
   Process / Research — of 32px icon tiles at 60% opacity
   ([components/ToolIcon.tsx](components/ToolIcon.tsx) handles the per-icon
   hover: GSAP scale 1→1.12 + a slight vertical bob on `elastic.out`, not a
   CSS transition, since it's driven by mouseenter/mouseleave rather than
   the reveal system). Real brand marks come from `react-icons/si`
   (simple-icons): Figma, Claude, Framer, ClickUp, Miro. simple-icons ships
   neither an OpenAI/ChatGPT nor an Adobe Photoshop mark, so those two — plus
   Magnific, Plane, and Maze, which aren't in the library at all — render as
   a plain monochrome placeholder square (`PlaceholderIcon` in Tools.tsx).
   Both icon paths carry `aria-hidden` on the mark itself (react-icons sets
   its own `role="img"` on the `<svg>`; the placeholder would otherwise
   double up too) since the enclosing `ToolIcon` span already owns the
   accessible name via `role="img"`/`aria-label`. *(Figma: `05 Tools`, node
   `175:2`)*
5. **Case studies** — *built.* [components/CaseStudies.tsx](components/CaseStudies.tsx):
   the "Case studies" label plus all three showcase strips (full-width,
   two-up, three-up) in one component — the original spec's separate "work
   index" entry point and "three showcase strips" item were built combined,
   since the label and strips read as one section on the page. Cards are
   `/work/[slug]` links with hover scale/gradient/caption-shift. Caption is
   one line — title left, `Category — Year` right, muted — with a tight
   `gap-3` between image and caption (was a stacked two-line caption with a
   looser gap). *(Figma: `Frame 10`, node `96:25`, showcases at
   `96:30`/`96:37`/`96:52` — still placeholder "Ledger" cover art repeated
   across dummy projects)*
   - **Mobile accordion**: below `lg` (`AccordionRow` in CaseStudies.tsx),
     the two-up and three-up rows are tap-driven — the first tap on an
     inactive item expands it toward ~half the row (a second tap, now
     active, navigates); every item springs back to an even split once
     nothing's active. Sizing uses `flex-grow` against a **0% flex-basis**,
     not a percentage basis — a percentage basis double-counts the row's
     `gap` against 100% and can overflow/wrap. `isMobile` is tracked via
     `matchMedia("(max-width: 1023px)")`; above that the accordion is inert
     (every item keeps the same weight) and the row reads as a plain even
     split, same as before.
6. **Testimonial** — *built.* [components/Quote.tsx](components/Quote.tsx).
   *(Figma: `Frame 2`, node `96:161` — it's a Steve Jobs quote, not an
   original manifesto; kept the attribution)*
7. **Résumé** — *built.* [components/Resume.tsx](components/Resume.tsx):
   label-left/content-right Experience and Education rows, hairlines between
   jobs, Download Résumé pill linking to `/resume.pdf` (byte-verified
   placeholder — real xref offsets, opens in any viewer). Built as its own
   section, not merged into About — the original spec above called for one
   combined "About + experience" section, but was built across two separate
   turns as two components. If a single merged section is still wanted,
   this needs revisiting. *(Figma: `07 Résumé`, node `96:82`)*
8. **UI Picker promo** — *built.* [components/UIPicker.tsx](components/UIPicker.tsx).
   First dark (`bg-ink`) band on the page. A "Gameplay" eyebrow (Barlow 16px
   uppercase white) sits above the heading; the CTA now points at `/404`
   rather than the still-unbuilt `/ui-picker` route — see
   [app/404/page.tsx](app/404/page.tsx) below for why that's a real route
   file, not just a bare URL relying on the not-found fallback.
   The background photo's ambient breathing + scroll parallax
   ([components/UIPickerBackground.tsx](components/UIPickerBackground.tsx))
   was deliberately turned up from a barely-visible first pass — see "UI
   Picker background" below. *(Figma: `10 UI Picker`, node `96:115`,
   updated container/spacing at `173:210`, CTA at `173:217`)*
9. **Contact** — *built.* [components/Contact.tsx](components/Contact.tsx).
   `id="contact"` is load-bearing — Hero's "Let's Discuss" smooth-scrolls
   here via [lib/scroll.ts](lib/scroll.ts) (Nav's own link was later changed
   to a direct Résumé download, not a Contact link — see the Nav entry
   above). Email is click-to-copy
   ([components/CopyEmailLink.tsx](components/CopyEmailLink.tsx)); LinkedIn
   and WhatsApp are real links. *(Figma: `11 Contact`, node `96:132`)*
10. **Footer** — *built.* [components/HomeFooter.tsx](components/HomeFooter.tsx) —
    named `HomeFooter`, not `Footer`: `components/Footer.tsx` is the v1
    component still used by the stale `/about` and `/work/[slug]` routes
    (the custom 404 was rebuilt onto v2 and now reuses `HomeFooter` too —
    see the 404 section below): overwriting `Footer.tsx` would have
    silently broken the two routes still on it. *(Figma: `12 Footer`, node
    `96:151`)*

**Home page is now fully assembled**, [app/page.tsx](app/page.tsx) —
Nav (root layout) → Hero → About → Tools → Case studies → Testimonial →
Résumé → UI Picker → Contact → PenguinSlot → HomeFooter.

### About

[components/About.tsx](components/About.tsx) /
[components/AboutParallax.tsx](components/AboutParallax.tsx) — re-pulled
after Figma moved from a side-by-side bio-left/portrait-right layout (the
original build) to a full-bleed overlay card (node `173:276`, "Frame 26"):
centered "About me" eyebrow + two-tone bio pinned to the top, over a
rounded `img-radius` 1200×800 card whose Background photo fills it (plus a
`from-page to-page/20` scrim gradient so the text stays legible against
sky) and whose Object (subject cutout) sits bottom-anchored and
horizontally centered at 36%×72% of the card. **If you ever see the old
side-by-side layout referenced anywhere (including in your own memory of
this project), it's stale — this overlay-card version is current.**

Both image layers are oversized/offset the same way as
UIPickerBackground's ambient parallax (`h-[120%]`, `top: -10%`) so their
`yPercent` scroll travel never reveals empty space at the container edge.
Each runs its own `gsap.fromTo(...yPercent...)` scrubbed straight to scroll
position via `ScrollTrigger` (`scrub: true`, no easing lag — a direct scrub
is what keeps two independently-moving layers from drifting out of sync
with each other or the actual scroll position). Background travels ±6%
(slower, reads as far), Object ±9% (faster, reads as floating above it).
The background additionally gets a slow always-on breathing scale
(`sine.inOut` yoyo, ~10s cycle) — **on a separate wrapper `<div>`, not the
`<img>` itself**: the card is deliberately NOT a `data-reveal-image` target
(it's atmospheric chrome behind centered copy, same call as
UIPickerBackground, not content of its own), but an earlier version of this
breathing effect targeted the `<img>` directly while it was still a reveal
target, and the reveal's own one-off entrance scale tween fought the
continuous breathe tween over the same `transform` property forever after —
two GSAP tweens on one element, not the GSAP-vs-CSS-transition contention
CLAUDE.md usually warns about, but the same underlying failure mode. Keep
the breathe on its own element if this component changes again.

`AboutPortrait.tsx`, the original hover-tilt single-portrait component this
superseded, was deleted — nothing references it.

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

### Custom cursor

[components/Cursor.tsx](components/Cursor.tsx). A ~12px circle trailing the
pointer with a dt-corrected lerp, driven from the **shared** `gsap.ticker`
(never a second rAF loop). Morphs by reading the element under the pointer:
`data-cursor="<label>"` grows to a filled pill showing that exact text with
the fade-blur-up entrance — the attribute VALUE is the label (`"View"` on
case-study cards and the résumé/UI-Picker CTAs, `"Copy"` on the email link),
so **Cursor.tsx never hardcodes a specific label**; a new element just sets
its own. `a`/`button`/inputs with no `data-cursor` shrink to a 5px dot;
otherwise a hollow circle. Native cursor is hidden via
`@media (pointer: fine) and (hover: hover)` in globals.css — the component
itself also only mounts when `(pointer: fine)`, so touch/coarse devices keep
their native cursor and this never renders. Position is written with
`gsap.quickSetter(..., "x"/"y")` (the `transform` property); the element's
`-translate-1/2` centering uses the separate `translate` property, so the
two compose instead of overwriting each other.

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
**root layout** ([app/layout.tsx](app/layout.tsx)), not the home page — it
used to live in `app/page.tsx`, which meant clicking the logo (a plain Link)
back to `/` from any other route remounted the home page component and
replayed the intro. The root layout only mounts once per real navigation
(first visit or a browser reload) and persists across client-side route
changes, so living there makes the intro naturally play once per real page
load and never on an internal Link click — no sessionStorage flag needed
(an earlier sessionStorage-gated version was removed on request; this
achieves the same "not on every click" outcome by mount lifetime instead of
a stored flag). Pacing: pill holds
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
  the same way: `y:22, opacity:0, blur(15px)` → neutral, 1.2s, ease
  `"reveal"` (= `cubic-bezier(0.16,1,0.3,1)`, registered as a CustomEase in
  [lib/gsap.ts](lib/gsap.ts)) — tuned deliberately slow so it reads as a
  soft focus-pull, not a flicker; a faster/subtler first pass (0.8s, 8px
  blur) resolved too quickly to register, especially across a stagger
  group. Triggers once at 15% into the viewport;
  above-fold elements fire on load. The tween ends with
  `clearProps: "filter,transform"` so settled elements don't keep paying for
  a `blur(0px)` compositor layer. Reduced motion bails out entirely
  (instant appearance).
  All values live in [lib/reveal.ts](lib/reveal.ts), imported by **both**
  ScrollReveals and IntroLoader — never redeclare them locally, or a target
  animates differently depending on which of the two systems owns it.

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
> | **Image** — frame unmasks, picture settles 1.08→1 | `<Reveal image className="overflow-hidden"><img/></Reveal>` or `data-reveal-image` |
> | Interactive element (`btn-liquid`, any CSS transition on opacity/transform) | wrap it: `<Reveal><a className="btn-liquid"…/></Reveal>` |
>
> The image variant is the **only** sanctioned departure from fade-blur-up.
> Its container must be `overflow-hidden` (the clip needs something to clip)
> and the `<img>` inside must carry **no transform utility** — the reveal
> animates its scale, so a class-set `scale-*` is overwritten mid-tween and
> snaps back on `clearProps`. Crop with `object-position`, not `scale`.
>
> [components/Reveal.tsx](components/Reveal.tsx) is the typed, discoverable
> path; the raw attributes are equivalent and equally fine. `Reveal` is
> polymorphic and renders the tag you name, so it adds **no extra DOM node**
> and stays a server component — sections never need `"use client"` just to
> animate.
>
> Spec, for reference (already encoded in the utility — don't re-enter these
> numbers anywhere, and don't quietly drift back toward faster/subtler ones):
> opacity 0→1, translateY 22px→0, blur(15px)→0, 1.2s,
> `cubic-bezier(0.16,1,0.3,1)`, ScrollTrigger once at 15% into view,
> ~90ms stagger for groups.
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
max), so the give is expressed through asymmetric scale instead. Never stack
a Tailwind `transition-*` utility on a `btn-liquid` element — both set the
full `transition` shorthand and the second one silently wins, breaking the
squish; use plain `hover:`/`active:` state utilities and let `btn-liquid`'s
own shorthand animate them. Padding is `px-6 py-4` on every filled pill
(Discuss, Download Résumé, UI Picker CTA) — was `px-5 py-3`, sized up to
match Figma. The Discuss button's icon (Hero.tsx) changed from a bespoke
north-east arrow to the same `ArrowDown` glyph used by the Nav/Résumé
downloads, wrapped in a `<div className="-rotate-90 flex-none">` so it reads
as pointing right — reuse that glyph rather than re-adding a one-off SVG if
another CTA needs a directional arrow.

**Image radius**: every image container site-wide (hero carousel cards,
case-study covers, the About parallax layers) shares one `img-radius`
utility (globals.css, `border-radius: 2px`) — small and near-square per
Figma. Add it to any new image container rather than setting a radius value
inline; the single utility is what keeps the value from drifting per
instance.

Text links (nav Résumé, footer wordmark, email in Contact) share the
`link-underline` utility (globals.css) — a `::after` pseudo-element that
draws left-to-right via `scaleX`, safe to put directly on any element
including a reveal target, since it only ever animates its own pseudo-element
box, never the host's own transform/opacity. The colour shift and translateY
nudge that go with it are plain `hover:`/`group-hover:` utilities layered on
top — but **only** as `group-hover:` on a child span when the link itself is
a direct `data-reveal-group` child (CopyEmailLink, the nav/footer wordmark);
a hover-transform utility directly on a reveal-target element re-triggers on
every hover and fights GSAP's one-time entrance write, same failure mode as
`btn-liquid`.

LinkedIn/WhatsApp in Contact.tsx deliberately do **not** use
`link-underline` — a different, later request gave them their own
treatment: a soft rounded pill background (`hover:bg-ink/[0.07]`) fades in
behind icon+label via negative margin/padding, the icon scales and rotates
slightly, the whole pill lifts 1px. All directly on the `<a>`, which is safe
here since the reveal-group's real child is their wrapping `<div>`, not each
`<a>`. One combined arbitrary `transition-[color,background-color,transform]`
utility — never stack separate `transition-colors` + `transition-transform`,
same shorthand-collision risk as `btn-liquid` above.

### UI Picker background

[components/UIPickerBackground.tsx](components/UIPickerBackground.tsx)'s
ambient breathing (scale) + scroll parallax (yPercent) on the section's
full-bleed photo was tuned up from a first pass that read as barely-there:
`BREATHE_SCALE` 1.03→1.12, `BREATHE_LEG` 4.5s→3s (a full yoyo cycle is now
~6s, was ~9s), `PARALLAX_RANGE` 7→14 (yPercent, relative to the image's own
120% height), and the image opacity itself 5%→10%. Same mechanism as
before (always-on, not hover-triggered — see the component's own comment)
— only the constants changed, so the "seamless, no edge-revealing" guarantee
from the 120%-height/`-10%`-top oversizing still holds at the wider range.

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

[app/not-found.tsx](app/not-found.tsx) — rebuilt onto v2 (the previous file
imported the dead v1 `Footer`/`NavLink` components and referenced tokens
that don't exist in v2's `globals.css`, e.g. `text-2xs`, `tracking-ui`,
`ease-editorial` — it rendered broken). Structure: a giant `font-display`
"404." heading, a one-line message, a "Back home" link with an arrow icon,
then `HomeFooter` (reused rather than standing up a third footer variant —
it's already v2-token-based and carries no home-specific logic beyond its
own copy). **No local nav here** — an earlier version rendered its own
wordmark+Contact header, which doubled up with the site-wide `<Nav />` the
root layout already renders on every route; removed, so this page relies
entirely on the global nav (which means it shows the standard
wordmark/location/Résumé nav, not a Figma-specific wordmark+Contact
variant — a single correct nav beats a pixel-exact duplicate one). The
message is **"This page is under construction — check back soon."** (was
"This page doesn't exist — but the work does.") — needed to read as "not
built yet," not "doesn't exist," since both the UI Picker CTA and every
case-study card (`CaseStudies.tsx`) link here now, the real destinations
not being built yet. *(verified structure: node `99:27`)*

**[app/404/page.tsx](app/404/page.tsx) is a real route file**, not just a
bare URL relying on the catch-all fallback — it exists purely so
`<Link href="/404">` can resolve client-side. Without a matching
`page.tsx`, Next can't soft-navigate to an arbitrary unmatched path and
falls back to a full browser reload, which remounts the root layout —
including the intro loader, which then replayed on every case-study click.
The route file just calls `notFound()`, handing the actual rendering back
to `app/not-found.tsx` so the UI still lives in exactly one place; it only
exists to make the navigation itself soft.

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
- The same `visibilityState: "hidden"` root cause also makes **synthetic
  `dispatchEvent(new MouseEvent("click", …))` calls unreliable** as a stand-in
  for a real user click/tap — confirmed again while verifying the case-study
  mobile accordion (a dispatched click on a `Link` produced no state change
  even though the handler is plain React state with no GSAP/rAF dependency).
  For interactions gated behind `data-reveal`/GSAP, prefer checking DOM
  structure and computed values (element presence, `aria-*`, class names,
  computed styles) over trying to force the interaction live in this pane.

**Icon library**: `react-icons` (the `si` — simple-icons — subpath) is
installed for the Tools section's brand marks. Before wiring a new icon,
confirm the export actually exists in the installed version — `SiOpenai`,
`SiAdobephotoshop`, and any Anthropic/Claude-adjacent alternates beyond
`SiClaude` may not be present; check with a quick
`node -e "console.log(typeof require('react-icons/si').SiWhatever)"` rather
than assuming a simple-icons brand has react-icons coverage.
