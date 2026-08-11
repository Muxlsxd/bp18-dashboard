"use client";

import { useEffect, useState } from "react";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";

const COLS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || []));
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
      {COLS.map((c) => (
        <NeoCard key={c.key} className="neo" style={{ padding: 16, minHeight: 300 }}>
          <div style={{ fontSize: 14, marginBottom: 12, fontWeight: 600 }}>{c.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.filter((t) => t.status === c.key).map((t) => (
              <div key={t._id} className="neo-inset" style={{ padding: 12, fontSize: 14 }}>
                <div>{t.title}</div>
                <div style={{ marginTop: 6 }}>
                  <NeoBadge tone={t.priority === "critical" ? "red" : t.priority === "high" ? "yellow" : "dim"}>{t.priority}</NeoBadge>
                </div>
              </div>
            ))}
            {tasks.filter((t) => t.status === c.key).length === 0 && (
              <div className="text-dim" style={{ fontSize: 12 }}>empty</div>
            )}
          </div>
        </NeoCard>
      ))}
    </div>
  );
}
