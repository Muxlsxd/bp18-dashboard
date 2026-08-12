"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAutoSlide } from "@/lib/hooks/useAutoSlide";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { IconAlert } from "@/components/ui/Icon";
import { FadeIn, CardSwap } from "@/components/ui/Anim";

export default function TvPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [bom, setBom] = useState<any[]>([]);
  const { current, setCurrent } = useAutoSlide(4, 15000);

  useEffect(() => {
    fetch("/api/projects/current").then((r) => r.json()).then(setKpi);
    fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || []));
    fetch("/api/files").then((r) => r.json()).then((d) => setFiles(d.files || []));
    fetch("/api/bom").then((r) => r.json()).then((d) => setBom(d.bom || []));
  }, []);

  const crit = tasks.filter((t) => t.priority === "critical" && t.status !== "done");

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "var(--bg)", padding: 40, display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
        BP18 FSAE <span className="accent-green">·</span> Frame &amp; Body TV
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <AnimatePresence mode="wait">
          <FadeIn key={current} delay={0}>
            {current === 0 && <SectionBigPicture kpi={kpi} project={kpi?.project} />}
            {current === 1 && <SectionFiles files={files} />}
            {current === 2 && <SectionTimelineBom bom={bom} />}
            {current === 3 && <SectionAlerts crit={crit} />}
          </FadeIn>
        </AnimatePresence>
      </div>

      <DotNav current={current} setCurrent={setCurrent} />
    </div>
  );
}

function SectionBigPicture({ kpi, project }: any) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, height: "100%" }}>
      <NeoCard className="neo" style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="text-dim" style={{ fontSize: 16 }}>PROGRESS</div>
        <div className="accent-green" style={{ fontSize: 120, fontWeight: 900, lineHeight: 1 }}>{kpi?.kpi?.progress ?? 0}%</div>
        <div className="text-dim" style={{ marginTop: 20, fontSize: 18 }}>
          {kpi?.kpi?.done ?? 0}/{kpi?.kpi?.totalTasks ?? 0} tasks done
        </div>
      </NeoCard>
      <NeoCard className="neo" style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
        <div>
          <div className="text-dim" style={{ fontSize: 16 }}>CURRENT WEIGHT</div>
          <div style={{ fontSize: 64, fontWeight: 800 }}>{(project?.currentWeight ?? 0)} kg</div>
          <div className="text-dim">/ {project?.targetWeight ?? 0} kg target</div>
        </div>
        <div>
          <div className="text-dim" style={{ fontSize: 16 }}>IN PROGRESS</div>
          <div style={{ fontSize: 64, fontWeight: 800 }} className="accent-yellow">{kpi?.kpi?.inProgress ?? 0}</div>
        </div>
      </NeoCard>
    </div>
  );
}

function SectionFiles({ files }: any) {
  const grid = files.slice(0, 8);
  return (
    <NeoCard className="neo" style={{ padding: 30, height: "100%", overflow: "auto" }}>
      <div className="text-dim" style={{ fontSize: 16, marginBottom: 16 }}>CAD / DRW FILES</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {grid.map((f: any) => (
          <div key={f._id} className="neo-inset" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{f.name}</div>
            <div style={{ marginTop: 10 }}>
              <NeoBadge tone={f.status === "approved" ? "green" : f.status === "review" ? "yellow" : "dim"}>{f.status}</NeoBadge>
            </div>
          </div>
        ))}
        {!grid.length && <div className="text-dim">No files yet</div>}
      </div>
    </NeoCard>
  );
}

function SectionTimelineBom({ bom }: any) {
  const top = [...bom].sort((a, b) => (b.unitWeight || 0) - (a.unitWeight || 0)).slice(0, 6);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, height: "100%" }}>
      <NeoCard className="neo" style={{ padding: 30, overflow: "auto" }}>
        <div className="text-dim" style={{ fontSize: 16, marginBottom: 14 }}>MILESTONES</div>
        {["Design Freeze", "Manufacturing", "Testing"].map((m, i) => (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div className="neo-inset" style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{i + 1}</div>
            <div style={{ fontSize: 18 }}>{m}</div>
          </div>
        ))}
      </NeoCard>
      <NeoCard className="neo" style={{ padding: 30, overflow: "auto" }}>
        <div className="text-dim" style={{ fontSize: 16, marginBottom: 14 }}>BOM STATUS</div>
        {top.map((b: any) => (
          <div key={b._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span>{b.partName}</span>
            <NeoBadge tone={b.manufacturingStatus === "done" ? "green" : b.manufacturingStatus === "cutting" ? "yellow" : "dim"}>{b.manufacturingStatus || "waiting"}</NeoBadge>
          </div>
        ))}
      </NeoCard>
    </div>
  );
}

function SectionAlerts({ crit }: any) {
  return (
    <NeoCard className="neo-inset" style={{ padding: 40, height: "100%", overflow: "auto" }}>
      <div className="accent-red" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <IconAlert /> CRITICAL ALERTS
      </div>
      {crit.map((t: any) => (
        <div key={t._id} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)", fontSize: 18 }}>
          <span className="accent-red">●</span> {t.title} <span className="text-dim">— {t.priority}</span>
        </div>
      ))}
    </NeoCard>
  );
}

function DotNav({ current, setCurrent }: { current: number; setCurrent: (n: number) => void }) {
  const labels = ["Big Picture", "Files", "Timeline", "Alerts"];
  return (
    <div style={{ position: "fixed", bottom: 24, right: 30, display: "flex", gap: 12 }}>
      {labels.map((l, i) => (
        <button key={i} onClick={() => setCurrent(i)} title={l}
          style={{
            width: 14, height: 14, borderRadius: "50%", border: "none", cursor: "pointer",
            background: i === current ? "var(--accent-green)" : "var(--shadow-light)",
            boxShadow: i === current ? "0 0 10px var(--accent-green)" : "none",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
