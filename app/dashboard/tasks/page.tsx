"use client";

import { useEffect, useState } from "react";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { FadeIn } from "@/components/ui/Anim";

const COLS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

// Full Gantt — bar from (start ~ today-ish) to dueDate across season window
function MiniGantt({ tasks }: { tasks: any[] }) {
  const start = new Date("2026-08-01").getTime();
  const end = new Date("2027-03-31").getTime();
  const span = end - start;
  const colorByStatus: Record<string, string> = {
    "todo": "var(--text-dim)",
    "in-progress": "var(--accent-yellow)",
    "review": "var(--accent-green)",
    "done": "var(--accent-green)",
  };
  // derive a pseudo-start 3 weeks before due (or use real start if present)
  const taskStart = (t: any) => {
    const due = t.dueDate ? new Date(t.dueDate).getTime() : end;
    const s = t.startDate ? new Date(t.startDate).getTime() : due - 21 * 86400000;
    return Math.min(s, due);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ position: "relative", height: 18, marginLeft: 180, fontSize: 10 }} className="text-dim">
        {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m, i) => (
          <span key={i} style={{ position: "absolute", left: `${(i / 7) * 100}%` }}>{m}</span>
        ))}
      </div>
      {tasks.map((t) => {
        const due = t.dueDate ? new Date(t.dueDate).getTime() : end;
        const s = taskStart(t);
        const left = Math.min(100, Math.max(0, ((s - start) / span) * 100));
        const width = Math.max(4, Math.min(100 - left, ((due - s) / span) * 100));
        return (
          <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 172, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
            <div style={{ flex: 1, position: "relative", height: 18, background: "var(--bg-card)", borderRadius: 4 }}>
              <div
                style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 3, height: 12, background: colorByStatus[t.status], borderRadius: 4, opacity: 0.85 }}
                title={`${t.title} — due ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "?"}`}
              />
              <div style={{ position: "absolute", left: `${((due - start) / span) * 100}%`, top: 0, bottom: 0, width: 2, background: "var(--text-dim)", opacity: 0.5 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || []));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <FadeIn>
        <NeoCard className="neo" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, marginBottom: 16 }} className="text-dim">TIMELINE (by due date)</div>
          <MiniGantt tasks={tasks} />
        </NeoCard>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {COLS.map((c) => (
          <FadeIn key={c.key}>
            <NeoCard className="neo" style={{ padding: 16, minHeight: 280 }}>
              <div style={{ fontSize: 14, marginBottom: 12, fontWeight: 600 }}>{c.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tasks.filter((t) => t.status === c.key).map((t) => (
                  <div key={t._id} className="neo-inset" style={{ padding: 12, fontSize: 14 }}>
                    <div>{t.title}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                      <NeoBadge tone={t.priority === "critical" ? "red" : t.priority === "high" ? "yellow" : "dim"}>{t.priority}</NeoBadge>
                      {t.tags?.map((tag: string) => (
                        <NeoBadge key={tag} tone="dim">{tag}</NeoBadge>
                      ))}
                    </div>
                  </div>
                ))}
                {tasks.filter((t) => t.status === c.key).length === 0 && (
                  <div className="text-dim" style={{ fontSize: 12 }}>empty</div>
                )}
              </div>
            </NeoCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
