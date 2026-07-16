# Design system

White theme only — no dark mode, no theme toggle. Direction: minimal, modern,
Swiss/neutral. Generous whitespace, restraint over decoration, crisp and
understated. All tokens below are the source of truth; every page should
consume them rather than hardcoding a value.

Token source: [app/globals.css](app/globals.css) (`@theme` block). Font
loader: [app/fonts.ts](app/fonts.ts). Do not add a second font family or a
dark-mode variant without an explicit decision to change direction — see
"Guardrails" below.

## Typeface

Single family, sans only — no serif anywhere on the site.

- **Family**: Geist, loaded via `next/font/google` in [app/fonts.ts](app/fonts.ts), exposed as CSS var `--font-sans-family`, consumed as Tailwind token `--font-sans`. Applied on `<html className={sans.variable}>` in [app/layout.tsx](app/layout.tsx).
- **Fallback stack**: `"Helvetica Neue", Arial, sans-serif`.
- **Weight carries hierarchy** (no second family to do it): `700` on `h1`/`h2`/`h3` and the nav wordmark, `400` for body/UI. Set globally in `@layer base` — don't override per-page.

## Type scale

12px is a **hard floor** — nothing on the site should ever go smaller. Nav
links and body copy are pinned to 16px (`--text-base`). Headings scale up
from there.

| Token | Size | Line-height | Typical use |
|---|---|---|---|
| `text-2xs` | 12px | 1.4 | floor — footer links, copyright, eyebrow/meta labels |
| `text-xs` | 13px | 1.5 | — |
| `text-sm` | 14px | 1.55 | — |
| `text-base` | 16px | 1.6 | **nav links (required), body copy** |
| `text-md` | 18px | 1.55 | lede paragraphs |
| `text-lg` | 22px | 1.4 | — |
| `text-xl` | 28px | 1.3 | — |
| `text-2xl` | 36px | 1.15 | — |
| `text-3xl` | 48px | 1.08 | page titles (about, work, 404) — mobile |
| `text-4xl` | 64px | 1.02 | page titles — `sm:` |
| `text-5xl` | 84px | 1 | home hero — `sm:` |
| `text-6xl` | 104px | 0.98 | reserve for a larger hero moment; unused so far |

## Tracking

Exactly two values, both tight, never loose:

- `tracking-tight` = `-0.02em` (**-2%**) — headings (`h1`/`h2`/`h3`) and the nav wordmark only.
- `tracking-ui` = `-0.015em` (**-1.5%**) — everything else: body, UI, nav links. Applied globally on `<body>` in `@layer base`, so plain text inherits it without a class.

## Color

Near-black on warm white, a restrained warm-grey ramp, one quiet accent used
sparingly (hover states, focus rings, `::selection`, and small deliberate
highlights — never as a fill or a large surface).

| Token | Hex | Role |
|---|---|---|
| `color-page` | `#f8f7f4` | page background (warm white) |
| `color-surface` | `#efede7` | raised/alternate surface |
| `color-ink` | `#14140f` | primary text (near-black) |
| `color-ink-soft` | `#3a382f` | secondary text, body copy |
| `color-muted` | `#6b6a61` | tertiary text |
| `color-faint` | `#a19e93` | quietest text — meta, timestamps |
| `color-line` | `#e2e0d8` | hairlines, dividers, borders |
| `color-accent` | `#3d4a5c` | the one accent — muted slate-blue |

**Guardrail — do not drift toward the terracotta/cream default.** The
installed [frontend-design skill](.claude/skills/frontend-design/SKILL.md)
names "warm cream background + high-contrast serif + terracotta accent" as
one of three defaults AI-generated design reflexively lands on. This palette
deliberately keeps the warm-white/near-black base (a genuine brief
requirement) but moved the accent to slate-blue specifically to avoid that
combination. If a future change reintroduces an orange/terracotta accent,
treat that as a decision to flag, not a silent restyle.

## Spacing

Semantic steps on top of Tailwind's 0.25rem base — pick the token, not a raw
number, so page rhythm stays consistent as new pages are added.

| Token | Value | Use |
|---|---|---|
| `spacing-gutter` | 1.25rem (20px) | mobile side padding |
| `spacing-gutter-lg` | 2rem (32px) | `sm:` side padding |
| `spacing-section` | 6rem (96px) | vertical rhythm between major blocks |
| `spacing-section-lg` | 9rem (144px) | `sm:` vertical rhythm |

## Motion

Slow and subtle only — no snappy micro-interactions, no bounce.

- `ease-editorial` = `cubic-bezier(0.22, 0.61, 0.36, 1)` — the one easing curve for the whole site.
- Durations (CSS vars, not Tailwind theme keys — use as `duration-[var(--motion-slow)]`): `--motion-fast: 200ms`, `--motion-slow: 500ms` (default for hover/link transitions), `--motion-slower: 700ms`.
- `prefers-reduced-motion: reduce` is handled globally in `globals.css` — collapses all animation/transition durations to ~0 and disables smooth scroll. Don't re-implement this per component.

## Components

- **[components/Nav.tsx](components/Nav.tsx)** — sticky header, `bg-page/80` + backdrop blur (no hard border). Wordmark: bold, `tracking-tight`, 20px/24px (`sm:`). Right side: `About Me`, `LinkedIn`, an optional hidden `UI Picker` link gated behind `SHOW_UI_PICKER` in the file, and `Download Resume` as an arrow-link (not a button) at nav size (16px).
- **[components/NavLink.tsx](components/NavLink.tsx)** — shared link with a hover underline that wipes in from the left / out to the right. `size` prop: `"base"` (16px, default — primary nav) or `"xs"` (12px floor — footer).
- **[components/Footer.tsx](components/Footer.tsx)** — rendered on every route except home (home imports [components/PenguinSlot.tsx](components/PenguinSlot.tsx) instead). Uses `NavLink` at `size="xs"`.
- **[components/PenguinSlot.tsx](components/PenguinSlot.tsx)** — reserved empty, `pointer-events-none` container, fixed bottom-right of the home page, for a future addition.

## Content

MDX project files live in `content/projects/*.mdx`, loaded and validated by
[lib/projects.ts](lib/projects.ts). Required frontmatter: `title`, `category`
(`dashboard | landing | saas | webapp | mobile`), `createdFor`, `timeline`,
`description`, `whatSolved`, `outcome`, `coverImage`, `detailImage`, `order`.
See [content/projects/_template.mdx](content/projects/_template.mdx) (files
prefixed `_` are ignored by the loader).

## Verifying changes

The in-session screenshot tool has been unreliable — don't rely on it as the
only proof a change works. Prefer computed-style checks via
`javascript_tool` (font family/size/tracking/color) plus `preview_logs` for
compile errors, and always ask the user to eyeball the running dev server
before calling a visual change done.
