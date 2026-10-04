import { countUp } from "@/animations/counter";
import { pointerQuery } from "@/animations/config";
import { gsap, ScrollTrigger, SplitText } from "@/animations/gsap";
import { magnetic } from "@/animations/magnetic";

/**
 * Section choreography. Each setup runs only when motion is allowed (see
 * useSectionMotion) inside a GSAP context, so everything it creates is
 * reverted automatically. Each section has its own motion language:
 *
 *  brands         continuous marquee; scroll velocity pushes it, hover slows it
 *  results        pinned stage: results take turns, the trend line draws
 *  about          statement fills word by word; image rises through a mask
 *  services       rows rise in sequence (panel logic lives in ServicesList)
 *  caseStudies    dark surface opens to full bleed; pinned cover wipes
 *  process        one line fills; steps light up as it reaches them
 *  tools          category rows drift sideways in alternating directions
 *  experience     progress line; the role on the reading line takes focus
 *  testimonials   quote mark parallax (slider logic lives in the slider)
 *  certifications ledger rules draw in, entries settle
 *  blog           covers unmask with a slow scale; list follows
 *  finalCta       dark surface opens; heading scales in; magnetic actions
 */

type Setup = (scope: HTMLElement) => void | (() => void);

const DESKTOP = "(min-width: 64rem)";
const DESKTOP_PIN = "(min-width: 64rem) and (min-height: 640px)";

/** The dark chapter surface grows from an inset card to full bleed. */
function openFeature(scope: HTMLElement) {
  const bg = scope.querySelector<HTMLElement>("[data-feature-bg]");
  if (!bg) return;
  gsap.fromTo(
    bg,
    { clipPath: "inset(0% 3% 0% 3% round 28px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      ease: "none",
      scrollTrigger: { trigger: scope, start: "top bottom", end: "top 25%", scrub: true },
    },
  );
}

const brands: Setup = (scope) => {
  const groups = scope.querySelectorAll<HTMLElement>("[data-brands-group]");
  const viewport = scope.querySelector<HTMLElement>("[data-brands-viewport]");
  if (groups.length < 2 || !viewport) return;
  const count = groups[0]!.children.length;
  const loop = gsap.to(groups, { xPercent: -100, duration: Math.max(18, count * 4), ease: "none", repeat: -1 });
  // Scroll velocity briefly speeds the loop up (and reverses it when
  // scrolling up), then it eases back to its cruising speed.
  let hover = false;
  const base = () => (hover ? 0.2 : 1);
  const trigger = ScrollTrigger.create({
    trigger: scope,
    start: "top bottom",
    end: "bottom top",
    onUpdate(self) {
      const velocity = gsap.utils.clamp(-4, 4, self.getVelocity() / 600);
      const direction = self.direction;
      gsap.timeline({ overwrite: true })
        .to(loop, { timeScale: (base() + Math.abs(velocity)) * direction, duration: 0.25, ease: "dm.soft" })
        .to(loop, { timeScale: base() * direction, duration: 1.2, ease: "dm.soft" });
    },
  });
  const enter = () => {
    hover = true;
    gsap.to(loop, { timeScale: 0.2 * Math.sign(loop.timeScale() || 1), duration: 0.6, ease: "dm.soft", overwrite: true });
  };
  const leave = () => {
    hover = false;
    gsap.to(loop, { timeScale: Math.sign(loop.timeScale() || 1), duration: 0.6, ease: "dm.soft", overwrite: true });
  };
  viewport.addEventListener("pointerenter", enter);
  viewport.addEventListener("pointerleave", leave);
  gsap.from(groups[0]!.children, { y: 16, autoAlpha: 0, stagger: 0.05, duration: 0.8, scrollTrigger: { trigger: scope, start: "top 90%", once: true } });
  return () => {
    trigger.kill();
    viewport.removeEventListener("pointerenter", enter);
    viewport.removeEventListener("pointerleave", leave);
  };
};

const results: Setup = (scope) => {
  const stage = scope.querySelector<HTMLElement>("[data-results-stage]");
  if (!stage) return;
  const slides = gsap.utils.toArray<HTMLElement>("[data-result-slide]", stage);
  const bars = gsap.utils.toArray<HTMLElement>("[data-result-bar]", stage);
  const tabs = gsap.utils.toArray<HTMLElement>("[data-result-tab]", stage);
  const line = stage.querySelector<HTMLElement>("[data-results-line]");
  const dot = stage.querySelector<HTMLElement>("[data-results-dot]");
  const chart = stage.querySelector<HTMLElement>(".results-chart");
  const mm = gsap.matchMedia();

  mm.add(DESKTOP_PIN, () => {
    if (slides.length < 2) return;
    stage.dataset.mode = "pinned";
    let current = -1;
    const show = (index: number) => {
      if (index === current) return;
      const direction = index > current ? 1 : -1;
      const previous = slides[current];
      current = index;
      if (previous) gsap.to(previous, { autoAlpha: 0, yPercent: -18 * direction, duration: 0.45, ease: "dm.soft", overwrite: true });
      const next = slides[index]!;
      gsap.fromTo(next, { autoAlpha: 0, yPercent: 18 * direction }, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: "dm.out", overwrite: true });
      const counter = next.querySelector<HTMLElement>("[data-count]");
      if (counter) countUp(counter, { duration: 1.2 });
      tabs.forEach((tab, i) => tab.classList.toggle("is-active", i === index));
    };
    gsap.set(slides, { autoAlpha: 0 });
    gsap.set(slides[0]!, { autoAlpha: 1 });
    current = 0;
    tabs[0]?.classList.add("is-active");
    const first = slides[0]!.querySelector<HTMLElement>("[data-count]");
    if (first) ScrollTrigger.create({ trigger: stage, start: "top 75%", once: true, onEnter: () => void countUp(first, { duration: 1.4 }) });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top+=64",
        end: () => `+=${window.innerHeight * 0.7 * slides.length}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate(self) {
          show(Math.min(slides.length - 1, Math.floor(self.progress * slides.length)));
        },
      },
    });
    bars.forEach((bar, i) => tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1 }, i));
    if (line) tl.fromTo(line, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: slides.length }, 0);
    if (dot) tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.3 }, slides.length - 0.3);

    return () => {
      delete stage.dataset.mode;
      tabs.forEach((tab) => tab.classList.remove("is-active"));
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([...slides, ...bars, line, dot].filter((element) => element !== null), { clearProps: "all" });
    };
  });

  mm.add(`not all and ${DESKTOP_PIN}`, () => {
    slides.forEach((slide) => {
      const counter = slide.querySelector<HTMLElement>("[data-count]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: slide, start: "top 85%", once: true } });
      tl.from(slide, { y: 30, autoAlpha: 0, duration: 0.9 });
      if (counter) tl.add(countUp(counter, { duration: 1.6 }) ?? [], 0.1);
    });
    if (chart && line) {
      gsap.fromTo(line, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "dm.inOut", scrollTrigger: { trigger: chart, start: "top 85%", once: true } });
    }
  });
  return () => mm.revert();
};

const about: Setup = (scope) => {
  const statement = scope.querySelector<HTMLElement>("[data-about-statement]");
  const frame = scope.querySelector<HTMLElement>("[data-about-frame]");
  const image = scope.querySelector<HTMLElement>("[data-about-image]");
  let split: SplitText | null = null;
  if (statement) {
    split = SplitText.create(statement, {
      type: "words",
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
      },
    });
  }
  if (frame && image) {
    gsap.fromTo(frame, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "dm.reveal", scrollTrigger: { trigger: frame, start: "top 85%", once: true } });
    gsap.fromTo(image, { scale: 1.18, yPercent: -4 }, { scale: 1, yPercent: 4, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
  }
  return () => split?.revert();
};

const caseStudies: Setup = (scope) => {
  openFeature(scope);
  const stage = scope.querySelector<HTMLElement>("[data-cases-stage]");
  if (!stage) return;
  const items = gsap.utils.toArray<HTMLElement>("[data-case]", stage);
  const ticks = gsap.utils.toArray<HTMLElement>("[data-cases-tick]", stage);
  const current = stage.querySelector<HTMLElement>("[data-cases-current]");
  const mm = gsap.matchMedia();

  mm.add(DESKTOP_PIN, () => {
    if (items.length < 2) return;
    stage.dataset.mode = "pinned";
    const covers = items.map((item) => item.querySelector<HTMLElement>("[data-case-cover]")!);
    const copies = items.map((item) => item.querySelector<HTMLElement>("[data-case-copy]")!);
    const images = items.map((item) => item.querySelector<HTMLElement>(".cases-cover-image"));
    gsap.set(items, { zIndex: (i) => i + 1 });
    gsap.set(copies.slice(1), { autoAlpha: 0 });
    gsap.set(covers.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top+=64",
        end: () => `+=${window.innerHeight * (items.length - 0.4)}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const index = Math.min(items.length - 1, Math.round(self.progress * (items.length - 1)));
          if (current) current.textContent = String(index + 1).padStart(2, "0");
        },
      },
    });
    ticks.forEach((tick, i) => tl.fromTo(tick, { scaleX: 0 }, { scaleX: 1, duration: i === 0 ? 0.3 : 1 }, i === 0 ? 0 : i - 1 + 0.3));
    for (let i = 1; i < items.length; i++) {
      const at = i - 1 + 0.3;
      tl.to(copies[i - 1]!, { autoAlpha: 0, y: -40, duration: 0.35 }, at)
        .to(covers[i - 1]!, { scale: 0.92, duration: 0.7 }, at)
        .to(covers[i]!, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, at)
        .fromTo(images[i] ?? [], { scale: 1.25 }, { scale: 1, duration: 0.9 }, at)
        .fromTo(copies[i]!, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.35);
    }
    tl.to({}, { duration: 0.3 });
    return () => {
      delete stage.dataset.mode;
      // Scrubbed timelines can leave later states behind on revert; the
      // stacked layout is gone, so drop every inline style it used.
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([...items, ...covers, ...copies, ...images.filter((image) => image !== null), ...ticks], { clearProps: "all" });
    };
  });

  mm.add(`not all and ${DESKTOP_PIN}`, () => {
    items.forEach((item) => {
      const cover = item.querySelector<HTMLElement>("[data-case-cover]");
      const copy = item.querySelector<HTMLElement>("[data-case-copy]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 82%", once: true } });
      if (cover) tl.fromTo(cover, { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "dm.reveal" });
      if (copy) tl.from(copy.children, { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.2);
    });
  });
  return () => mm.revert();
};

const services: Setup = () => {};

const processSetup: Setup = (scope) => {
  const list = scope.querySelector<HTMLElement>("[data-process]");
  const fill = scope.querySelector<HTMLElement>("[data-process-fill]");
  const steps = gsap.utils.toArray<HTMLElement>("[data-process-step]", scope);
  if (!list || !fill || !steps.length) return;
  const mm = gsap.matchMedia();
  const activate = (progress: number) => {
    steps.forEach((step, i) => step.classList.toggle("is-active", progress >= (i + 0.05) / steps.length || progress > 0.98));
  };
  mm.add(DESKTOP, () => {
    gsap.fromTo(fill, { scaleX: 0, scaleY: 1 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: list, start: "top 75%", end: "bottom 45%", scrub: 0.5, onUpdate: (self) => activate(self.progress) },
    });
    gsap.from(steps, { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1, scrollTrigger: { trigger: list, start: "top 80%", once: true } });
  });
  mm.add(`not all and ${DESKTOP}`, () => {
    gsap.fromTo(fill, { scaleY: 0, scaleX: 1 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 60%", scrub: 0.5, onUpdate: (self) => activate(self.progress) },
    });
    steps.forEach((step) => gsap.from(step, { x: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: step, start: "top 88%", once: true } }));
  });
  return () => {
    mm.revert();
    steps.forEach((step) => step.classList.remove("is-active"));
  };
};

const tools: Setup = (scope) => {
  const rows = gsap.utils.toArray<HTMLElement>("[data-tools-row]", scope);
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    rows.forEach((row, i) => {
      const viewport = row.querySelector<HTMLElement>("[data-tools-viewport]");
      const track = row.querySelector<HTMLElement>("[data-tools-track]");
      if (!viewport || !track) return;
      // Long rows travel far enough to show every tool (edges fade out);
      // rows that fit drift a little into their free space.
      const overflow = () => track.scrollWidth - viewport.clientWidth;
      const long = overflow() > 0;
      viewport.classList.toggle("tools-viewport-masked", long);
      const forward = i % 2 === 0;
      const [from, to] = long
        ? forward
          ? [() => 24, () => -overflow() - 24]
          : [() => -overflow() - 24, () => 24]
        : forward
          ? [() => 0, () => 56]
          : [() => 56, () => 0];
      gsap.fromTo(
        track,
        { x: from },
        {
          x: to,
          ease: "none",
          scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
        },
      );
    });
    return () => scope.querySelectorAll(".tools-viewport-masked").forEach((element) => element.classList.remove("tools-viewport-masked"));
  });
  gsap.from(rows, { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.08, scrollTrigger: { trigger: rows[0] ?? scope, start: "top 85%", once: true } });
  return () => mm.revert();
};

const experience: Setup = (scope) => {
  const timeline = scope.querySelector<HTMLElement>("[data-timeline]");
  const fill = scope.querySelector<HTMLElement>("[data-timeline-fill]");
  const items = gsap.utils.toArray<HTMLElement>("[data-timeline-item]", scope);
  if (!timeline || !items.length) return;
  if (fill) {
    gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: timeline, start: "top 60%", end: "bottom 60%", scrub: 0.4 } });
  }
  items.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 60%",
      end: "bottom 60%",
      onToggle: (self) => item.classList.toggle("is-active", self.isActive),
      // Keep the last role lit after the timeline ends, the first before it.
      onLeave: () => i === items.length - 1 && item.classList.add("is-active"),
      onLeaveBack: () => i === 0 && item.classList.add("is-active"),
    });
  });
  items[0]?.classList.add("is-active");
  return () => items.forEach((item) => item.classList.remove("is-active"));
};

const testimonials: Setup = (scope) => {
  const mark = scope.querySelector<HTMLElement>("[data-quote-mark]");
  if (mark) gsap.fromTo(mark, { yPercent: 30 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: true } });
};

const certifications: Setup = (scope) => {
  const items = gsap.utils.toArray<HTMLElement>("[data-cert]", scope);
  const tl = gsap.timeline({ scrollTrigger: { trigger: items[0] ?? scope, start: "top 88%", once: true } });
  tl.from(scope.querySelectorAll("[data-cert-line]"), { scaleX: 0, duration: 1, stagger: 0.06, ease: "dm.inOut" }).from(
    items.map((item) => item.firstElementChild?.nextElementSibling ?? item),
    { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06 },
    0.2,
  );
};

const blog: Setup = (scope) => {
  gsap.utils.toArray<HTMLElement>("[data-post]", scope).forEach((post, i) => {
    const cover = post.querySelector<HTMLElement>("[data-post-cover]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: post, start: "top 88%", once: true }, delay: i === 0 ? 0 : 0.05 * i });
    if (cover) tl.fromTo(cover, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "dm.reveal" });
    tl.from(Array.from(post.children).filter((child) => child !== cover), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.15);
  });
};

const finalCta: Setup = (scope) => {
  openFeature(scope);
  const heading = scope.querySelector<HTMLElement>("[data-cta-heading]");
  const glow = scope.querySelector<HTMLElement>("[data-cta-glow]");
  if (heading) {
    gsap.fromTo(heading, { scale: 0.86 }, { scale: 1, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "top 20%", scrub: true } });
  }
  if (glow) gsap.fromTo(glow, { yPercent: 25, opacity: 0.4 }, { yPercent: -10, opacity: 1, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom bottom", scrub: true } });
  const mm = gsap.matchMedia();
  mm.add(pointerQuery, () => {
    const cleanups = gsap.utils.toArray<HTMLElement>("[data-magnetic]", scope).map((element) => magnetic(element));
    return () => cleanups.forEach((cleanup) => cleanup());
  });
  return () => mm.revert();
};

export const setups = {
  brands,
  results,
  about,
  services,
  caseStudies,
  process: processSetup,
  tools,
  experience,
  testimonials,
  certifications,
  blog,
  finalCta,
} satisfies Record<string, Setup>;

export type MotionVariant = keyof typeof setups;
