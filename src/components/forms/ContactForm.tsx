import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactCopy } from "@/content/contact";
import type { Locale } from "@/i18n";
import { contactSchema } from "@/lib/leads";
import { submitContactMessage } from "@/lib/leads.functions";
import { Field, Honeypot, honeypotValue, inputClass } from "./Field";

export function ContactForm({ locale }: { locale: Locale }) {
  const c = contactCopy[locale];
  const submit = useServerFn(submitContactMessage);
  const [values, setValues] = useState({ name: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const update = (key: keyof typeof values, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };
  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (state === "sending") return;
    const parsed = contactSchema.safeParse({
      locale,
      ...values,
      website: honeypotValue(event.currentTarget as HTMLFormElement),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = c.errors[String(issue.path[0])] ?? c.failed;
      setErrors(next);
      document.getElementById(`contact-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      await submit({ data: parsed.data });
      setState("done");
    } catch {
      setState("error");
    }
  }
  if (state === "done")
    return (
      <p role="status" className="border-t border-hairline py-8 text-ivory">
        {c.success}
      </p>
    );
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-6"
      aria-label={locale === "vi" ? "Liên hệ Tremola Studio" : "Contact Tremola Studio"}
    >
      <Honeypot />
      <fieldset disabled={state === "sending"} className="grid min-w-0 gap-6 sm:grid-cols-2">
        {(["name", "email", "company"] as const).map((key) => (
          <div key={key} className={key === "company" ? "sm:col-span-2" : "min-w-0"}>
            <Field
              id={`contact-${key}`}
              label={c[key]}
              required={key !== "company"}
              {...(key === "company" ? { optionalLabel: c.optional } : {})}
              error={errors[key] || undefined}
            >
              <input
                id={`contact-${key}`}
                name={key}
                type={key === "email" ? "email" : "text"}
                autoComplete={key === "company" ? "organization" : key}
                maxLength={key === "name" ? 120 : key === "email" ? 255 : 160}
                value={values[key]}
                onChange={(e) => update(key, e.target.value)}
                required={key !== "company"}
                aria-invalid={!!errors[key] || undefined}
                aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
                className={inputClass}
              />
            </Field>
          </div>
        ))}
        <div className="sm:col-span-2">
          <Field
            id="contact-message"
            label={c.message}
            required
            error={errors["message"] || undefined}
          >
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              maxLength={2000}
              required
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              aria-invalid={!!errors["message"] || undefined}
              aria-describedby={errors["message"] ? "contact-message-error" : undefined}
              className={`${inputClass} min-h-40 resize-y`}
            />
          </Field>
        </div>
      </fieldset>
      {state === "error" && (
        <p role="alert" className="text-small text-ivory">
          {c.failed}
        </p>
      )}
      <Button type="submit" size="lg" disabled={state === "sending"}>
        <Send aria-hidden />
        {state === "sending" ? c.sending : c.submit}
      </Button>
    </form>
  );
}
