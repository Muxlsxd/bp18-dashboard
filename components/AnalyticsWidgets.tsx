"use client";

import { NeoCard, NeoBadge } from "@/components/ui/Neo";

// Weight budget vs actual per subsystem (bar compare)
export function WeightBudget({ data }: { data: { subsystem: string; budget: number; actual: number }[] }) {
  if (!data.length) return <div className="text-dim" style={{ fontSize: 13 }}>No subsystem data</div>;
  const max = Math.max(...data.map((d) => Math.max(d.budget, d.actual)), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => {
        const pctB = (d.budget / max) * 100;
        const pctA = (d.actual / max) * 100;
        const over = d.actual > d.budget;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>{d.subsystem}</span>
              <span className={over ? "accent-red" : "text-dim"}>{d.actual}/{d.budget}kg {over ? "(OVER)" : ""}</span>
            </div>
            <div style={{ position: "relative", height: 18 }}>
              <div className="neo-inset" style={{ position: "absolute", inset: 0, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pctB}%`, background: "var(--shadow-light)", opacity: 0.6 }} />
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pctA}%`, background: over ? "var(--accent-red)" : "var(--accent-green)", borderRadius: 6 }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// QC / Manufacturing board (from BOM manufacturingStatus)
export function QcBoard({ bom }: { bom: any[] }) {
  const cols = [
    { key: "waiting", label: "Waiting" },
    { key: "cutting", label: "Cutting" },
    { key: "welding", label: "Welding" },
    { key: "done", label: "Done" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {cols.map((c) => {
        const items = bom.filter((b) => b.manufacturingStatus === c.key);
        return (
          <div key={c.key} className="neo-inset" style={{ padding: 12, borderRadius: 10, minHeight: 120 }}>
            <div style={{ fontSize: 12, marginBottom: 10 }} className="text-dim">{c.label} · {items.length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((b) => (
                <div key={b._id} style={{ fontSize: 12, padding: "6px 8px", background: "var(--bg-card)", borderRadius: 6 }}>
                  {b.partName}
                  {b.vendorStatus === "qc_failed" && <span className="accent-red" style={{ marginLeft: 6, fontWeight: 700 }}>FAIL</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
