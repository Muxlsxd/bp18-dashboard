"use client";

import { useEffect, useState } from "react";
import { NeoCard, NeoBadge } from "@/components/ui/Neo";

export default function BomPage() {
  const [bom, setBom] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/bom").then((r) => r.json()).then((d) => setBom(d.bom || []));
  }, []);

  const top = [...bom].sort((a, b) => (b.unitWeight || 0) - (a.unitWeight || 0)).slice(0, 5);

  return (
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
  );
}
