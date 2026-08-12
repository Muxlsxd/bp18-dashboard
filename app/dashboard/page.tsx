"use client";

import { useEffect, useState } from "react";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { IconAlert, IconInfo, IconCheck } from "@/components/ui/Icon";
import { FadeIn, TiltCard, CountUp, ShinyText } from "@/components/ui/Anim";

interface Kpi {
  totalTasks: number;
  done: number;
  inProgress: number;
  progress: number;
}
interface Project {
  name: string;
  targetWeight: number;
  currentWeight: number;
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects/current")
      .then((r) => r.json())
      .then((d) => {
        setProject(d.project);
        setKpi(d.kpi);
      });
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []));
  }, []);

  const pending = tasks.filter((t) => t.status !== "done").length;
  const crit = tasks.filter((t) => t.priority === "critical" && t.status !== "done").length;
  const daysLeft = 120; // demo placeholder

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <FadeIn>
        <ShinyText className="neo-acc" >
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>
            BP18 <span className="accent-green">·</span> F&amp;B CONTROL
          </div>
        </ShinyText>
      </FadeIn>

      <FadeIn delay={0.05}>
        <AutoSummary pending={pending} crit={crit} />
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
        <KpiCard label="Progress" value={kpi?.progress ?? 0} suffix="%" tone="green" />
        <KpiCard label="Tasks Pending" value={pending} tone="yellow" />
        <KpiCard label="Weight" value={`${project?.currentWeight ?? 0}/${project?.targetWeight ?? 0}`} suffix="kg" tone="green" />
        <KpiCard label="Days Left" value={daysLeft} tone="dim" />
      </div>

      <FadeIn delay={0.1}>
        <NeoCard className="neo" style={{ padding: 22 }}>
          <div style={{ fontSize: 14, marginBottom: 12 }} className="text-dim">OVERALL PROGRESS</div>
          <div className="neo-bar">
            <div className="neo-bar-fill" style={{ width: `${kpi?.progress ?? 0}%` }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 13 }} className="text-dim">
            {kpi?.done ?? 0}/{kpi?.totalTasks ?? 0} done · {kpi?.inProgress ?? 0} in progress
          </div>
        </NeoCard>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <FadeIn delay={0.15}>
          <NeoCard className="neo" style={{ padding: 22 }}>
            <div style={{ fontSize: 14, marginBottom: 12 }} className="text-dim">RECENT TASKS</div>
            <TaskList tasks={tasks.slice(0, 6)} />
          </NeoCard>
        </FadeIn>
        <FadeIn delay={0.2}>
          <NeoCard className="neo" style={{ padding: 22 }}>
            <div style={{ fontSize: 14, marginBottom: 12 }} className="text-dim">PROJECT</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{project?.name ?? "—"}</div>
            <div style={{ marginTop: 12, fontSize: 13 }} className="text-dim">
              Target weight: {project?.targetWeight ?? 0} kg
            </div>
          </NeoCard>
        </FadeIn>
      </div>
    </div>
  );
}

function AutoSummary({ pending, crit }: { pending: number; crit: number }) {
  const msg =
    crit > 0
      ? `${crit} critical task(s) pending — attention required`
      : pending > 0
      ? `${pending} task(s) in progress`
      : `All tasks on track`;
  const tone = crit > 0 ? "red" : pending > 0 ? "yellow" : "green";
  const Icon = crit > 0 ? IconAlert : pending > 0 ? IconInfo : IconCheck;
  return (
    <NeoCard className="neo-inset" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <NeoBadge tone={tone as any}>{tone === "red" ? "ALERT" : tone === "yellow" ? "INFO" : "OK"}</NeoBadge>
      <Icon style={{ color: `var(--accent-${tone})`, flexShrink: 0 }} />
      <span style={{ fontSize: 15 }}>{msg}</span>
    </NeoCard>
  );
}

function KpiCard({ label, value, suffix, tone }: { label: string; value: number | string; suffix?: string; tone: "green" | "yellow" | "dim" }) {
  const isNum = typeof value === "number";
  return (
    <TiltCard className="neo" >
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13 }} className="text-dim">{label}</div>
        <div style={{ fontSize: 40, fontWeight: 800, marginTop: 6 }} className={`accent-${tone}`}>
          {isNum ? <CountUp value={value} suffix={suffix || ""} /> : `${value}${suffix || ""}`}
        </div>
      </div>
    </TiltCard>
  );
}

function TaskList({ tasks }: { tasks: any[] }) {
  if (!tasks.length) return <div className="text-dim" style={{ fontSize: 13 }}>No tasks yet</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tasks.map((t) => (
        <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
          <span>{t.title}</span>
          <NeoBadge tone={t.status === "done" ? "green" : t.status === "in-progress" ? "yellow" : "dim"}>{t.status}</NeoBadge>
        </div>
      ))}
    </div>
  );
}
