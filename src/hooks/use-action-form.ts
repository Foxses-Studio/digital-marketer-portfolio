"use client";

import { useActionState, useEffect, useRef, useState, startTransition, type FormEvent } from "react";
import type { z } from "zod";
import { reportResult } from "@/lib/feedback/alerts";
import type { ActionResult } from "@/types/actions";

type FormAction = (previous: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * Connects a form to a Server Action with the same Zod schema on both
 * sides: the client validates first for instant feedback, the server
 * validates again for security. Field errors from either side are merged;
 * other failures are shown with SweetAlert2.
 */
export function useActionForm<S extends z.ZodType>({
  action,
  schema,
  onSuccess,
  successMessage,
}: {
  action: FormAction;
  schema: S;
  onSuccess?: (result: ActionResult) => void | Promise<void>;
  /** Toast shown on success; set false to handle feedback yourself. */
  successMessage?: string | false;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) {
      if (successMessage !== false) void reportResult(state, { success: successMessage });
      void onSuccess?.(state);
    } else {
      void reportResult(state);
    }
  }, [state, onSuccess, successMessage]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        (errors[issue.path.join(".")] ??= []).push(issue.message);
      }
      setClientErrors(errors);
      const first = event.currentTarget.querySelector<HTMLElement>(
        `[name="${parsed.error.issues[0]?.path.join(".")}"]`,
      );
      first?.focus();
      return;
    }
    setClientErrors({});
    handled.current = null;
    startTransition(() => formAction(formData));
  }

  const serverErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const errors = Object.keys(clientErrors).length ? clientErrors : serverErrors;
  return { onSubmit, pending, errors, state };
}
