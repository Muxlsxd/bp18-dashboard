import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { IconAlert, IconInfo, IconCheck } from "@/components/ui/Icon";
import {
  WeightSparkline,
  ActivityFeed,
  MilestoneTimeline,
  MembersWidget,
  StatusBar,
  OverdueTasks,
} from "@/components/DashboardWidgets";

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const [projects, tasks, activity, members, milestones, health] = await Promise.all([
    fetch(`${base}/api/projects/current`).then((r) => r.json()),
    fetch(`${base}/api/tasks`).then((r) => r.json()),
    fetch(`${base}/api/activity`).then((r) => r.json()),
    fetch(`${base}/api/members`).then((r) => r.json()),
    fetch(`${base}/api/milestones`).then((r) => r.json()),
    fetch(`${base}/api/health`).then((r) => r.json()),
  ]);
  return {
    project: projects.project || null,
    kpi: projects.kpi || null,
    tasks: tasks.tasks || [],
    activity: activity.activities || activity.logs || [],
    members: members.members || [],
    milestones: milestones.milestones || [],
    health,
  };
}

export default async function DashboardPage() {
  const { project, kpi, tasks, activity, members, milestones, health } = await getData();

  const pending = tasks.filter((t: any) => t.status !== "done").length;
  const crit = tasks.filter((t: any) => t.priority === "critical" && t.status !== "done").length;
  const daysLeft = 120;
  const weightHist = (project?.weightHistory || []).map((w: any) => ({ weight: w.weight }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>
          BP18 <span className="accent-green">·</span> F&amp;B CONTROL
        </div>
        <StatusBar health={health} />
      </div>

      <AutoSummary pending={pending} crit={crit} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <KpiCard label="Progress" value={`${kpi?.progress ?? 0}`} suffix="%" tone="green" />
        <KpiCard label="Tasks Pending" value={`${pending}`} tone="yellow" />
        <KpiCard label="Weight" value={`${project?.currentWeight ?? 0}/${project?.targetWeight ?? 0}`} suffix="kg" tone="green" spark={weightHist} />
        <KpiCard label="Days Left" value={`${daysLeft}`} tone="dim" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <NeoCard className="neo" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, marginBottom: 10 }} className="text-dim">OVERALL PROGRESS</div>
          <div className="neo-bar"><div className="neo-bar-fill" style={{ width: `${kpi?.progress ?? 0}%` }} /></div>
          <div style={{ marginTop: 8, fontSize: 12 }} className="text-dim">
            {kpi?.done ?? 0}/{kpi?.totalTasks ?? 0} done · {kpi?.inProgress ?? 0} in progress
          </div>
        </NeoCard>
        <NeoCard className="neo" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, marginBottom: 10 }} className="text-dim">CRITICAL ATTENTION</div>
          <OverdueTasks tasks={tasks} />
        </NeoCard>
      </div>

      <NeoCard className="neo" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, marginBottom: 14 }} className="text-dim">MILESTONES — KICKOFF → COMPETITION</div>
        <MilestoneTimeline items={milestones} />
      </NeoCard>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <NeoCard className="neo" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }} className="text-dim">ACTIVITY FEED</div>
          <ActivityFeed items={activity} />
        </NeoCard>
        <NeoCard className="neo" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, marginBottom: 14 }} className="text-dim">TEAM · {members.length} MEMBERS</div>
          <MembersWidget members={members} />
        </NeoCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <NeoCard className="neo" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, marginBottom: 10 }} className="text-dim">PROJECT</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{project?.name ?? "—"}</div>
          <div style={{ marginTop: 10, fontSize: 12 }} className="text-dim">Target weight: {project?.targetWeight ?? 0} kg · Current: {project?.currentWeight ?? 0} kg</div>
        </NeoCard>
        <NeoCard className="neo" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, marginBottom: 12 }} className="text-dim">RECENT TASKS</div>
          <TaskList tasks={tasks.slice(0, 6)} />
        </NeoCard>
      </div>
    </div>
  );
}

function AutoSummary({ pending, crit }: { pending: number; crit: number }) {
  const msg = crit > 0 ? `${crit} critical task(s) pending — attention required` : pending > 0 ? `${pending} task(s) in progress` : `All tasks on track`;
  const tone = crit > 0 ? "red" : pending > 0 ? "yellow" : "green";
  const Icon = crit > 0 ? IconAlert : pending > 0 ? IconInfo : IconCheck;
  return (
    <NeoCard className="neo-inset" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
      <NeoBadge tone={tone as any}>{tone === "red" ? "ALERT" : tone === "yellow" ? "INFO" : "OK"}</NeoBadge>
      <Icon style={{ color: `var(--accent-${tone})`, flexShrink: 0 }} />
      <span style={{ fontSize: 15 }}>{msg}</span>
    </NeoCard>
  );
}

function KpiCard({ label, value, suffix, tone, spark }: { label: string; value: string; suffix?: string; tone: "green" | "yellow" | "dim"; spark?: { weight: number }[] }) {
  return (
    <NeoCard className="neo" style={{ padding: 18 }}>
      <div style={{ fontSize: 13 }} className="text-dim">{label}</div>
      <div style={{ fontSize: 38, fontWeight: 800, marginTop: 4 }} className={`accent-${tone}`}>
        {value}{suffix || ""}
      </div>
      {spark && spark.length > 1 && <WeightSparkline data={spark} />}
    </NeoCard>
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
