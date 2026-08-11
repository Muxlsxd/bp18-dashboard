import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24 }}>BP18 Frame &amp; Body Dashboard</h1>
      <p style={{ color: "var(--text-dim)" }}>
        Phase 0 foundation — MongoDB connected, 7 models registered. Backend core lands in Phase 1.
      </p>
      <p>
        <Link href="/api/health" style={{ color: "var(--accent-green)" }}>
          Check system health →
        </Link>
      </p>
    </main>
  );
}
