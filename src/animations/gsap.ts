"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * The only place GSAP plugins are registered. Import gsap and plugins from
 * here, never from the packages directly, so registration and the shared
 * eases are guaranteed.
 */
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

/*
 * House eases. Named so every animation on the site shares one motion
 * language instead of ad-hoc curves.
 *  - dm.reveal: long, decisive deceleration for masked text and images
 *  - dm.out:    general entrances
 *  - dm.inOut:  panels and transitions that start and stop on screen
 *  - dm.soft:   small UI responses (hover, magnetic return)
 */
CustomEase.create("dm.reveal", "M0,0 C0.12,0.86 0.24,1 1,1");
CustomEase.create("dm.out", "M0,0 C0.22,1 0.36,1 1,1");
CustomEase.create("dm.inOut", "M0,0 C0.76,0 0.24,1 1,1");
CustomEase.create("dm.soft", "M0,0 C0.25,1 0.5,1 1,1");

gsap.defaults({ ease: "dm.out", duration: 0.9 });

// CMS content is optional (no description, no availability...), so empty
// selections are expected and not worth a console warning.
gsap.config({ nullTargetWarn: false });

export { CustomEase, gsap, ScrollTrigger, SplitText, useGSAP };
