"use client";

import { useState, useEffect } from "react";
import { Card, StatusPie, SimpleBar, COLORS } from "@/components/Charts";

export function MiniCharts() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [cost, setCost] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, c] = await Promise.all([
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/cost").then((r) => r.json()),
      ]);
      setTasks(t.rows || []);
      setCost(c.rows || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="card" style={{ color: "var(--text-dim)" }}><span className="pulse">Loading…</span></div>;

  const statusMap: Record<string, number> = {};
  tasks.forEach((r) => { const k = String(r.status || "—"); statusMap[k] = (statusMap[k] || 0) + 1; });
  const taskPie = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  const costByPart = cost
    .map((c: any) => ({
      name: (c.partName || "—").slice(0, 14),
      total: (Number(c.material) || 0) + (Number(c.process) || 0) + (Number(c.fastener) || 0) + (Number(c.tooling) || 0),
    }))
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 8);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 14, marginTop: 16 }}>
      <Card title={`Tasks by Status (${tasks.length})`}>
        <StatusPie data={taskPie} palette={[COLORS.ok, COLORS.accent2, COLORS.warn, COLORS.danger]} />
      </Card>
      <Card title="Cost by Part (top 8)">
        <SimpleBar data={costByPart} xKey="name" yKey="total" name="Total" color={COLORS.warn} />
      </Card>
    </div>
  );
}
