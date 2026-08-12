"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAutoSlide } from "@/lib/hooks/useAutoSlide";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { IconAlert } from "@/components/ui/Icon";
import { FadeIn } from "@/components/ui/Anim";
import { MilestoneTimeline, MembersWidget, ActivityFeed, OverdueTasks, computeMilestoneNodes } from "@/components/DashboardWidgets";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";

export default function TvPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [bom, setBom] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const { current, setCurrent } = useAutoSlide(6, 15000);

  useEffect(() => {
    fetch("/api/projects/current").then((r) => r.json()).then((d) => { setProject(d.project); setKpi(d.kpi); });
    fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || []));
    fetch("/api/files").then((r) => r.json()).then((d) => setFiles(d.files || []));
    fetch("/api/bom").then((r) => r.json()).then((d) => setBom(d.bom || []));
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity(d.activities || d.logs || []));
    fetch("/api/members").then((r) => r.json()).then((d) => setMembers(d.members || []));
    fetch("/api/milestones").then((r) => r.json()).then((d) => setMilestones(d.milestones || []));
  }, []);

  const crit = tasks.filter((t: any) => t.priority === "critical" && t.status !== "done");
  const weightHist = (project?.weightHistory || []).map((w: any) => ({ timestamp: new Date(w.timestamp).toLocaleDateString(), weight: w.weight }));
  const byMaterial = bom.reduce((acc: Record<string, number>, b: any) => {
    const m = b.material || "unknown";
    acc[m] = (acc[m] || 0) + (b.unitWeight || 0);
    return acc;
  }, {});
  const bomData = Object.entries(byMaterial).map(([name, weight]) => ({ name, weight }));
  const axes = { stroke: "#6b7a90", fontSize: 12 };
  const tooltipStyle = { background: "#22262e", border: "1px solid #2d3a4d", borderRadius: 8, color: "#e0e5ec" };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "var(--bg)", padding: 40, display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
        BP18 FSAE <span className="accent-green">·</span> Frame &amp; Body TV
        <span style={{ float: "right", fontSize: 16, fontWeight: 400 }} className="text-dim">{project?.name}</span>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <AnimatePresence mode="wait">
          <FadeIn key={current} delay={0}>
            {current === 0 && <SectionBigPicture kpi={kpi} project={project} tasks={tasks} />}
            {current === 1 && <SectionWeight weightHist={weightHist} project={project} axes={axes} tooltipStyle={tooltipStyle} />}
            {current === 2 && <SectionBom bomData={bomData} axes={axes} tooltipStyle={tooltipStyle} />}
            {current === 3 && <SectionMilestonesMembers milestones={milestones} members={members} />}
            {current === 4 && <SectionActivity activity={activity} />}
            {current === 5 && <SectionAlerts crit={crit} tasks={tasks} />}
          </FadeIn>
        </AnimatePresence>
      </div>

      <DotNav current={current} setCurrent={setCurrent} count={6} />
    </div>
  );
}

function SectionBigPicture({ kpi, project, tasks }: any) {
  const pending = tasks.filter((t: any) => t.status !== "done").length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, height: "100%" }}>
      {[
        { label: "PROGRESS", value: `${kpi?.progress ?? 0}%`, tone: "var(--accent-green)" },
        { label: "TASKS PENDING", value: String(pending), tone: "var(--accent-yellow)" },
        { label: "WEIGHT", value: `${project?.currentWeight ?? 0}/${project?.targetWeight ?? 0}kg`, tone: "var(--accent-green)" },
        { label: "DAYS LEFT", value: "120", tone: "var(--text)" },
      ].map((c) => (
        <NeoCard key={c.label} className="neo" style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 16 }} className="text-dim">{c.label}</div>
          <div style={{ fontSize: 56, fontWeight: 800, marginTop: 12, color: c.tone }}>{c.value}</div>
        </NeoCard>
      ))}
    </div>
  );
}

function SectionWeight({ weightHist, project, axes, tooltipStyle }: any) {
  return (
    <NeoCard className="neo" style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 18, marginBottom: 12 }}>WEIGHT TREND <span className="text-dim" style={{ fontSize: 14 }}>(target {project?.targetWeight}kg)</span></div>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightHist} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4d" />
            <XAxis dataKey="timestamp" {...axes} />
            <YAxis {...axes} domain={[0, (project?.targetWeight || 55) * 1.2]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="weight" stroke="var(--accent-green)" strokeWidth={4} dot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </NeoCard>
  );
}

function SectionBom({ bomData, axes, tooltipStyle }: any) {
  const COLORS = ["#00e676", "#ffea00", "#00b0ff", "#ff1744", "#9c27b0"];
  return (
    <NeoCard className="neo" style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 18, marginBottom: 12 }}>BOM WEIGHT BY MATERIAL</div>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={bomData} dataKey="weight" nameKey="name" cx="50%" cy="50%" outerRadius="75%" label>
              {bomData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 14 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </NeoCard>
  );
}

function SectionMilestonesMembers({ milestones, members }: any) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, height: "100%" }}>
      <NeoCard className="neo" style={{ padding: 24, overflow: "auto" }}>
        <div style={{ fontSize: 16, marginBottom: 16 }} className="text-dim">MILESTONES — KICKOFF → COMPETITION</div>
        <MilestoneTimeline items={milestones} />
      </NeoCard>
      <NeoCard className="neo" style={{ padding: 24, overflow: "auto" }}>
        <div style={{ fontSize: 16, marginBottom: 16 }} className="text-dim">TEAM · {members.length}</div>
        <MembersWidget members={members} />
      </NeoCard>
    </div>
  );
}

function SectionActivity({ activity }: any) {
  return (
    <NeoCard className="neo" style={{ padding: 24, height: "100%", overflow: "auto" }}>
      <div style={{ fontSize: 18, marginBottom: 16 }}>ACTIVITY FEED</div>
      <ActivityFeed items={activity} />
    </NeoCard>
  );
}

function SectionAlerts({ crit, tasks }: any) {
  return (
    <NeoCard className="neo-inset" style={{ padding: 40, height: "100%", overflow: "auto" }}>
      <div className="accent-red" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <IconAlert /> CRITICAL ALERTS
      </div>
      <OverdueTasks tasks={tasks} />
    </NeoCard>
  );
}

function DotNav({ current, setCurrent, count }: { current: number; setCurrent: (n: number) => void; count: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => setCurrent(i)}
          style={{
            width: 14, height: 14, borderRadius: "50%",
            background: i === current ? "var(--accent-green)" : "var(--shadow-light)",
            border: "none", cursor: "pointer",
            boxShadow: i === current ? "0 0 8px var(--accent-green)" : "none",
          }}
        />
      ))}
    </div>
  );
}
