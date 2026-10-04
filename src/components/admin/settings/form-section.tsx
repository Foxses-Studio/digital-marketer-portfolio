import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** A titled group of fields inside a settings form. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-line py-8 first:pt-0 last:border-b-0 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12">
      <div>
        <h2 className="text-body font-semibold text-fg">{title}</h2>
        {description && <p className="mt-1 text-small text-fg-secondary">{description}</p>}
      </div>
      <div className="max-w-2xl space-y-5">{children}</div>
    </section>
  );
}

/** Sticky save bar at the bottom of a settings form. */
export function FormActions({ pending, label = "Save changes" }: { pending: boolean; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <Button type="submit" loading={pending}>
        {label}
      </Button>
    </div>
  );
}
