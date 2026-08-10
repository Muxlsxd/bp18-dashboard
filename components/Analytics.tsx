"use client";

import { useState, useEffect } from "react";
import { GenericTable } from "@/components/GenericTable";
import { Card, StatusPie, GroupedBar, SimpleBar, COLORS } from "@/components/Charts";
import { COLLECTIONS, getCollectionMeta } from "@/lib/collections";

function useAll(slugs: string[]) {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const out: Record<string, any[]> = {};
      await Promise.all(
        slugs.map(async (s) => {
          try {
            const r = await fetch(`/api/${s}`);
            const j = await r.json();
            out[s] = j.rows || [];
          } catch { out[s] = []; }
        })
      );
      setData(out);
      setLoading(false);
    })();
  }, [slugs.join(",")]);
  return { data, loading };
}

function countBy(rows: any[], key: string): Record<string, number> {
  const m: Record<string, number> = {};
  rows.forEach((r) => {
    const k = String(r[key] || "—");
    m[k] = (m[k] || 0) + 1;
  });
  return m;
}

function toPie(rows: any[], key: string) {
  const m = countBy(rows, key);
  return Object.entries(m).map(([name, value]) => ({ name, value }));
}

export function AnalyticsView() {
  const SLUGS = ["tasks", "cost", "weight", "risk", "checklist", "cad", "tradeoff", "torsion"];
  const { data, loading } = useAll(SLUGS);

  if (loading) return <div className="card" style={{ color: "var(--text-dim)" }}><span className="pulse">Loading analytics…</span></div>;

  const tasks = data.tasks || [];
  const cost = data.cost || [];
  const weight = data.weight || [];
  const risk = data.risk || [];
  const checklist = data.checklist || [];

  const taskStatus = toPie(tasks, "status");
  const costByPart = cost
    .map((c) => ({
      name: (c.partName || "—").slice(0, 14),
      total: (Number(c.material) || 0) + (Number(c.process) || 0) + (Number(c.fastener) || 0) + (Number(c.tooling) || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const weightBars = weight.slice(0, 10).map((w) => ({
    name: (w.component || "—").slice(0, 12),
    Target: Number(w.target) || 0,
    Actual: Number(w.actual) || 0,
    Est: Number(w.est) || 0,
  }));
  const riskScore = risk.map((r) => ({
    name: (r.risk_desc || "—").slice(0, 14),
    score: (Number(r.probability) || 1) * (Number(r.impact) || 1),
  })).sort((a, b) => b.score - a.score).slice(0, 10);
  const checklistPhase = (() => {
    const phases = new Set(checklist.map((c) => String(c.phase || "—")));
    return Array.from(phases).map((p) => {
      const rows = checklist.filter((c) => String(c.phase || "—") === p);
      const done = rows.filter((c) => String(c.status) === "Done").length;
      return { name: p.slice(0, 12), done, total: rows.length };
    });
  })();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 14 }}>
      <Card title={`Tasks by Status (${tasks.length})`}>
        <StatusPie data={taskStatus} palette={[COLORS.ok, COLORS.accent2, COLORS.warn, COLORS.danger]} />
      </Card>
      <Card title="Cost by Part (top 10)">
        <SimpleBar data={costByPart} xKey="name" yKey="total" name="Total" color={COLORS.warn} />
      </Card>
      <Card title="Weight: Target vs Actual vs Est">
        <GroupedBar data={weightBars} xKey="name" bars={[
          { key: "Target", color: COLORS.accent2, name: "Target" },
          { key: "Est", color: COLORS.dim, name: "Est" },
          { key: "Actual", color: COLORS.accent, name: "Actual" },
        ]} />
      </Card>
      <Card title="Risk Score (prob × impact, top 10)">
        <SimpleBar data={riskScore} xKey="name" yKey="score" name="Score" color={COLORS.danger} />
      </Card>
      <Card title="Checklist Completion by Phase">
        <GroupedBar data={checklistPhase} xKey="name" bars={[
          { key: "done", color: COLORS.ok, name: "Done" },
          { key: "total", color: COLORS.dim, name: "Total" },
        ]} />
      </Card>
      <Card title={`CAD/DRW Status (${data.cad?.length || 0})`}>
        <StatusPie data={toPie(data.cad || [], "status")} palette={[COLORS.ok, COLORS.accent2, COLORS.warn, COLORS.danger, COLORS.dim]} />
      </Card>
    </div>
  );
}

export function AnalyticsLoader() {
  return <AnalyticsView />;
}
