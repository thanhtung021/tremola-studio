import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { Field, inputClass } from "@/components/forms/Field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  adminGetFounding,
  adminListLeads,
  adminSetFounding,
  adminUpdateLead,
  adminWhoAmI,
  LEAD_STATUSES,
  type LeadRow,
  type LeadStatus,
  type ListInput,
} from "@/lib/admin.functions";
import { cn } from "@/lib/utils";
import { toCsv } from "./csv";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  audit_sent: "Audit sent",
  call_booked: "Call booked",
  won: "Won",
  lost: "Lost",
};

type Session = { email: string; isAdmin: boolean } | null;

export function AdminPage() {
  const whoAmI = useServerFn(adminWhoAmI);
  const [session, setSession] = useState<Session | "loading">("loading");

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setSession(null);
    try {
      setSession(await whoAmI());
    } catch {
      setSession(null);
    }
  }, [whoAmI]);

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => void refresh());
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  return (
    <div className="container-site min-h-screen pb-24 pt-32">
      {session === "loading" ? (
        <p className="label-mono text-muted-foreground">Loading…</p>
      ) : session === null ? (
        <Login />
      ) : !session.isAdmin ? (
        <div className="card-tremola max-w-lg p-8">
          <h1 className="text-[32px]">No access</h1>
          <p className="mt-4">
            {session.email} is signed in but does not have the admin role. Ask the owner to grant
            it.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => void supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      ) : (
        <Dashboard email={session.email} />
      )}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error" | "reset-sent">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setState(error ? "error" : "idle");
  }

  async function onReset() {
    if (!email) return setState("error");
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    setState("reset-sent");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center gap-4">
        <TremolaLogo size={48} />
        <h1 className="text-[32px]">Admin</h1>
      </div>
      <form onSubmit={onSubmit} className="card-tremola mt-8 space-y-6 p-8" noValidate>
        <Field id="admin-email" label="Email" required>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="admin-password" label="Password" required>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        {state === "error" && (
          <p role="alert" className="text-small text-ivory">
            Sign-in failed. Check the email and password.
          </p>
        )}
        {state === "reset-sent" && (
          <p role="status" className="text-small text-ivory">
            If this address has an account, a reset link is on its way.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Signing in…" : "Sign in"}
          </Button>
          <button type="button" onClick={() => void onReset()} className="link-draw text-small">
            Forgot password
          </button>
        </div>
        <p className="label-mono text-muted-foreground">
          Accounts are created by the owner. There is no public sign-up.
        </p>
      </form>
    </div>
  );
}

const emptyFilters: Omit<ListInput, "kind"> = {
  from: null,
  to: null,
  locale: null,
  qualified: null,
  status: null,
};

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<"audit" | "pack" | "founding">("audit");
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono text-muted-foreground">Tremola Studio · Admin</p>
          <h1 className="mt-2 text-[40px]">Leads</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-small">{email}</span>
          <Button variant="outline" size="sm" onClick={() => void supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>
      <div role="tablist" aria-label="Admin sections" className="mt-10 flex flex-wrap gap-2">
        {(
          [
            ["audit", "Sound Audit requests"],
            ["pack", "Free Pack sign-ups"],
            ["founding", "Founding slots"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-small transition-colors",
              tab === k
                ? "border-muted-foreground bg-raised text-body"
                : "border-hairline text-body hover:border-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "founding" ? <FoundingEditor /> : <LeadTable key={tab} kind={tab} />}
      </div>
    </>
  );
}

const AUDIT_COLUMNS = [
  "created_at",
  "status",
  "qualified",
  "locale",
  "name",
  "email",
  "company",
  "role",
  "listen_to",
  "link",
  "team_size",
  "launch",
  "budget",
  "app_status",
  "heard_from",
  "pain",
  "notes",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "referrer",
  "landing_page",
  "id",
];
const PACK_COLUMNS = [
  "created_at",
  "status",
  "locale",
  "name",
  "email",
  "making",
  "downloads",
  "notes",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "referrer",
  "landing_page",
  "id",
];

function LeadTable({ kind }: { kind: "audit" | "pack" }) {
  const list = useServerFn(adminListLeads);
  const [filters, setFilters] = useState(emptyFilters);
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await list({ data: { kind, ...filters } });
      setRows(res.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [list, kind, filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = kind === "audit" ? AUDIT_COLUMNS : PACK_COLUMNS;
  const set = <K extends keyof typeof filters>(k: K, v: (typeof filters)[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  function exportCsv() {
    if (!rows) return;
    const blob = new Blob([toCsv(rows, columns)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tremola-${kind === "audit" ? "audit-requests" : "pack-signups"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const counts = useMemo(() => {
    const c = { total: rows?.length ?? 0, qualified: 0, new: 0 };
    for (const r of rows ?? []) {
      if (r["qualified"] === true) c.qualified++;
      if (r["status"] === "new") c.new++;
    }
    return c;
  }, [rows]);

  return (
    <section aria-label={kind === "audit" ? "Sound Audit requests" : "Free Pack sign-ups"}>
      <div className="card-tremola grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <Field id={`${kind}-from`} label="From">
          <input
            id={`${kind}-from`}
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => set("from", e.target.value || null)}
            className={inputClass}
          />
        </Field>
        <Field id={`${kind}-to`} label="To">
          <input
            id={`${kind}-to`}
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => set("to", e.target.value || null)}
            className={inputClass}
          />
        </Field>
        <Field id={`${kind}-locale`} label="Locale">
          <select
            id={`${kind}-locale`}
            value={filters.locale ?? ""}
            onChange={(e) => set("locale", (e.target.value || null) as ListInput["locale"])}
            className={inputClass}
          >
            <option value="">All</option>
            <option value="en">EN</option>
            <option value="vi">VI</option>
          </select>
        </Field>
        {kind === "audit" && (
          <Field id={`${kind}-qualified`} label="Qualified">
            <select
              id={`${kind}-qualified`}
              value={filters.qualified === null ? "" : String(filters.qualified)}
              onChange={(e) =>
                set("qualified", e.target.value === "" ? null : e.target.value === "true")
              }
              className={inputClass}
            >
              <option value="">All</option>
              <option value="true">Qualified</option>
              <option value="false">Not qualified</option>
            </select>
          </Field>
        )}
        <Field id={`${kind}-status`} label="Status">
          <select
            id={`${kind}-status`}
            value={filters.status ?? ""}
            onChange={(e) => set("status", (e.target.value || null) as ListInput["status"])}
            className={inputClass}
          >
            <option value="">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
            Reset
          </Button>
          <Button onClick={exportCsv} disabled={!rows?.length}>
            CSV
          </Button>
        </div>
      </div>

      <p className="label-mono mt-6 text-muted-foreground">
        {counts.total} rows
        {kind === "audit" ? ` · ${counts.qualified} qualified` : ""} · {counts.new} new
      </p>
      {error && (
        <p role="alert" className="mt-4 text-ivory">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-card border border-hairline">
        <table className="w-full min-w-[760px] text-left text-small">
          <thead className="bg-surface">
            <tr>
              {[
                "Date",
                "Status",
                ...(kind === "audit" ? ["Q"] : []),
                "Lang",
                "Name",
                kind === "audit" ? "Company" : "Making",
                kind === "audit" ? "Budget" : "Downloads",
                "",
              ].map((h, i) => (
                <th key={i} scope="col" className="label-mono px-4 py-3 text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const id = String(r["id"]);
              return (
                <LeadRowView
                  key={id}
                  kind={kind}
                  row={r}
                  open={open === id}
                  onToggle={() => setOpen(open === id ? null : id)}
                  onSaved={load}
                />
              );
            })}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-muted-foreground">
                  No rows for these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LeadRowView({
  kind,
  row,
  open,
  onToggle,
  onSaved,
}: {
  kind: "audit" | "pack";
  row: LeadRow;
  open: boolean;
  onToggle: () => void;
  onSaved: () => Promise<void>;
}) {
  const update = useServerFn(adminUpdateLead);
  const [status, setStatus] = useState(String(row["status"] ?? "new") as LeadStatus);
  const [notes, setNotes] = useState(String(row["notes"] ?? ""));
  const [saving, setSaving] = useState(false);
  const date = new Date(String(row["created_at"]));

  async function save(next = status) {
    setSaving(true);
    try {
      await update({ data: { kind, id: String(row["id"]), status: next, notes: notes || null } });
      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  const skip = new Set(["id"]);
  return (
    <>
      <tr className="border-t border-hairline align-top">
        <td className="whitespace-nowrap px-4 py-3">
          {date.toLocaleDateString("en-GB")}{" "}
          <span className="text-muted-foreground">
            {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </td>
        <td className="px-4 py-3">
          <select
            aria-label="Status"
            value={status}
            disabled={saving}
            onChange={(e) => {
              const v = e.target.value as LeadStatus;
              setStatus(v);
              void save(v);
            }}
            className="rounded-full border border-hairline bg-background px-3 py-1 text-small text-body"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </td>
        {kind === "audit" && <td className="px-4 py-3">{row["qualified"] === true ? "●" : "○"}</td>}
        <td className="label-mono px-4 py-3">{String(row["locale"]).toUpperCase()}</td>
        <td className="px-4 py-3">
          <span className="text-ivory">{String(row["name"])}</span>
          <br />
          <a href={`mailto:${String(row["email"])}`} className="link-draw">
            {String(row["email"])}
          </a>
        </td>
        <td className="px-4 py-3">{String(row[kind === "audit" ? "company" : "making"] ?? "")}</td>
        <td className="px-4 py-3">
          {String(row[kind === "audit" ? "budget" : "downloads"] ?? "")}
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="link-draw cursor-pointer"
          >
            {open ? "Close" : "Details"}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="bg-surface">
          <td colSpan={8} className="px-4 py-6">
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(row)
                .filter(([k]) => !skip.has(k) && k !== "notes")
                .map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="label-mono text-muted-foreground">{k}</dt>
                    <dd className="break-words text-body">
                      {k === "link" && typeof v === "string" ? (
                        <a href={v} target="_blank" rel="noreferrer" className="link-draw">
                          {v}
                        </a>
                      ) : v === null || v === "" ? (
                        "—"
                      ) : (
                        String(v)
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
            <div className="mt-6 max-w-2xl">
              <Field id={`notes-${String(row["id"])}`} label="Internal notes">
                <textarea
                  id={`notes-${String(row["id"])}`}
                  rows={3}
                  maxLength={4000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Button className="mt-3" size="sm" disabled={saving} onClick={() => void save()}>
                {saving ? "Saving…" : "Save notes"}
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function FoundingEditor() {
  const get = useServerFn(adminGetFounding);
  const setFounding = useServerFn(adminSetFounding);
  const [total, setTotal] = useState("");
  const [remaining, setRemaining] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    void get().then((f) => {
      setTotal(String(f.total));
      setRemaining(String(f.remaining));
      setUpdatedAt(f.updated_at);
    });
  }, [get]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = Number(total);
    const r = Number(remaining);
    if (!Number.isInteger(t) || !Number.isInteger(r) || r < 0 || r > t) return setState("error");
    setState("saving");
    try {
      await setFounding({ data: { total: t, remaining: r } });
      setUpdatedAt(new Date().toISOString());
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-tremola max-w-lg space-y-6 p-8" noValidate>
      <p>
        Shown on the homepage strip and the Services page. Setting remaining to 0 hides the founding
        offer. The site picks up changes within about a minute.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Field id="founding-total" label="Total slots" required>
          <input
            id="founding-total"
            inputMode="numeric"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="founding-remaining" label="Remaining" required>
          <input
            id="founding-remaining"
            inputMode="numeric"
            value={remaining}
            onChange={(e) => setRemaining(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      {state === "error" && (
        <p role="alert" className="text-small text-ivory">
          Remaining must be a whole number between 0 and the total.
        </p>
      )}
      {state === "saved" && (
        <p role="status" className="text-small text-ivory">
          Saved.
        </p>
      )}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save"}
        </Button>
        {updatedAt && (
          <span className="label-mono text-muted-foreground">
            Updated {new Date(updatedAt).toLocaleString("en-GB")}
          </span>
        )}
      </div>
    </form>
  );
}
