"use client";

import { ArrowDown, ArrowUp, ExternalLink, PanelTop, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useOptimistic, useState, useTransition } from "react";
import {
  createNavItem,
  deleteNavItem,
  reorderNavItems,
  setNavItemEnabled,
  updateNavItem,
} from "@/actions/navigation";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { SwitchField, TextField } from "@/components/ui/field";
import { useActionForm } from "@/hooks/use-action-form";
import { confirmDelete, reportResult } from "@/lib/feedback/alerts";
import { cn } from "@/lib/utils/cn";
import { navItemFormInput, navItemFormSchema } from "@/validation/navigation";
import type { NavItem } from "@/validation/settings";

/**
 * Header menu editor. Every change is saved immediately through its own
 * Server Action; reordering is optimistic and rolls back on failure.
 */
export function NavItemsManager({ items: initial, limit }: { items: NavItem[]; limit: number }) {
  const router = useRouter();
  // Optimistic list: shows changes instantly and settles on the server's
  // data (or rolls back) when the action finishes.
  const [items, setItems] = useOptimistic(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    startTransition(async () => {
      setItems(next);
      await reportResult(await reorderNavItems({ order: next.map((item) => item.id) }));
      router.refresh();
    });
  }

  function toggle(item: NavItem) {
    startTransition(async () => {
      setItems(items.map((i) => (i.id === item.id ? { ...i, enabled: !i.enabled } : i)));
      await reportResult(await setNavItemEnabled({ id: item.id, enabled: !item.enabled }));
      router.refresh();
    });
  }

  async function remove(item: NavItem) {
    if (!(await confirmDelete(`"${item.label}"`))) return;
    startTransition(async () => {
      await reportResult(await deleteNavItem({ id: item.id }));
      router.refresh();
    });
  }

  const closeEditor = useCallback(() => {
    setEditing(null);
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-4">
      {items.length === 0 && editing !== "new" ? (
        <EmptyState icon={PanelTop} title="No menu items" description="The header shows only your brand and button until you add items." />
      ) : (
        <ol className={cn("divide-y divide-line rounded-md border border-line bg-surface", pending && "opacity-80")} aria-label="Menu items">
          {items.map((item, index) =>
            editing === item.id ? (
              <li key={item.id} className="p-4">
                <NavItemForm item={item} onDone={closeEditor} />
              </li>
            ) : (
              <li key={item.id} className="flex items-center gap-3 px-3 py-3 sm:px-4" data-nav-item={item.label}>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || pending}
                    aria-label={`Move ${item.label} up`}
                    className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1 || pending}
                    aria-label={`Move ${item.label} down`}
                    className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" aria-hidden />
                  </button>
                </div>
                <div className={cn("min-w-0 flex-1", !item.enabled && "opacity-50")}>
                  <p className="flex items-center gap-1.5 truncate text-small font-medium text-fg">
                    {item.label}
                    {item.newTab && <ExternalLink className="size-3 text-fg-muted" aria-label="Opens in a new tab" />}
                  </p>
                  <p className="truncate text-[0.8125rem] text-fg-muted">{item.url}</p>
                </div>
                <label className="flex items-center gap-2 text-small text-fg-secondary">
                  <span className="hidden sm:inline">{item.enabled ? "Shown" : "Hidden"}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={item.enabled}
                    onChange={() => toggle(item)}
                    aria-label={`Show ${item.label} in the menu`}
                    className="h-5 w-9 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface-muted transition-colors checked:border-button-primary checked:bg-button-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus relative before:absolute before:top-[3px] before:left-[3px] before:size-3 before:rounded-full before:bg-fg-muted before:transition-transform checked:before:translate-x-4 checked:before:bg-button-primary-fg"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setEditing(item.id)}
                  aria-label={`Edit ${item.label}`}
                  className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg"
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  aria-label={`Delete ${item.label}`}
                  className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-danger-subtle hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </li>
            ),
          )}
        </ol>
      )}

      {editing === "new" ? (
        <div className="rounded-md border border-line bg-surface p-4">
          <NavItemForm onDone={closeEditor} />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-small text-fg-muted">
            {items.length} of {limit} items
          </p>
          <Button variant="secondary" onClick={() => setEditing("new")} disabled={items.length >= limit}>
            <Plus className="size-4" aria-hidden />
            Add item
          </Button>
        </div>
      )}
    </div>
  );
}

function NavItemForm({ item, onDone }: { item?: NavItem; onDone: () => void }) {
  const { onSubmit, pending, errors } = useActionForm({
    action: item ? updateNavItem.bind(null, item.id) : createNavItem,
    schema: navItemFormSchema,
    toInput: navItemFormInput,
    onSuccess: onDone,
  });
  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-4" aria-label={item ? `Edit ${item.label}` : "New menu item"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Label" name="label" defaultValue={item?.label} maxLength={30} required autoFocus errors={errors.label} />
        <TextField label="Link" name="url" defaultValue={item?.url} required placeholder="/about or https://" errors={errors.url} hint="A page path like /about, an anchor like #contact, or a full URL." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SwitchField label="Show in menu" name="enabled" defaultChecked={item?.enabled ?? true} />
        <SwitchField label="Open in a new tab" name="newTab" defaultChecked={item?.newTab ?? false} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {item ? "Save item" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
