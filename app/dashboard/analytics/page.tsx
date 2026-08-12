"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";

const ACCENT = "#00e676";

export default function AnalyticsPage() {
  const [weightHist, setWeightHist] = useState<{ timestamp: string; weight: number }[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [bom, setBom] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetch("/api/projects/current")
      .then((r) => r.json())
      .then((d) => {
        setProjectName(d.project?.name ?? "");
        setWeightHist((d.project?.weightHistory || []).map((w: any) => ({ timestamp: new Date(w.timestamp).toLocaleDateString(), weight: w.weight })));
      });
    fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || []));
    fetch("/api/bom").then((r) => r.json()).then((d) => setBom(d.bom || []));
  }, []);

  // Task status breakdown for burndown-style bar
  const statusCounts = [
    { name: "Todo", value: tasks.filter((t) => t.status === "todo").length, color: "#6b7a90" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length, color: "#ffea00" },
    { name: "Done", value: tasks.filter((t) => t.status === "done").length, color: "#00e676" },
  ];

  // BOM weight by material
  const byMaterial = bom.reduce((acc: Record<string, number>, b: any) => {
    const m = b.material || "unknown";
    acc[m] = (acc[m] || 0) + (b.unitWeight || 0);
    return acc;
  }, {});
  const bomData = Object.entries(byMaterial).map(([name, weight]) => ({ name, weight }));

  const axes = { stroke: "#6b7a90", fontSize: 12 };
  const tooltipStyle = {
    background: "#22262e",
    border: "1px solid #2d3a4d",
    borderRadius: 8,
    color: "#e0e5ec",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Analytics <span className="text-dim" style={{ fontSize: 14, fontWeight: 400 }}>· {projectName}</span></div>

      <NeoCard className="neo" style={{ padding: 22 }}>
        <div style={{ fontSize: 14, marginBottom: 16 }} className="text-dim">WEIGHT TREND (kg)</div>
        {weightHist.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightHist} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4d" />
              <XAxis dataKey="timestamp" {...axes} />
              <YAxis {...axes} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="weight" stroke={ACCENT} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </NeoCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <NeoCard className="neo" style={{ padding: 22 }}>
          <div style={{ fontSize: 14, marginBottom: 16 }} className="text-dim">TASK STATUS</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusCounts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4d" />
              <XAxis dataKey="name" {...axes} />
              <YAxis {...axes} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#2a2e38" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusCounts.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </NeoCard>

        <NeoCard className="neo" style={{ padding: 22 }}>
          <div style={{ fontSize: 14, marginBottom: 16 }} className="text-dim">BOM WEIGHT BY MATERIAL</div>
          {bomData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={bomData} dataKey="weight" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {bomData.map((_, i) => (
                    <Cell key={i} fill={["#00e676", "#ffea00", "#00b0ff", "#ff1744", "#9c27b0"][i % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#6b7a90" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </NeoCard>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="text-dim" style={{ fontSize: 14, padding: "40px 0", textAlign: "center" }}>No data yet — add entries to see charts</div>;
}
