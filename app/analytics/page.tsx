import Shell from "@/components/Shell";
import { AnalyticsLoader } from "@/components/Analytics";

export default function AnalyticsPage() {
  return (
    <Shell>
      <div className="mb-4">
        <h1 style={{ fontSize: 22, margin: 0 }}>Analytics</h1>
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Aggregated views across all sections</span>
      </div>
      <AnalyticsLoader />
    </Shell>
  );
}
