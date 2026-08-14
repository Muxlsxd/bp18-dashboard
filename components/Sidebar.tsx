"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReactNode } from "react";
import {
  IconOverview,
  IconTasks,
  IconFiles,
  IconBom,
  IconChart,
  IconTv,
} from "@/components/ui/Icon";
import { useTheme } from "@/components/ThemeProvider";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: IconOverview },
  { href: "/dashboard/tasks", label: "Tasks", Icon: IconTasks },
  { href: "/dashboard/files", label: "Files", Icon: IconFiles },
  { href: "/dashboard/bom", label: "BOM", Icon: IconBom },
  { href: "/dashboard/analytics", label: "Analytics", Icon: IconChart },
  { href: "/tv", label: "TV Mode", Icon: IconTv },
];

const COMMANDS = [
  ...NAV.map((n) => ({ label: `Go to ${n.label}`, href: n.href, action: null as null | "theme" })),
  { label: "Toggle Theme", href: "", action: "theme" as const },
];

export function Sidebar() {
  const { theme, toggle } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <aside className="neo-inset" style={{ width: 220, padding: 20, display: "flex", flexDirection: "column", gap: 8, minHeight: "100vh" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
          BP18<span className="accent-green"> · </span>F&amp;B
        </div>
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="neo-btn"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
          >
            <span style={{ width: 20, display: "flex", justifyContent: "center" }}><n.Icon /></span>
            {n.label}
          </Link>
        ))}
        <button
          className="neo-btn"
          style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}
          onClick={toggle}
        >
          <span style={{ width: 20, display: "flex", justifyContent: "center" }}>{theme === "dark" ? "DK" : "LT"}</span>
          {theme === "dark" ? "Dark" : "Light"} Mode
        </button>
        <button
          className="neo-btn"
          style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
          onClick={() => setPaletteOpen(true)}
        >
          <span style={{ width: 20, display: "flex", justifyContent: "center" }}>CMD</span>
          Command (Ctrl+K)
        </button>
        <div style={{ marginTop: "auto", fontSize: 11 }} className="text-dim">
          FSAE BlackPearl · Frame &amp; Body
        </div>
      </aside>

      {paletteOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120, zIndex: 100 }}
          onClick={() => setPaletteOpen(false)}
        >
          <div className="neo" style={{ width: 440, padding: 12, background: "var(--bg-card)" }} onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command…"
              style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", color: "var(--text)", border: "none", borderRadius: 8, outline: "none", fontSize: 14 }}
            />
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 280, overflowY: "auto" }}>
              {filtered.map((c, i) => (
                <Link
                  key={i}
                  href={c.href}
                  onClick={() => {
                    setPaletteOpen(false);
                    if (c.action === "theme") toggle();
                  }}
                  className="neo-btn"
                  style={{ textDecoration: "none", padding: "8px 10px", fontSize: 14 }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
