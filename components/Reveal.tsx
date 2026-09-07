import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type RevealProps<T extends ElementType> = {
  /** Element to render. Defaults to a div — pass "section", "p", "ul"… to
   *  avoid adding a wrapper node to the markup. */
  as?: T;
  /** Stagger the element's DIRECT CHILDREN 60ms apart instead of settling
   *  the element as one unit. Use for stat rows, nav links, meta cells. */
  group?: boolean;
  /** Image treatment: this element is the clipped frame (needs
   *  overflow-hidden) and unmasks while the <img> inside settles 1.08 → 1. */
  image?: boolean;
  /** Skip the ScrollTrigger entirely and play as soon as ScrollReveals
   *  binds. For content that's guaranteed to already be in the viewport on
   *  a page that never scrolls (e.g. app/not-found.tsx, which is sized to
   *  exactly one screen) — REVEAL_START ("top 85%") is a SCROLL threshold:
   *  an element sitting further down than that on load (e.g. pinned near
   *  the bottom of a fixed-height page) has already missed it and, since
   *  there's no scroll to bring it back into range, its "once" trigger
   *  would simply never fire. Same values/ease as every other reveal —
   *  this only removes the scroll gate, not the animation. */
  immediate?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * The site's default scroll reveal — fade-blur-up. Renders the tag you name
 * carrying the data attribute that [components/ScrollReveals.tsx] picks up,
 * so it costs no extra DOM node and stays a server component (sections don't
 * need "use client" to animate).
 *
 *   <Reveal as="section">…</Reveal>          settles as one unit
 *   <Reveal as="ul" group>…</Reveal>         children settle 60ms apart
 *   <Reveal image className="overflow-hidden"><img …/></Reveal>
 *                                            frame unmasks, image settles
 *   <Reveal><a className="btn-liquid" …/></Reveal>
 *       ^ the one case a real wrapper is wanted: GSAP must not animate an
 *         element that owns a CSS transition on opacity/transform.
 *
 * Equivalent to writing data-reveal / data-reveal-group by hand — both are
 * fine, this is just the typed, discoverable path. Do not hand-roll tweens.
 */
export default function Reveal<T extends ElementType = "div">({
  as,
  group = false,
  image = false,
  immediate = false,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const attr = {
    ...(image
      ? { "data-reveal-image": "" }
      : group
        ? { "data-reveal-group": "" }
        : { "data-reveal": "" }),
    ...(immediate ? { "data-reveal-immediate": "" } : {}),
  };

  return (
    <Tag {...attr} {...rest}>
      {children}
    </Tag>
  );
}
