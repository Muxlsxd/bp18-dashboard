import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/files", label: "Files" },
  { href: "/dashboard/bom", label: "BOM" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/tv", label: "TV Mode" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, padding: 20, background: "#22262e", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>BP18 · F&amp;B</div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} style={{ color: "#e0e5ec", textDecoration: "none", padding: "8px 10px" }}>
            {n.label}
          </Link>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 28 }}>{children}</main>
    </div>
  );
}
