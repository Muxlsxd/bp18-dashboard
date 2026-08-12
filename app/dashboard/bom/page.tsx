"use client";

import { useEffect, useState } from "react";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";
import { FadeIn } from "@/components/ui/Anim";
import { WeightBudget, QcBoard } from "@/components/AnalyticsWidgets";
import { IconAlert } from "@/components/ui/Icon";

export default function BomPage() {
  const [bom, setBom] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    fetch("/api/bom").then((r) => r.json()).then((d) => setBom(d.bom || []));
    fetch("/api/projects/current").then((r) => r.json()).then((d) => setProject(d.project));
  }, []);

  const top = [...bom].sort((a, b) => (b.unitWeight || 0) - (a.unitWeight || 0)).slice(0, 8);
  const failed = bom.filter((b) => b.vendorStatus === "qc_failed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <FadeIn>
          <NeoCard className="neo" style={{ padding: 18 }}>
            <div style={{ fontSize: 14, marginBottom: 14 }} className="text-dim">WEIGHT BUDGET vs ACTUAL (per subsystem)</div>
            <WeightBudget data={project?.subsystemWeights || []} />
          </NeoCard>
        </FadeIn>
        <FadeIn delay={0.05}>
          <NeoCard className="neo" style={{ padding: 18 }}>
            <div style={{ fontSize: 14, marginBottom: 14 }} className="text-dim">TOP HEAVIEST PARTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {top.map((b) => (
                <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 14 }}>{b.partName} <span className="text-dim">({b.material})</span></span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }} className="text-dim">{(b.unitWeight || 0)}g</span>
                    <NeoBadge tone={b.manufacturingStatus === "done" ? "green" : b.manufacturingStatus === "cutting" ? "yellow" : "dim"}>{b.manufacturingStatus || "waiting"}</NeoBadge>
                  </div>
                </div>
              ))}
              {!top.length && <div className="text-dim" style={{ fontSize: 13 }}>No BOM yet</div>}
            </div>
          </NeoCard>
        </FadeIn>
      </div>

      {failed.length > 0 && (
        <FadeIn delay={0.1}>
          <NeoCard className="neo-inset" style={{ padding: 16, border: "1px solid var(--accent-red)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <IconAlert style={{ color: "var(--accent-red)" }} />
              <span className="accent-red" style={{ fontWeight: 700 }}>QC FAILED — REWORK REQUIRED</span>
            </div>
            {failed.map((b) => (
              <div key={b._id} style={{ fontSize: 14, padding: "4px 0" }}>{b.partName} <span className="text-dim">({b.partNumber})</span></div>
            ))}
          </NeoCard>
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <NeoCard className="neo" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, marginBottom: 14 }} className="text-dim">MANUFACTURING / QC BOARD</div>
          <QcBoard bom={bom} />
        </NeoCard>
      </FadeIn>

      <FadeIn delay={0.2}>
        <NeoCard className="neo" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, marginBottom: 12 }} className="text-dim">FULL BOM ({bom.length} parts)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr className="text-dim" style={{ textAlign: "left" }}>
                  <th style={{ padding: "6px 8px" }}>Part</th>
                  <th style={{ padding: "6px 8px" }}>No.</th>
                  <th style={{ padding: "6px 8px" }}>Material</th>
                  <th style={{ padding: "6px 8px" }}>Qty</th>
                  <th style={{ padding: "6px 8px" }}>Weight</th>
                  <th style={{ padding: "6px 8px" }}>Cost</th>
                  <th style={{ padding: "6px 8px" }}>Vendor</th>
                  <th style={{ padding: "6px 8px" }}>Mfg</th>
                </tr>
              </thead>
              <tbody>
                {bom.map((b) => (
                  <tr key={b._id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "6px 8px" }}>{b.partName}</td>
                    <td style={{ padding: "6px 8px" }} className="text-dim">{b.partNumber}</td>
                    <td style={{ padding: "6px 8px" }}>{b.material}</td>
                    <td style={{ padding: "6px 8px" }}>{b.quantity}</td>
                    <td style={{ padding: "6px 8px" }}>{(b.unitWeight || 0)}g</td>
                    <td style={{ padding: "6px 8px" }}>{(b.totalCost || 0).toLocaleString()}</td>
                    <td style={{ padding: "6px 8px" }}><NeoBadge tone={b.vendorStatus === "qc_failed" ? "red" : b.vendorStatus === "received" ? "green" : "yellow"}>{b.vendorStatus}</NeoBadge></td>
                    <td style={{ padding: "6px 8px" }}><NeoBadge tone={b.manufacturingStatus === "done" ? "green" : "dim"}>{b.manufacturingStatus}</NeoBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeoCard>
      </FadeIn>
    </div>
  );
}
