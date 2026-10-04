import type { SweetAlertOptions } from "sweetalert2";

/**
 * SweetAlert2 wrappers for confirmations and success/error feedback.
 * Client-side only. The library is loaded on first use so it never adds to
 * the initial bundle. Never use window.alert() / window.confirm().
 * Styling lives in src/styles/feedback.css.
 */

async function swal() {
  return (await import("sweetalert2")).default;
}

const baseClasses = {
  popup: "dm-swal-popup",
  title: "dm-swal-title",
  htmlContainer: "dm-swal-body",
  actions: "dm-swal-actions",
  cancelButton: "dm-swal-button dm-swal-cancel",
} as const;

const base: SweetAlertOptions = {
  buttonsStyling: false,
  reverseButtons: true,
  focusCancel: false,
  showClass: { popup: "" },
  hideClass: { popup: "" },
};

type ConfirmOptions = {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  /** Styles the confirm button as destructive (delete, unpublish...). */
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
      ...baseClasses,
      confirmButton: `dm-swal-button ${destructive ? "dm-swal-danger" : "dm-swal-confirm"}`,
    },
  });
  return result.isConfirmed;
}

/** Blocking message, e.g. for a failed save that needs attention. */
export async function showError(title: string, text?: string) {
  const Swal = await swal();
  await Swal.fire({
    ...base,
    icon: undefined,
    title,
    text,
    confirmButtonText: "OK",
    customClass: { ...baseClasses, confirmButton: "dm-swal-button dm-swal-confirm" },
  });
}

/** Brief, non-blocking confirmation such as "Saved". */
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
    iconColor:
      variant === "error" ? "var(--color-danger)" : "var(--color-success)",
    showConfirmButton: false,
    timer: variant === "error" ? 5000 : 2800,
    timerProgressBar: true,
    customClass: { popup: "dm-swal-toast" },
  });
}
