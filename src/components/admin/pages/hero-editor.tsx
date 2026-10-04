"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSection } from "@/actions/pages";
import { MediaField } from "@/components/admin/media/media-field";
import { FormSection } from "@/components/admin/settings/form-section";
import { Button } from "@/components/ui/button";
import { SwitchField, TextField, TextareaField } from "@/components/ui/field";
import { confirmDelete, showError, toast } from "@/lib/feedback/alerts";
import type { MediaItem } from "@/lib/media/types";
import { formatMetric, METRIC_VALUE_PATTERN } from "@/lib/metrics";
import { cn } from "@/lib/utils/cn";
import { chartGeometry, growthParts } from "@/sections/hero/chart-geometry";
import {
  HERO_CHART_MAX_POINTS,
  HERO_CHANNEL_LIMIT,
  HERO_METRIC_LIMIT,
  heroContentSchema,
  type HeroContent,
  type HeroMetric,
} from "@/sections/hero/definition";
import { PreviewFrame } from "./preview-frame";

type Errors = Record<string, string[]>;

function collectErrors(issues: Array<{ path: PropertyKey[]; message: string }>): Errors {
  const errors: Errors = {};
  for (const issue of issues) (errors[issue.path.map(String).join(".")] ??= []).push(issue.message);
  return errors;
}

/**
 * Structured editor for the hero. Content only: the layout, typography and
 * motion are fixed by the design. Validates with the same schema as the
 * server, then saves through the generic section action.
 */
export function HeroEditor({
  page,
  sectionId,
  enabled,
  initial,
  image,
  previewPath,
}: {
  page: string;
  sectionId: string;
  enabled: boolean;
  initial: HeroContent;
  image: MediaItem | null;
  previewPath: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState<HeroContent>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  const [pending, startTransition] = useTransition();
  const [pointsText, setPointsText] = useState(initial.chart.points.join(", "));

  function update<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  function updateMetric(index: number, patch: Partial<HeroMetric>) {
    update("metrics", content.metrics.map((metric, i) => (i === index ? { ...metric, ...patch } : metric)));
  }

  function moveMetric(index: number, delta: -1 | 1) {
    const next = [...content.metrics];
    [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
    update("metrics", next);
  }

  async function removeMetric(index: number) {
    const metric = content.metrics[index]!;
    if (metric.label && !(await confirmDelete(`the "${metric.label}" metric`))) return;
    update("metrics", content.metrics.filter((_, i) => i !== index));
  }

  function addMetric() {
    update("metrics", [
      ...content.metrics,
      { id: crypto.randomUUID(), label: "", prefix: "", value: "", suffix: "", enabled: true },
    ]);
  }

  /** "142, 151.5, 160" → numbers; null if any entry isn't a number. */
  function parsePoints(text: string): number[] | null {
    const parts = text.split(/[,\s]+/).filter(Boolean);
    const numbers = parts.map((part) => Number(part));
    return numbers.every((n) => Number.isFinite(n)) ? numbers : null;
  }

  function save() {
    const points = parsePoints(pointsText);
    if (!points) {
      setErrors({ "chart.points": ["Use numbers separated by commas, e.g. 120, 135, 160."] });
      void toast("Check the highlighted fields.", "error");
      return;
    }
    const parsed = heroContentSchema.safeParse({ ...content, chart: { ...content.chart, points } });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      void toast("Check the highlighted fields.", "error");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await updateSection({ page, sectionId, content: parsed.data });
      if (result.ok) {
        setDirty(false);
        setVersion((v) => v + 1);
        void toast("Hero saved.");
        router.refresh();
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        void toast("Check the highlighted fields.", "error");
      } else {
        await showError("Couldn't save the hero", result.error);
      }
    });
  }

  const e = (path: string) => errors[path];
  const highlightFound = !content.highlight || content.heading.includes(content.highlight);

  return (
    <div className="mt-1">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title text-fg">Hero</h1>
          <p className="mt-1.5 text-body text-fg-secondary">
            The first screen of your homepage.{" "}
            {!enabled && (
              <span className="text-warning">
                This section is hidden.{" "}
                <Link href={`/admin/pages/${page}`} className="underline underline-offset-4">
                  Show it
                </Link>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-10 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          aria-label="Hero content"
        >
          <FormSection stacked title="Message" description="Keep it short. The design gives each line room to breathe.">
            <TextField label="Label" value={content.eyebrow} onChange={(ev) => update("eyebrow", ev.target.value)} maxLength={60} errors={e("eyebrow")} placeholder="e.g. Performance Marketer" hint="Small text above the heading. Defaults to your professional title." />
            <TextareaField label="Heading" value={content.heading} onChange={(ev) => update("heading", ev.target.value)} maxLength={140} showCount rows={2} errors={e("heading")} hint="The page's main heading. Defaults to your name." />
            <TextField
              label="Highlighted words"
              value={content.highlight}
              onChange={(ev) => update("highlight", ev.target.value)}
              maxLength={60}
              errors={e("highlight") ?? (highlightFound ? undefined : ["Not found in the heading yet."])}
              hint="Optional. Words from the heading shown in the accent style."
            />
            <TextareaField label="Description" value={content.description} onChange={(ev) => update("description", ev.target.value)} maxLength={280} showCount rows={3} errors={e("description")} />
          </FormSection>

          <FormSection stacked title="Buttons" description="The primary button is the main action; the secondary one is a quieter link.">
            {(["primaryCta", "secondaryCta"] as const).map((key) => (
              <div key={key} className="space-y-4 rounded-md border border-line bg-surface p-4">
                <SwitchField
                  label={key === "primaryCta" ? "Primary button" : "Secondary link"}
                  checked={content[key].enabled}
                  onChange={(ev) => update(key, { ...content[key], enabled: ev.target.checked })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Label" value={content[key].label} onChange={(ev) => update(key, { ...content[key], label: ev.target.value })} maxLength={32} errors={e(`${key}.label`)} />
                  <TextField label="Link" value={content[key].url} onChange={(ev) => update(key, { ...content[key], url: ev.target.value })} placeholder="/contact or https://" errors={e(`${key}.url`)} />
                </div>
              </div>
            ))}
          </FormSection>

          <FormSection stacked title="Image" description="Your portrait or a campaign visual. Without an image, your initials are shown.">
            <MediaField
              name="heroImage"
              label="Hero image"
              initial={image}
              errors={e("imageMediaId")}
              hint="A vertical image (4:5 or taller), at least 1200px tall."
              onChange={(item) => update("imageMediaId", item?.id ?? null)}
            />
            <TextField label="Image description (alt text)" value={content.imageAlt} onChange={(ev) => update("imageAlt", ev.target.value)} maxLength={160} errors={e("imageAlt")} hint="Describe the image for screen readers. Defaults to your name." />
          </FormSection>

          <FormSection stacked title="Availability" description="A short status line under the buttons.">
            <SwitchField label="Show availability" checked={content.availability.enabled} onChange={(ev) => update("availability", { ...content.availability, enabled: ev.target.checked })} />
            <TextField label="Text" value={content.availability.text} onChange={(ev) => update("availability", { ...content.availability, text: ev.target.value })} maxLength={60} errors={e("availability.text")} placeholder="e.g. Available for new projects" />
          </FormSection>

          <FormSection stacked title="Results" description={`Up to ${HERO_METRIC_LIMIT}. The first one is featured; the others appear beside the chart.`}>
            {content.metrics.length === 0 && (
              <p className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-small text-fg-muted">
                No results yet. Add real, measurable outcomes.
              </p>
            )}
            <ol className="space-y-3" aria-label="Results">
              {content.metrics.map((metric, index) => {
                const preview = METRIC_VALUE_PATTERN.test(metric.value) ? formatMetric(metric) : "";
                return (
                  <li key={metric.id} data-metric-row className={cn("rounded-md border border-line bg-surface p-4", !metric.enabled && "opacity-60")}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-small font-medium text-fg">
                        {index === 0 ? "Featured result" : `Result ${index + 1}`}
                        {preview && <span className="ml-2 font-normal text-fg-muted tabular-nums">{preview}</span>}
                      </p>
                      <div className="flex items-center gap-1">
                        <label className="mr-2 flex items-center gap-2 text-small text-fg-secondary">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={metric.enabled}
                            onChange={(ev) => updateMetric(index, { enabled: ev.target.checked })}
                            aria-label={`Show result ${index + 1}`}
                            className="relative h-5 w-9 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface-muted transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-3 before:rounded-full before:bg-fg-muted before:transition-transform checked:border-button-primary checked:bg-button-primary checked:before:translate-x-4 checked:before:bg-button-primary-fg"
                          />
                        </label>
                        <button type="button" onClick={() => moveMetric(index, -1)} disabled={index === 0} aria-label={`Move result ${index + 1} up`} className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30">
                          <ArrowUp className="size-3.5" aria-hidden />
                        </button>
                        <button type="button" onClick={() => moveMetric(index, 1)} disabled={index === content.metrics.length - 1} aria-label={`Move result ${index + 1} down`} className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30">
                          <ArrowDown className="size-3.5" aria-hidden />
                        </button>
                        <button type="button" onClick={() => void removeMetric(index)} aria-label={`Remove result ${index + 1}`} className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-danger-subtle hover:text-danger">
                          <Trash2 className="size-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] gap-4">
                      <div className="col-span-3">
                        <TextField label="Label" value={metric.label} onChange={(ev) => updateMetric(index, { label: ev.target.value })} maxLength={32} placeholder="e.g. Average ROAS" errors={e(`metrics.${index}.label`)} />
                      </div>
                      <TextField label="Prefix" value={metric.prefix} onChange={(ev) => updateMetric(index, { prefix: ev.target.value })} maxLength={3} placeholder="$" errors={e(`metrics.${index}.prefix`)} />
                      <TextField label="Value" inputMode="decimal" value={metric.value} onChange={(ev) => updateMetric(index, { value: ev.target.value })} placeholder="4.8" errors={e(`metrics.${index}.value`)} />
                      <TextField label="Suffix" value={metric.suffix} onChange={(ev) => updateMetric(index, { suffix: ev.target.value })} maxLength={4} placeholder="x" errors={e(`metrics.${index}.suffix`)} />
                    </div>
                  </li>
                );
              })}
            </ol>
            {e("metrics") && <p className="text-small text-danger" role="alert">{e("metrics")![0]}</p>}
            <div className="flex items-center justify-between gap-4">
              <p className="text-small text-fg-muted">{content.metrics.length} of {HERO_METRIC_LIMIT}</p>
              <Button variant="secondary" onClick={addMetric} disabled={content.metrics.length >= HERO_METRIC_LIMIT}>
                <Plus className="size-4" aria-hidden />
                Add result
              </Button>
            </div>
          </FormSection>

          <FormSection stacked title="Performance graph" description="Plotted in order, for example monthly revenue. Growth is calculated from the first and last value.">
            <TextField label="Graph label" value={content.chart.label} onChange={(ev) => update("chart", { ...content.chart, label: ev.target.value })} maxLength={40} errors={e("chart.label")} placeholder="e.g. Monthly revenue" />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Start label" value={content.chart.startLabel} onChange={(ev) => update("chart", { ...content.chart, startLabel: ev.target.value })} maxLength={12} errors={e("chart.startLabel")} placeholder="e.g. Jan" />
              <TextField label="End label" value={content.chart.endLabel} onChange={(ev) => update("chart", { ...content.chart, endLabel: ev.target.value })} maxLength={12} errors={e("chart.endLabel")} placeholder="e.g. Dec" />
            </div>
            <TextField
              label="Values"
              value={pointsText}
              onChange={(ev) => {
                setPointsText(ev.target.value);
                setDirty(true);
              }}
              inputMode="decimal"
              errors={e("chart.points")}
              placeholder="e.g. 120, 135, 128, 160, 190"
              hint={(() => {
                const points = parsePoints(pointsText);
                if (!points || points.length < 2) return `2 to ${HERO_CHART_MAX_POINTS} values, separated by commas. Leave empty for a neutral curve.`;
                const growth = chartGeometry(points).growth;
                if (growth === null) return `${points.length} values`;
                const parts = growthParts(growth);
                return `${points.length} values · growth ${parts.prefix}${parts.value}%`;
              })()}
            />
          </FormSection>

          <FormSection stacked title="Performance visual" description="Small captions on the graph.">
            <TextField label="Chart caption" value={content.visualLabel} onChange={(ev) => update("visualLabel", ev.target.value)} maxLength={40} errors={e("visualLabel")} placeholder="e.g. Campaign performance" />
            <ChannelsField
              channels={content.channels}
              errors={errors}
              onChange={(channels) => update("channels", channels)}
            />
          </FormSection>

          <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            {dirty && <span className="mr-auto text-small text-fg-muted">Unsaved changes</span>}
            <Button type="submit" loading={pending}>
              Save hero
            </Button>
          </div>
        </form>

        <aside aria-label="Preview" className="2xl:sticky 2xl:top-24 2xl:self-start">
          <PreviewFrame path={previewPath} version={version} />
        </aside>
      </div>
    </div>
  );
}

function ChannelsField({
  channels,
  errors,
  onChange,
}: {
  channels: string[];
  errors: Errors;
  onChange: (channels: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (!value || channels.length >= HERO_CHANNEL_LIMIT) return;
    onChange([...channels, value.slice(0, 20)]);
    setDraft("");
  };
  const error = errors.channels?.[0] ?? Object.entries(errors).find(([key]) => key.startsWith("channels."))?.[1][0];
  return (
    <div>
      <p className="mb-1.5 text-small font-medium text-fg">Channels</p>
      {channels.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2" aria-label="Channels">
          {channels.map((channel, index) => (
            <li key={`${channel}-${index}`} className="inline-flex h-8 items-center gap-1 rounded-sm border border-line bg-surface pr-1 pl-3 text-small text-fg">
              {channel}
              <button type="button" onClick={() => onChange(channels.filter((_, i) => i !== index))} aria-label={`Remove ${channel}`} className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg">
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(ev) => setDraft(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              add();
            }
          }}
          maxLength={20}
          disabled={channels.length >= HERO_CHANNEL_LIMIT}
          placeholder={channels.length >= HERO_CHANNEL_LIMIT ? `Up to ${HERO_CHANNEL_LIMIT} channels` : "e.g. Google Ads"}
          aria-label="Add a channel"
          className="h-11 min-w-0 flex-1 rounded-sm border border-line-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted focus:border-focus focus:outline-2 focus:outline-offset-[-1px] focus:outline-focus disabled:opacity-60"
        />
        <Button variant="secondary" onClick={add} disabled={!draft.trim() || channels.length >= HERO_CHANNEL_LIMIT}>
          Add
        </Button>
      </div>
      {error ? (
        <p className="mt-1.5 text-small text-danger" role="alert">{error}</p>
      ) : (
        <p className="mt-1.5 text-small text-fg-muted">Platforms you run campaigns on, shown as small captions.</p>
      )}
    </div>
  );
}
