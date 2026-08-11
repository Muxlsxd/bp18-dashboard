"use client";

import { useEffect, useState } from "react";
import { NeoCard, NeoBadge, NeoButton } from "@/components/ui/Neo";

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = () => fetch("/api/files").then((r) => r.json()).then((d) => setFiles(d.files || []));
  useEffect(() => { load(); }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    fd.append("name", f.name);
    fd.append("type", "CAD");
    fd.append("projectId", "000000000000000000000000");
    await fetch("/api/files", { method: "POST", body: fd });
    setUploading(false);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label className="neo-btn" style={{ cursor: "pointer" }}>
          {uploading ? "Uploading…" : "Upload File"}
          <input type="file" hidden onChange={onUpload} />
        </label>
        <span className="text-dim" style={{ fontSize: 13 }}>{files.length} file(s)</span>
      </div>
      <NeoCard className="neo" style={{ padding: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f) => (
            <div key={f._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 14 }}>{f.name} <span className="text-dim">v{f.version}</span></span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <NeoBadge tone={f.status === "approved" ? "green" : f.status === "review" ? "yellow" : "dim"}>{f.status}</NeoBadge>
                <a className="neo-btn" href={`/api/files/${f._id}`} style={{ fontSize: 12, textDecoration: "none" }}>Download</a>
              </div>
            </div>
          ))}
          {!files.length && <div className="text-dim" style={{ fontSize: 13 }}>No files yet</div>}
        </div>
      </NeoCard>
    </div>
  );
}
