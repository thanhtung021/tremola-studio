import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { packCopy } from "@/content/forms";
import type { Locale } from "@/i18n";
import { getAttribution } from "@/lib/attribution";
import { packSchema } from "@/lib/leads";
import { submitPackSignup } from "@/lib/leads.functions";
import { track } from "@/lib/track";
import { Field, Honeypot, honeypotValue, inputClass, Select } from "./Field";

export function PackForm({ locale }: { locale: Locale }) {
  const c = packCopy[locale];
  const submit = useServerFn(submitPackSignup);
  const [v, setV] = useState({ name: "", email: "", making: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = packSchema.safeParse({
      locale,
      ...v,
      ...getAttribution(),
      website: honeypotValue(e.currentTarget as HTMLFormElement),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues)
        errs[String(i.path[0])] = c.errors[String(i.path[0])] ?? c.failed;
      setErrors(errs);
      document.getElementById(`p-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await submit({ data: parsed.data });
      setDownloadUrl(res.downloadUrl);
      track("pack_signup", { locale, making: v.making });
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card-tremola p-10" role="status">
        {downloadUrl && (
          <Button asChild size="lg">
            {/* Signed, time-limited link served by /api/pack/download (private R2 bucket). */}
            <a href={downloadUrl} rel="nofollow">
              {c.download}
            </a>
          </Button>
        )}
        <p className="mt-6 text-ivory">{c.inbox}</p>
      </div>
    );
  }

  const set = (k: keyof typeof v, val: string) => {
    setV((p) => ({ ...p, [k]: val }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-8 rounded-card border border-hairline bg-surface p-6 md:p-10"
    >
      <Honeypot />
      <h2 className="text-[28px]">{c.formTitle}</h2>
      <Field id="p-name" label={c.fields.name} required error={errors["name"] || undefined}>
        <input
          id="p-name"
          autoComplete="name"
          maxLength={120}
          value={v.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={!!errors["name"] || undefined}
          className={inputClass}
        />
      </Field>
      <Field id="p-email" label={c.fields.email} required error={errors["email"] || undefined}>
        <input
          id="p-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          value={v.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors["email"] || undefined}
          className={inputClass}
        />
      </Field>
      <Field id="p-making" label={c.fields.making} required error={errors["making"] || undefined}>
        <Select
          id="p-making"
          value={v.making}
          onChange={(x) => set("making", x)}
          options={c.making}
          placeholder={c.fields.select}
          invalid={!!errors["making"]}
        />
      </Field>
      {state === "error" && (
        <p role="alert" className="text-small text-ivory">
          {c.failed}
        </p>
      )}
      <Button type="submit" size="lg" disabled={state === "sending"}>
        {state === "sending" ? c.sending : c.submit}
      </Button>
    </form>
  );
}
