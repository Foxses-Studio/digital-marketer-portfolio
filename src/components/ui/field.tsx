"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

const controlClasses =
  "h-11 w-full rounded-sm border bg-surface px-3 text-body text-fg placeholder:text-fg-muted transition-colors focus:border-focus focus:outline-2 focus:outline-offset-[-1px] focus:outline-focus disabled:opacity-60";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  errors?: string[];
  children: ReactNode;
};

function FieldShell({ id, label, hint, errors, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-small font-medium text-fg">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${id}-error`} className="mt-1.5 text-small text-danger" role="alert">
          {errors[0]}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-1.5 text-small text-fg-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
};

export function TextField({ label, hint, errors, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const invalid = Boolean(errors?.length);
  return (
    <FieldShell id={inputId} label={label} hint={hint} errors={errors}>
      <input
        id={inputId}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(controlClasses, invalid ? "border-danger" : "border-line-strong", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const invalid = Boolean(props.errors?.length);
  const { label, hint, errors, className, ...rest } = props;
  return (
    <FieldShell id={inputId} label={label} hint={hint} errors={errors}>
      <div className="relative">
        <input
          {...rest}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(controlClasses, "pr-11", invalid ? "border-danger" : "border-line-strong", className)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-sm text-fg-muted hover:text-fg"
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
  options: ReadonlyArray<{ value: string; label: string }>;
};

export function SelectField({ label, hint, errors, options, id, className, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const invalid = Boolean(errors?.length);
  return (
    <FieldShell id={selectId} label={label} hint={hint} errors={errors}>
      <select
        id={selectId}
        aria-invalid={invalid || undefined}
        className={cn(controlClasses, invalid ? "border-danger" : "border-line-strong", className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
  /** Shows a live character count against maxLength. */
  showCount?: boolean;
};

export function TextareaField({
  label,
  hint,
  errors,
  id,
  className,
  showCount,
  maxLength,
  defaultValue,
  onChange,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const invalid = Boolean(errors?.length);
  const [count, setCount] = useState(String(defaultValue ?? "").length);
  return (
    <FieldShell
      id={fieldId}
      label={label}
      errors={errors}
      hint={
        showCount && maxLength ? (
          <span className="flex justify-between gap-4">
            <span>{hint}</span>
            <span className="tabular-nums">
              {count}/{maxLength}
            </span>
          </span>
        ) : (
          hint
        )
      }
    >
      <textarea
        id={fieldId}
        maxLength={maxLength}
        defaultValue={defaultValue}
        onChange={(event) => {
          setCount(event.target.value.length);
          onChange?.(event);
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${fieldId}-error` : `${fieldId}-hint`}
        className={cn(
          "min-h-24 w-full rounded-sm border bg-surface px-3 py-2.5 text-body text-fg placeholder:text-fg-muted transition-colors focus:border-focus focus:outline-2 focus:outline-offset-[-1px] focus:outline-focus",
          invalid ? "border-danger" : "border-line-strong",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

type SwitchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: ReactNode;
};

/** On/off setting. Submits "on" when checked, like a checkbox. */
export function SwitchField({ label, description, id, className, ...props }: SwitchFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <label htmlFor={fieldId} className="block cursor-pointer text-small font-medium text-fg">
          {label}
        </label>
        {description && (
          <p id={`${fieldId}-description`} className="mt-0.5 text-small text-fg-muted">
            {description}
          </p>
        )}
      </div>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={fieldId}
          type="checkbox"
          role="switch"
          aria-describedby={description ? `${fieldId}-description` : undefined}
          className="peer h-6 w-10 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface-muted transition-colors checked:border-button-primary checked:bg-button-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 left-1 size-4 rounded-full bg-fg-muted transition-transform duration-150 peer-checked:translate-x-4 peer-checked:bg-button-primary-fg"
        />
      </span>
    </div>
  );
}
