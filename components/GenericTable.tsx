"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollectionMeta, FieldDef } from "@/lib/collections";

function badgeClass(value: string): string {
  const v = value.toLowerCase();
  if (v.includes("done") || v.includes("complete") || v.includes("pass") || v.includes("approved") || v.includes("in stock"))
    return "badge badge-done";
  if (v.includes("progress") || v.includes("review") || v.includes("pending") || v.includes("mitigated") || v.includes("low"))
    return "badge badge-progress";
  if (v.includes("block") || v.includes("fail") || v.includes("out") || v.includes("reject") || v.includes("critical") || v.includes("open"))
    return "badge badge-blocked";
  if (v.includes("not started") || v.includes("not checked"))
    return "badge";
  return "badge";
}

function Cell({ field, value }: { field: FieldDef; value: any }) {
  if (field.type === "select") return <span className={badgeClass(String(value || ""))}>{value || "—"}</span>;
  if (field.type === "date" && value) {
    const d = String(value).slice(0, 10);
    return <span style={{ color: "var(--text)" }}>{d}</span>;
  }
  if (typeof value === "number") return <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>;
  return <span style={{ color: value ? "var(--text)" : "var(--text-dim)" }}>{value || "—"}</span>;
}

export function GenericTable({ meta }: { meta: CollectionMeta }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/${meta.slug}`);
    const data = await res.json();
    setRows(data.rows || []);
    setLoading(false);
  }, [meta.slug]);

  useEffect(() => { load(); }, [load]);

  async function save(form: any, id?: string) {
    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/${meta.slug}/${id}` : `/api/${meta.slug}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/${meta.slug}/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 style={{ fontSize: 18, margin: 0 }}>{meta.label}</h1>
          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{rows.length} records</span>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add New
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--text-dim)" }}>Loading…</div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>
                {meta.fields.filter((f) => f.type !== "textarea").map((f) => (
                  <th key={f.key} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500 }}>{f.label}</th>
                ))}
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  {meta.fields.filter((f) => f.type !== "textarea").map((f) => (
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
              {rows.length === 0 && (
                <tr><td colSpan={99} style={{ padding: 24, textAlign: "center", color: "var(--text-dim)" }}>No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <FormModal
          meta={meta}
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

function FormModal({ meta, editing, onClose, onSave }: {
  meta: CollectionMeta;
  editing: any | null;
  onClose: () => void;
  onSave: (form: any, id?: string) => void;
}) {
  const [form, setForm] = useState<any>(() => {
    const f: any = {};
    meta.fields.forEach((fl) => (f[fl.key] = editing?.[fl.key] ?? ""));
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
              <span style={{ fontSize: 12, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{f.label}{f.required ? " *" : ""}</span>
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
          <button className="btn btn-primary" onClick={() => onSave(form, editing?.id)}>{editing ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}
