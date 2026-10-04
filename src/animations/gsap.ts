"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The only place GSAP plugins are registered. Import gsap, ScrollTrigger
 * and useGSAP from here, never from the packages directly, so plugin
 * registration and defaults are guaranteed.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.defaults({ ease: "power3.out", duration: 0.9 });

export { gsap, ScrollTrigger, useGSAP };
