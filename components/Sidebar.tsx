"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, string> = {
  "layout-dashboard": "M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z",
  "check-square": "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  scale: "M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0z",
  banknote: "M3 8h18v8H3zM3 12h18M7 12a2 2 0 1 0 0-.01",
  "alert-triangle": "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  "git-compare": "M6 3v12a2 2 0 0 0 2 2h8M18 21V9a2 2 0 0 0-2-2H8M9 6l-3-3-3 3M15 18l3 3 3-3",
  "file-text": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  "list-checks": "M3 6h11M3 12h11M3 18h11M17 6l2 2 4-4M17 12l2 2 4-4",
  "pen-tool": "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.586 7.586M11 11l-4 4",
  package: "M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  "rotate-cw": "M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16",
  lightbulb: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z",
  ruler: "M3 9l12 12 6-6L9 3zM7 9l2 2M11 5l2 2M15 9l2 2",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z",
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
};

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const d = ICONS[name] || ICONS.box;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const NAV = [
  { slug: "dashboard", label: "Overview", icon: "layout-dashboard" },
  { slug: "analytics", label: "Analytics", icon: "git-compare" },
  { slug: "tasks", label: "Tasks", icon: "check-square" },
  { slug: "weight", label: "Weight Budget", icon: "scale" },
  { slug: "cost", label: "Cost Tracker", icon: "banknote" },
  { slug: "risk", label: "Risk Register", icon: "alert-triangle" },
  { slug: "tradeoff", label: "Tradeoff Log", icon: "git-compare" },
  { slug: "design", label: "Design Log", icon: "file-text" },
  { slug: "checklist", label: "Checklist", icon: "list-checks" },
  { slug: "cad", label: "CAD/DRW", icon: "pen-tool" },
  { slug: "consumables", label: "Consumables", icon: "package" },
  { slug: "torsion", label: "Torsion", icon: "rotate-cw" },
  { slug: "lessons", label: "Lessons", icon: "lightbulb" },
  { slug: "jigdrift", label: "Jig Drift", icon: "ruler" },
  { slug: "torquemark", label: "Torque Mark", icon: "wrench" },
  { slug: "rawstore", label: "Raw Materials", icon: "box" },
];

const STORAGE_KEY = "bp18-sidebar-collapsed";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1"
  );
  const pathname = usePathname();

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col border-r"
      style={{
        width: collapsed ? 56 : 232,
        background: "var(--bg-elev)",
        borderColor: "var(--border)",
        transition: "width 0.15s ease",
      }}
    >
      <div className="flex items-center gap-2 px-3 h-12 border-b" style={{ borderColor: "var(--border)" }}>
        <button className="btn" style={{ padding: "4px 8px" }} onClick={toggle} title="Toggle">
          <Icon name="list-checks" />
        </button>
        {!collapsed && (
          <span style={{ fontSize: 12, letterSpacing: 1, color: "var(--accent)" }}>BP18 // FB</span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((n) => {
          const active = pathname === `/${n.slug}`;
          return (
            <Link
              key={n.slug}
              href={`/${n.slug}`}
              className="flex items-center gap-3 px-3 py-2 text-[13px]"
              style={{
                color: active ? "var(--accent)" : "var(--text-dim)",
                background: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <Icon name={n.icon} />
              {!collapsed && <span>{n.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
