"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
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
