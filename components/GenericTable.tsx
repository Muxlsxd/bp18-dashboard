"use client";

import { useState, useCallback, useEffect, useEffectEvent, useRef } from "react";
import type { CollectionMeta, FieldDef } from "@/lib/collections";

function badgeClass(value: string): string {
  const v = value.toLowerCase();
  if (v.includes("done") || v.includes("complete") || v.includes("pass") || v.includes("approved") || v.includes("in stock"))
    return "badge badge-done";
  if (v.includes("progress") || v.includes("review") || v.includes("pending") || v.includes("mitigated") || v.includes("low"))
    return "badge badge-progress";
  if (v.includes("block") || v.includes("fail") || v.includes("out") || v.includes("reject") || v.includes("critical") || v.includes("open"))
    return "badge badge-blocked";
  return "badge";
}

// Normalize any date-ish value to YYYY-MM-DD for <input type="date">.
function toDateInput(v: any): string {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function Cell({ field, value }: { field: FieldDef; value: any }) {
  if (field.type === "select") return <span className={badgeClass(String(value || ""))}>{value || "—"}</span>;
  if (field.type === "date" && value) {
    return <span style={{ color: "var(--text)" }}>{toDateInput(value)}</span>;
  }
  if (typeof value === "number") return <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>;
  return <span style={{ color: value ? "var(--text)" : "var(--text-dim)" }}>{value || "—"}</span>;
}

const PAGE_SIZE = 12;

export function GenericTable({ meta }: { meta: CollectionMeta }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async () => {
    const res = await fetch(`/api/${meta.slug}`);
    const data = await res.json();
    return data.rows || [];
  }, [meta.slug]);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetchRows();
    setRows(rows);
    setLoading(false);
  }, [fetchRows]);

  // Initial load on mount. useEffectEvent performs the data fetch (no setState
  // in the effect body); all setState calls happen inside the .then() callback.
  const fetchOnMount = useEffectEvent(() => fetchRows());
  useEffect(() => {
    fetchOnMount().then((rows) => {
      setRows(rows);
      setLoading(false);
    });
  }, []);

  const visibleFields = meta.fields.filter((f) => f.type !== "textarea");

  // Client-side search across visible text/number/select fields.
  const filtered = query.trim()
    ? rows.filter((r) =>
        visibleFields.some((f) => String(r[f.key] ?? "").toLowerCase().includes(query.trim().toLowerCase()))
      )
    : rows;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  async function save(form: any, id?: string) {
    // client validation
    const missing = meta.fields.filter((f) => f.required && !String(form[f.key] ?? "").trim());
    if (missing.length) {
      alert("Required: " + missing.map((m) => m.label).join(", "));
      return;
    }
    setSaving(true);
    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/${meta.slug}/${id}` : `/api/${meta.slug}`;
    // optimistic: build a temp row so the table updates instantly
    if (!id) {
      const temp = { id: "temp-" + Date.now(), ...form };
      setRows((p) => [temp, ...p]);
      setShowForm(false);
      setEditing(null);
    }
    try {
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } finally {
      setSaving(false);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this record?")) return;
    setRows((p) => p.filter((r) => r.id !== id)); // optimistic remove
    await fetch(`/api/${meta.slug}/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap" style={{ gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 18, margin: 0 }}>{meta.label}</h1>
          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>
            {filtered.length} of {rows.length} records
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="input"
            style={{ width: 200 }}
            placeholder="Search…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          />
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            + Add New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--text-dim)" }}>
          <span className="pulse">Loading…</span>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>
                {visibleFields.map((f) => (
                  <th key={f.key} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500 }}>{f.label}</th>
                ))}
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  {visibleFields.map((f) => (
                    <td key={f.key} style={{ padding: "8px 12px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Cell field={f} value={r[f.key]} />
                    </td>
                  ))}
                  <td style={{ padding: "8px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn" style={{ padding: "4px 8px", marginRight: 6 }} onClick={() => { setEditing(r); setShowForm(true); }}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: "4px 8px" }} onClick={() => remove(r.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={99} style={{ padding: 24, textAlign: "center", color: "var(--text-dim)" }}>No records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center" style={{ gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
          <button className="btn" style={{ padding: "4px 8px" }} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Prev</button>
          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{safePage + 1} / {totalPages}</span>
          <button className="btn" style={{ padding: "4px 8px" }} disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>Next</button>
        </div>
      )}

      {showForm && (
        <FormModal
          meta={meta}
          editing={editing}
          saving={saving}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

function FormModal({ meta, editing, saving, onClose, onSave }: {
  meta: CollectionMeta;
  editing: any | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: any, id?: string) => void;
}) {
  const [form, setForm] = useState<any>(() => {
    const f: any = {};
    meta.fields.forEach((fl) => (f[fl.key] = editing ? (fl.type === "date" ? toDateInput(editing[fl.key]) : (editing[fl.key] ?? "")) : ""));
    return f;
  });

  function set(key: string, val: string) {
    setForm((p: any) => ({ ...p, [key]: val }));
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: 520, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ margin: 0, fontSize: 16 }}>{editing ? "Edit" : "Add"} {meta.label}</h2>
          <button className="btn" style={{ padding: "4px 8px" }} onClick={onClose}>Close</button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {meta.fields.map((f) => (
            <label key={f.key} style={{ display: "block" }}>
              <span style={{ fontSize: 12, color: f.required ? "var(--accent)" : "var(--text-dim)", display: "block", marginBottom: 4 }}>
                {f.label}{f.required ? " *" : ""}
              </span>
              {f.type === "select" ? (
                <select className="select" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  <option value="">—</option>
                  {f.options!.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea className="textarea" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              ) : (
                <input
                  className="input"
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => onSave(form, editing?.id)}>
            {saving ? "Saving…" : editing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
