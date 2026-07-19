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
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const attr = image
    ? { "data-reveal-image": "" }
    : group
      ? { "data-reveal-group": "" }
      : { "data-reveal": "" };

  return (
    <Tag {...attr} {...rest}>
      {children}
    </Tag>
  );
}
