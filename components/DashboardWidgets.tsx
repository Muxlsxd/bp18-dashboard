"use client";

import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { IconAlert } from "@/components/ui/Icon";
import { useMemo } from "react";

// Pure helper: compute milestone display nodes (no Date object created during render/memo)
function buildMilestoneNodes(items: { name: string; dueDate: string; status: string }[]) {
  const now = Date.now();
  return (items || []).map((m) => {
    const done = m.status === "completed";
    const delayed = m.status === "delayed";
    const due = new Date(m.dueDate).getTime();
    const past = due < now && !done;
    const tone = done ? "green" : delayed || past ? "red" : "yellow";
    const label = done ? "DONE" : delayed ? "DELAYED" : past ? "OVERDUE" : "PENDING";
    const dateStr = new Date(m.dueDate).toLocaleDateString();
    return { name: m.name, tone, label, dateStr };
  });
}

// Mini weight trend sparkline (embedded in KPI card)
export function WeightSparkline({ data, width = 180, height = 44 }: { data: { weight: number }[]; width?: number; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.weight), 1);
  const min = Math.min(...data.map((d) => d.weight), 0);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((d.weight - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block", marginTop: 8 }}>
      <defs>
        <linearGradient id="wsgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill="url(#wsgrad)" stroke="none" />
      <polyline points={pts} fill="none" stroke="var(--accent-green)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(0,230,118,0.6))" }} />
    </svg>
  );
}

// Activity feed (everything)
export function ActivityFeed({ items }: { items: any[] }) {
  const tone: Record<string, "green" | "yellow" | "red" | "dim"> = {
    upload: "green",
    approve: "green",
    meeting: "dim",
    reminder: "yellow",
    delete: "red",
    error: "red",
  };
  const icon: Record<string, string> = {
    upload: "UP", approve: "OK", meeting: "MT", reminder: "RM", delete: "DL", error: "ER",
  };
  if (!items.length) return <div className="text-dim" style={{ fontSize: 13 }}>No activity yet</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 340, overflowY: "auto" }}>
      {items.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
          <NeoBadge tone={tone[a.type] || "dim"}>{icon[a.type] || "··"}</NeoBadge>
          <div style={{ flex: 1 }}>
            <div>{a.message}</div>
            <div className="text-dim" style={{ fontSize: 11, marginTop: 2 }}>
              {new Date(a.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Milestones timeline (horizontal) — receives precomputed nodes
export function computeMilestoneNodes(items: { name: string; dueDate: string; status: string }[]) {
  const now = Date.now();
  return items.map((m) => {
    const done = m.status === "completed";
    const delayed = m.status === "delayed";
    const due = new Date(m.dueDate).getTime();
    const past = due < now && !done;
    const tone = done ? "green" : delayed || past ? "red" : "yellow";
    const label = done ? "DONE" : delayed ? "DELAYED" : past ? "OVERDUE" : "PENDING";
    const dateStr = new Date(m.dueDate).toLocaleDateString();
    return { name: m.name, tone, label, dateStr };
  });
}

export function MilestoneTimeline({ items }: { items: { name: string; dueDate: string; status: string }[] }) {
  const nodes = useMemo(() => buildMilestoneNodes(items), [items]);
  if (!nodes.length) return <div className="text-dim" style={{ fontSize: 13 }}>No milestones</div>;
  return (
    <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
      {nodes.map((n, i) => (
        <div key={i} style={{ flex: "0 0 auto", width: 130, position: "relative", paddingRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: `var(--accent-${n.tone})`, boxShadow: `0 0 6px var(--accent-${n.tone})` }} />
            <span style={{ fontSize: 11 }} className="text-dim">{n.dateStr}</span>
          </div>
          <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>{n.name}</div>
          <div style={{ fontSize: 10, marginTop: 2 }} className={`accent-${n.tone}`}>{n.label}</div>
          {i < nodes.length - 1 && (
            <div style={{ position: "absolute", top: 5, right: 0, width: 12, height: 2, background: "var(--shadow-light)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Members widget
export function MembersWidget({ members }: { members: any[] }) {
  if (!members.length) return <div className="text-dim" style={{ fontSize: 13 }}>No members</div>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {members.map((m) => (
        <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "var(--bg-card)",
              boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "var(--accent-green)", flexShrink: 0,
            }}
          >
            {m.name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{m.name}</div>
            <div className="text-dim" style={{ fontSize: 11 }}>{m.position || m.subsystem || m.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// System status bar
export function StatusBar({ health }: { health: any }) {
  const db = health?.checks?.mongo;
  const drive = health?.checks?.drive;
  return (
    <div style={{ display: "flex", gap: 20, fontSize: 12 }} className="text-dim">
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: db ? "var(--accent-green)" : "var(--accent-red)" }} />
        DB {db ? "Connected" : "Down"}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: drive ? "var(--accent-green)" : "var(--accent-yellow)" }} />
        Drive {drive ? "OK" : "Degraded"}
      </span>
      <span>Last sync: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "—"}</span>
    </div>
  );
}

// Overdue / critical tasks list
export function OverdueTasks({ tasks }: { tasks: any[] }) {
  const flagged = tasks.filter((t) => t.priority === "critical" && t.status !== "done");
  if (!flagged.length) return <div className="text-dim" style={{ fontSize: 13 }}>No critical tasks pending</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {flagged.map((t) => (
        <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
          <IconAlert style={{ color: "var(--accent-red)", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{t.title}</span>
          <span className="text-dim" style={{ fontSize: 11 }}>
            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "no due"}
          </span>
        </div>
      ))}
    </div>
  );
}
