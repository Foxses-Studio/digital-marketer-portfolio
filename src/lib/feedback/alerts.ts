import type { SweetAlertOptions } from "sweetalert2";
import type { ActionResult } from "@/types/actions";

/**
 * SweetAlert2 helpers: the only way the app shows dialogs and toasts.
 * Client-side only; the library loads on first use, so it never adds to
 * the initial bundle. Never use window.alert() / window.confirm().
 * Styling lives in src/styles/feedback.css.
 */

async function swal() {
  return (await import("sweetalert2")).default;
}

const classes = {
  popup: "dm-swal-popup",
  title: "dm-swal-title",
  htmlContainer: "dm-swal-body",
  actions: "dm-swal-actions",
  confirmButton: "dm-swal-button dm-swal-confirm",
  cancelButton: "dm-swal-button dm-swal-cancel",
  input: "dm-swal-input",
  inputLabel: "dm-swal-input-label",
  validationMessage: "dm-swal-validation",
} as const;

const base: SweetAlertOptions = {
  buttonsStyling: false,
  reverseButtons: true,
  showClass: { popup: "dm-swal-show" },
  hideClass: { popup: "" },
  customClass: classes,
};

type ConfirmOptions = {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  /** Destructive styling and focus on Cancel (delete, deactivate...). */
  destructive?: boolean;
};

/** Asks for confirmation. Resolves true only if the user confirmed. */
export async function confirmAction({
  title,
  text,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  const Swal = await swal();
  const result = await Swal.fire({
    ...base,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: destructive,
    customClass: {
      ...classes,
      confirmButton: `dm-swal-button ${destructive ? "dm-swal-danger" : "dm-swal-confirm"}`,
    },
  });
  return result.isConfirmed;
}

/** Shorthands for the most common confirmations. */
export const confirmDelete = (itemName: string) =>
  confirmAction({
    title: `Delete ${itemName}?`,
    text: "This can't be undone.",
    confirmText: "Delete",
    destructive: true,
  });

export const confirmPublish = (itemName: string) =>
  confirmAction({
    title: `Publish ${itemName}?`,
    text: "It will be visible on the public website.",
    confirmText: "Publish",
  });

/** Blocking success message for important outcomes. */
export async function showSuccess(title: string, text?: string) {
  const Swal = await swal();
  await Swal.fire({ ...base, title, text, confirmButtonText: "Continue" });
}

/** Blocking error message for failures that need attention. */
export async function showError(title: string, text?: string) {
  const Swal = await swal();
  await Swal.fire({ ...base, title, text, confirmButtonText: "OK" });
}

/** Brief, non-blocking notice such as "Saved". */
export async function toast(
  title: string,
  variant: "success" | "error" | "info" = "success",
) {
  const Swal = await swal();
  await Swal.fire({
    toast: true,
    position: "bottom-end",
    title,
    icon: variant === "info" ? undefined : variant,
    iconColor: variant === "error" ? "var(--color-danger)" : "var(--color-success)",
    showConfirmButton: false,
    timer: variant === "error" ? 5000 : 2800,
    timerProgressBar: true,
    customClass: { popup: "dm-swal-toast" },
  });
}

type PromptOptions = {
  title: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  required?: boolean;
  /** Return an error message to keep the dialog open. */
  validate?: (value: string) => string | null;
};

/** Asks for a single line of text. Resolves null if cancelled. */
export async function promptText({
  title,
  label,
  placeholder,
  initialValue = "",
  required = true,
  validate,
}: PromptOptions): Promise<string | null> {
  const Swal = await swal();
  const result = await Swal.fire({
    ...base,
    title,
    input: "text",
    inputLabel: label,
    inputPlaceholder: placeholder,
    inputValue: initialValue,
    showCancelButton: true,
    confirmButtonText: "Save",
    inputValidator: (raw) => {
      const value = raw.trim();
      if (required && !value) return "This field is required.";
      return validate?.(value) ?? null;
    },
  });
  return result.isConfirmed ? String(result.value ?? "").trim() : null;
}

/**
 * Standard feedback for a Server Action result: a toast on success, an
 * error dialog on failure (field errors are shown inline by the form).
 * Returns whether the action succeeded.
 */
export async function reportResult(
  result: ActionResult<unknown>,
  { success }: { success?: string } = {},
): Promise<boolean> {
  if (result.ok) {
    const message = success ?? result.message;
    if (message) void toast(message);
    return true;
  }
  if (!result.fieldErrors) await showError("Couldn't complete that", result.error);
  return false;
}
