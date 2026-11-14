import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { Button } from "@/components/ui/button";
import { auditCopy } from "@/content/forms";
import type { Locale } from "@/i18n";
import { getAttribution } from "@/lib/attribution";
import { auditSchema } from "@/lib/leads";
import { submitAuditRequest } from "@/lib/leads.functions";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { Field, Honeypot, honeypotValue, inputClass, Select } from "./Field";

const empty = {
  name: "",
  email: "",
  company: "",
  role: "",
  listenTo: "",
  link: "",
  teamSize: "",
  month: "",
  year: "",
  notSet: false,
  budget: "",
  pain: "",
  heardFrom: "",
  appStatus: "",
};

export function AuditForm({ locale }: { locale: Locale }) {
  const c = auditCopy[locale];
  const submit = useServerFn(submitAuditRequest);
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const started = useRef(false);
  const years = Array.from({ length: 4 }, (_, i) => String(new Date().getFullYear() + i));

  const set = <K extends keyof typeof empty>(k: K, val: (typeof empty)[K]) => {
    if (!started.current) {
      started.current = true;
      track("audit_form_start", { locale });
    }
    setV((p) => ({ ...p, [k]: val }));
    setErrors((e) => ({
      ...e,
      [k === "month" || k === "year" || k === "notSet" ? "launch" : k]: "",
    }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const launch = v.notSet ? null : v.month && v.year ? `${v.year}-${v.month}` : "";
    const input = {
      locale,
      name: v.name,
      email: v.email,
      company: v.company,
      role: v.role,
      listenTo: v.listenTo,
      link: v.link,
      teamSize: v.teamSize,
      launch,
      budget: v.budget,
      pain: v.pain || undefined,
      heardFrom: v.heardFrom || undefined,
      appStatus: locale === "vi" ? v.appStatus : undefined,
      ...getAttribution(),
      website: honeypotValue(e.currentTarget as HTMLFormElement),
    };
    const parsed = auditSchema.safeParse(input);
    const errs: Record<string, string> = {};
    if (!parsed.success)
      for (const i of parsed.error.issues)
        errs[String(i.path[0])] = c.errors[String(i.path[0])] ?? c.failed;
    if (locale === "vi" && !v.appStatus) errs["appStatus"] = c.errors["appStatus"]!;
    if (Object.keys(errs).length) {
      setErrors(errs);
      document.getElementById(`a-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      await submit({ data: parsed.data! });
      track("audit_form_submit", { locale, listen_to: v.listenTo });
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card-tremola flex flex-col items-center p-12 text-center" role="status">
        <TremolaLogo size={88} pluckSignal={1} />
        <p className="mt-8 max-w-md font-display text-[28px] leading-snug text-ivory">{c.thanks}</p>
        <Link
          to={locale === "vi" ? "/vi/free-pack" : "/free-pack"}
          className="link-draw mt-8 text-small"
        >
          {c.packOffer} →
        </Link>
      </div>
    );
  }

  const f = c.fields;
  const err = (k: string) => errors[k] || undefined;
  const text = (
    k: "name" | "email" | "company" | "link",
    type = "text",
    extra: Record<string, string> = {},
  ) => (
    <input
      id={`a-${k}`}
      type={type}
      value={v[k]}
      onChange={(e) => set(k, e.target.value)}
      aria-invalid={!!err(k) || undefined}
      aria-describedby={err(k) ? `a-${k}-error` : undefined}
      className={inputClass}
      {...extra}
    />
  );

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-8 rounded-card border border-hairline bg-surface p-6 md:p-10"
    >
      <Honeypot />
      <Field id="a-name" label={f.name} required error={err("name")}>
        {text("name", "text", { autoComplete: "name", maxLength: "120" })}
      </Field>
      <Field id="a-email" label={f.email} required error={err("email")}>
        {text("email", "email", { autoComplete: "email", maxLength: "255" })}
      </Field>
      <Field id="a-company" label={f.company} required error={err("company")}>
        {text("company", "text", { autoComplete: "organization", maxLength: "160" })}
      </Field>
      <Field id="a-role" label={f.role} required error={err("role")}>
        <Select
          id="a-role"
          value={v.role}
          onChange={(x) => set("role", x)}
          options={c.options.role}
          placeholder={f.select}
          invalid={!!err("role")}
        />
      </Field>
      {locale === "vi" && (
        <Field id="a-appStatus" label={f.appStatus} required error={err("appStatus")}>
          <Select
            id="a-appStatus"
            value={v.appStatus}
            onChange={(x) => set("appStatus", x)}
            options={c.options.appStatus}
            placeholder={f.select}
            invalid={!!err("appStatus")}
          />
        </Field>
      )}
      <Field id="a-listenTo" label={f.listenTo} required error={err("listenTo")}>
        <div id="a-listenTo" tabIndex={-1} role="radiogroup" className="flex flex-wrap gap-2">
          {Object.entries(c.options.listenTo).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={v.listenTo === k}
              onClick={() => set("listenTo", k)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-small transition-colors",
                v.listenTo === k
                  ? "border-muted-foreground bg-raised text-body"
                  : "border-hairline text-body hover:border-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      <Field id="a-link" label={f.link} required hint={f.linkHint} error={err("link")}>
        {text("link", "url", { placeholder: "https://", maxLength: "500" })}
      </Field>
      <Field id="a-teamSize" label={f.teamSize} required error={err("teamSize")}>
        <Select
          id="a-teamSize"
          value={v.teamSize}
          onChange={(x) => set("teamSize", x)}
          options={c.options.teamSize}
          placeholder={f.select}
          invalid={!!err("teamSize")}
        />
      </Field>
      <Field id="a-launch" label={f.launch} required error={err("launch")}>
        <div className="grid grid-cols-2 gap-3">
          <select
            id="a-launch"
            aria-label={f.month}
            disabled={v.notSet}
            value={v.month}
            onChange={(e) => set("month", e.target.value)}
            className={cn(inputClass, "appearance-none disabled:opacity-40")}
          >
            <option value="">{f.month}</option>
            {c.months.map((m, i) => (
              <option key={m} value={String(i + 1).padStart(2, "0")}>
                {m}
              </option>
            ))}
          </select>
          <select
            aria-label={f.year}
            disabled={v.notSet}
            value={v.year}
            onChange={(e) => set("year", e.target.value)}
            className={cn(inputClass, "appearance-none disabled:opacity-40")}
          >
            <option value="">{f.year}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-3 text-small">
          <input
            type="checkbox"
            checked={v.notSet}
            onChange={(e) => set("notSet", e.target.checked)}
            className="size-4 accent-muted-foreground"
          />
          {f.notSet}
        </label>
      </Field>
      <Field id="a-budget" label={f.budget} required error={err("budget")}>
        <Select
          id="a-budget"
          value={v.budget}
          onChange={(x) => set("budget", x)}
          options={c.options.budget}
          placeholder={f.select}
          invalid={!!err("budget")}
        />
      </Field>
      <Field id="a-pain" label={f.pain} optionalLabel={f.optional} error={err("pain")}>
        <textarea
          id="a-pain"
          rows={4}
          maxLength={2000}
          value={v.pain}
          onChange={(e) => set("pain", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field
        id="a-heardFrom"
        label={f.heardFrom}
        optionalLabel={f.optional}
        error={err("heardFrom")}
      >
        <Select
          id="a-heardFrom"
          value={v.heardFrom}
          onChange={(x) => set("heardFrom", x)}
          options={c.options.heardFrom}
          placeholder={f.select}
        />
      </Field>
      {state === "error" && (
        <p role="alert" className="text-small text-ivory">
          {c.failed}
        </p>
      )}
      <Button type="submit" size="lg" disabled={state === "sending"} className="w-full sm:w-auto">
        {state === "sending" ? c.sending : c.submit}
      </Button>
    </form>
  );
}
