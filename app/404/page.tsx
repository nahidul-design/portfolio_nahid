import { notFound } from "next/navigation";

/**
 * A real, resolvable route at literally "/404" — every case-study card and
 * the UI Picker CTA link here (see CaseStudies.tsx / UIPicker.tsx) since
 * the real destinations aren't built yet. This page exists purely so those
 * `<Link>`s can be resolved client-side: without a matching page.tsx here,
 * Next.js can't soft-navigate to an arbitrary unmatched path, so it fell
 * back to a full browser reload — which remounted the root layout and
 * replayed the intro loader on every case-study click, a real bug fixed by
 * this file existing. `notFound()` hands rendering to app/not-found.tsx,
 * so the actual UI still lives in exactly one place.
 */
export default function Custom404Route() {
  notFound();
}
