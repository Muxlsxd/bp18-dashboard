// Seed script: reads gas_*.json dumps and writes into MongoDB collections.
// Field-name mapping (GAS snake_case -> our camelCase model keys) is per collection.
import { MongoClient } from "mongodb";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bp18";
const DUMP_DIR = join(process.cwd(), "..", "projects"); // D:\hermes-workspace\projects

// map: slug -> { file, collection, [gasKey -> modelKey] }
const MAP: Record<string, { file: string; collection: string; remap?: Record<string, string> }> = {
  tasks: { file: "gas_Tasks.json", collection: "tasks", remap: { task: "task", category: "category", owner: "owner", status: "status", priority: "priority", deadline: "deadline", completed: "completed", dependsOn: "dependsOn", notes: "notes" } },
  weight: { file: "gas_WeightBudget.json", collection: "weightbudget", remap: { component: "component", target_kg: "target", est_kg: "est", actual_kg: "actual", location: "location", cgZ: "cgZ", contingency: "contingency", notes: "notes" } },
  cost: { file: "gas_CostTracker.json", collection: "costtracker", remap: { partName: "partName", partNum: "partNum", makeBuy: "makeBuy", material: "material", process: "process", fastener: "fastener", tooling: "tooling", notes: "notes" } },
  risk: { file: "gas_RiskRegister.json", collection: "riskregister", remap: { risk_desc: "risk_desc", category: "category", probability: "probability", impact: "impact", mitigation: "mitigation", owner: "owner", status: "status", notes: "notes" } },
  tradeoff: { file: "gas_TradeoffLog.json", collection: "tradeofflog", remap: { decision: "decision", date: "date", criteria: "criteria", weightPct: "weightPct", optionA: "optionA", optionB: "optionB", optionC: "optionC", bestOption: "bestOption", reason: "reason", status: "status" } },
  design: { file: "gas_DesignLog.json", collection: "designlog", remap: { date: "date", type: "type", description: "description", bp16bData: "bp16bData", bp18Sim: "bp18Sim", bp18Test: "bp18Test", action: "action", owner: "owner", status: "status", justification: "justification" } },
  checklist: { file: "gas_Checklist.json", collection: "checklist", remap: { phase: "phase", task: "task", owner: "owner", status: "status", doneDate: "doneDate", notes: "notes" } },
  cad: { file: "gas_CADTracker.json", collection: "cadtracker", remap: { partNum: "partNum", partName: "partName", category: "category", cadLink: "cadLink", drwLink: "drwLink", status: "status", owner: "owner", deadline: "deadline", notes: "notes", photoUrl: "photoUrl" } },
  dashboard: { file: "gas_Dashboard.json", collection: "dashboard", remap: { metric: "metric", value: "value", target: "target", unit: "unit", notes: "notes" } },
  consumables: { file: "gas_Consumables.json", collection: "consumables", remap: { item: "item", category: "category", qty: "qty", opened: "opened", expiry: "expiry", status: "status", owner: "owner", notes: "notes" } },
  torsion: { file: "gas_Torsion.json", collection: "torsion", remap: { config: "config", measured: "measured", target: "target", method: "method", owner: "owner", notes: "notes" } },
  lessons: { file: "gas_Lessons.json", collection: "lessons", remap: { source: "source", category: "category", lesson: "lesson", type: "type", owner: "owner", date: "date", severity: "severity" } },
  jigdrift: { file: "gas_JigDrift.json", collection: "jigdrift", remap: { jig: "jig", dim: "dim", before: "before", after: "after", tol: "tol", owner: "owner", date: "date" } },
  torquemark: { file: "gas_TorqueMark.json", collection: "torquemark", remap: { joint: "joint", spec: "spec", recheck: "recheck", result: "result", loc: "loc", owner: "owner", date: "date" } },
  rawstore: { file: "gas_RawStore.json", collection: "rawstore", remap: { material: "material", category: "category", spec: "spec", supplier: "supplier", unit: "unit", unit_cost: "unit_cost", min_stock: "min_stock", current_stock: "current_stock", location: "location", notes: "notes" } },
};

function toNum(v: any): number {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function transform(slug: string, rows: any[]): any[] {
  const map = MAP[slug];
  return rows.map((r) => {
    const out: any = {};
    for (const [gasKey, modelKey] of Object.entries(map.remap!)) {
      let v = r[gasKey];
      out[modelKey] = v ?? "";
    }
    return out;
  });
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  console.log("Connected to", MONGODB_URI);

  for (const slug of Object.keys(MAP)) {
    const map = MAP[slug];
    const path = join(DUMP_DIR, map.file);
    let parsed: any;
    try {
      parsed = JSON.parse(readFileSync(path, "utf8"));
    } catch (e) {
      console.log(`[skip] ${slug}: cannot read ${map.file}`);
      continue;
    }
    const rows = parsed.rows || [];
    if (!rows.length) {
      console.log(`[empty] ${slug}: 0 rows`);
      continue;
    }
    const docs = transform(slug, rows);
    await db.collection(map.collection).deleteMany({});
    await db.collection(map.collection).insertMany(docs);
    console.log(`[ok] ${slug}: inserted ${docs.length} into ${map.collection}`);
  }
  await client.close();
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
