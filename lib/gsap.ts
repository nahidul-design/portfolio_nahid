"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registered once, client-side only. Draggable and InertiaPlugin ship free
 * and bundled in gsap since the 2025 Webflow acquisition — no Club GreenSock
 * license or separate install required, just these imports.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, CustomEase);

  // The site-wide reveal ease — smooth expo-out, no bounce. Referenced as
  // ease: "reveal" anywhere GSAP animates a reveal.
  CustomEase.create("reveal", "0.16, 1, 0.3, 1");
}

export { CustomEase, Draggable, gsap, InertiaPlugin, ScrollTrigger };
