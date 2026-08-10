import { connectDB } from "@/lib/db";
import { COLLECTIONS } from "@/lib/collections";
import Shell from "@/components/Shell";
import { MiniCharts } from "@/components/MiniCharts";

export const dynamic = "force-dynamic";

async function getCounts() {
  await connectDB();
  const db = (await connectDB()).connection.db!;
  const out: Record<string, number> = {};
  for (const c of COLLECTIONS) {
    out[c.slug] = await db.collection(c.collection).countDocuments();
  }
  return out;
}

export default async function Overview() {
  let counts: Record<string, number> = {};
  let error = "";
  try {
    counts = await getCounts();
  } catch (e: any) {
    error = e.message;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <Shell>
      <div className="mb-5">
        <h1 style={{ fontSize: 22, margin: 0 }}>BP18 Frame &amp; Body</h1>
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>
          BlackPearl FSAE — subsystem control surface
          {error && <span style={{ color: "var(--danger)" }}> · DB error: {error}</span>}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {COLLECTIONS.map((c) => (
          <a key={c.slug} href={`/${c.slug}`} className="card" style={{ display: "block" }}>
            <div style={{ color: "var(--text-dim)", fontSize: 12 }}>{c.label}</div>
            <div style={{ fontSize: 28, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{counts[c.slug] ?? "—"}</div>
          </a>
        ))}
      </div>

      <div className="card mt-4" style={{ marginTop: 16 }}>
        <span style={{ color: "var(--text-dim)", fontSize: 12 }}>Total records across all sections</span>
        <div style={{ fontSize: 24, color: "var(--text)" }}>{total}</div>
      </div>

      <MiniCharts />
    </Shell>
  );
}
