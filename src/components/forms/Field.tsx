import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-hairline bg-background px-4 py-3 text-body placeholder:text-muted-foreground outline-none transition-colors focus:border-muted-foreground focus:ring-2 focus:ring-muted-foreground/40";

export function Field({
  id,
  label,
  required,
  optionalLabel,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optionalLabel?: string;
  hint?: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-small text-body">
        {label}
        {required ? (
          <span className="text-body"> *</span>
        ) : optionalLabel ? (
          <span className="text-muted-foreground"> ({optionalLabel})</span>
        ) : null}
      </label>
      {hint && <p className="label-mono text-muted-foreground">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-small text-body">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
  placeholder: string;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={cn(inputClass, "appearance-none")}
    >
      <option value="">{placeholder}</option>
      {Object.entries(options).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}
