import { SectionIntro } from "@/components/site/section-intro";
import { SectionMotion } from "../motion/section-motion";
import type { ProcessContent } from "../defs";
import type { SectionProps } from "./types";

/**
 * Process as one connected line: horizontal across the steps on large
 * screens, vertical beside them on smaller ones. The line fills with
 * scroll and each step lights up as the line reaches it.
 */
export function ProcessSection({ content, index, id }: SectionProps<ProcessContent>) {
  const steps = content.steps;
  if (!steps.length) return null;
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="process" labelledBy={content.heading ? headingId : undefined} className="section-space">
      <div className="container-wide">
        <SectionIntro id={headingId} index={index} label={content.label} heading={content.heading} highlight={content.highlight} description={content.description} />

        <ol
          data-process
          className="process relative mt-14 grid gap-10 pl-10 lg:mt-24 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-8 lg:pt-14 lg:pl-0"
          style={{ "--steps": steps.length } as React.CSSProperties}
        >
          {/* Track + fill: vertical below lg, horizontal from lg */}
          <span aria-hidden className="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-line lg:top-[0.6875rem] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto" />
          <span data-process-fill aria-hidden className="process-fill absolute top-2 bottom-2 left-[0.6875rem] w-px origin-top bg-accent lg:top-[0.6875rem] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto lg:origin-left" />

          {steps.map((step, i) => (
            <li key={step.id} data-process-step className="process-step relative">
              <span
                aria-hidden
                className="process-node absolute top-1 -left-10 grid size-6 place-items-center rounded-full border border-line-strong bg-canvas lg:-top-14 lg:left-0"
              >
                <span className="process-dot size-2 rounded-full bg-line-strong" />
              </span>
              <p className="process-index font-serif text-[2.75rem] leading-none text-fg-muted italic">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 text-[1.1875rem] leading-snug font-semibold tracking-[-0.015em] text-fg">{step.title}</h3>
              {step.detail && <p className="mt-2 text-label text-accent">{step.detail}</p>}
              <p className="mt-3 max-w-[30rem] text-small text-fg-secondary">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </SectionMotion>
  );
}
