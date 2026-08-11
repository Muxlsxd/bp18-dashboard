import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "▣" },
  { href: "/dashboard/tasks", label: "Tasks", icon: "☑" },
  { href: "/dashboard/files", label: "Files", icon: "▤" },
  { href: "/dashboard/bom", label: "BOM", icon: "▥" },
  { href: "/tv", label: "TV Mode", icon: "▦" },
];

export function Sidebar() {
  return (
    <aside className="neo-inset" style={{ width: 220, padding: 20, display: "flex", flexDirection: "column", gap: 8, minHeight: "100vh" }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, letterSpacing: 1 }}>
        BP18<span className="accent-green"> · </span>F&amp;B
      </div>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className="neo-btn" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, textAlign: "center" }}>{n.icon}</span>
          {n.label}
        </Link>
      ))}
      <div style={{ marginTop: "auto", fontSize: 11 }} className="text-dim">
        FSAE BlackPearl · Frame &amp; Body
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>{children}</main>
    </div>
  );
}
