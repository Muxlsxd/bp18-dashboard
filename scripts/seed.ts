import "dotenv/config";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Project } from "@/lib/models/Project";
import { Task } from "@/lib/models/Task";
import { BOM } from "@/lib/models/BOM";
import { File } from "@/lib/models/File";
import { ActivityLog } from "@/lib/models/ActivityLog";

// FSAE 2026 season milestones — from kickoff to competition
const MILESTONES = [
  { name: "Project Kickoff", dueDate: new Date("2026-09-01"), status: "completed" },
  { name: "Concept Design Review", dueDate: new Date("2026-09-10"), status: "completed" },
  { name: "Design Freeze", dueDate: new Date("2026-10-01"), status: "pending" },
  { name: "FEA Validation", dueDate: new Date("2026-10-20"), status: "pending" },
  { name: "Manufacturing Start", dueDate: new Date("2026-11-01"), status: "pending" },
  { name: "Frame Welding Complete", dueDate: new Date("2026-12-15"), status: "pending" },
  { name: "Assembly & Integration", dueDate: new Date("2027-01-15"), status: "pending" },
  { name: "Static Event (Tech Inspection)", dueDate: new Date("2027-03-10"), status: "pending" },
  { name: "Competition (Endurance)", dueDate: new Date("2027-03-14"), status: "pending" },
];

const SUBSYSTEM_WEIGHTS = [
  { subsystem: "Chassis", budget: 22, actual: 18.4 },
  { subsystem: "Impact Structures", budget: 14, actual: 12.1 },
  { subsystem: "Suspension Mounts", budget: 10, actual: 7.8 },
  { subsystem: "Body Panels", budget: 9, actual: 3.7 },
];

const MEMBERS = [
  { name: "X4N3Z", email: "muazzinnimah@gmail.com", role: "admin", position: "Frame & Body Lead", subsystem: "Chassis" },
  { name: "Prae", email: "prae@fsae.local", role: "engineer", position: "Welding Lead", subsystem: "Chassis" },
  { name: "Pond", email: "pond@fsae.local", role: "engineer", position: "Analysis Engineer", subsystem: "Impact Structures" },
  { name: "Bank", email: "bank@fsae.local", role: "engineer", position: "CAD Designer", subsystem: "Body Panels" },
  { name: "Film", email: "film@fsae.local", role: "engineer", position: "Manufacturing", subsystem: "Suspension Mounts" },
  { name: "Mild", email: "mild@fsae.local", role: "engineer", position: "QC Inspector", subsystem: "Chassis" },
  { name: "June", email: "june@fsae.local", role: "viewer", position: "Documenter", subsystem: "" },
  { name: "Tle", email: "tle@fsae.local", role: "engineer", position: "FEA Engineer", subsystem: "Impact Structures" },
];

const TASKS = [
  { title: "Design main hoop", status: "in-progress", priority: "critical", tags: ["CAD"], assigneeIdx: 0, due: "2026-09-20" },
  { title: "FEA on impact structure", status: "todo", priority: "high", tags: ["FEA"], assigneeIdx: 2, due: "2026-10-05" },
  { title: "Detail drawing set", status: "review", priority: "medium", tags: ["DRW"], assigneeIdx: 3, due: "2026-09-30" },
  { title: "Weld front bulkhead", status: "in-progress", priority: "high", tags: ["Manufacturing"], assigneeIdx: 1, due: "2026-12-10" },
  { title: "Roll hoop bracing FEA", status: "todo", priority: "medium", tags: ["FEA"], assigneeIdx: 6, due: "2026-10-15" },
  { title: "Side impact bar cutting", status: "done", priority: "medium", tags: ["Manufacturing"], assigneeIdx: 4, due: "2026-11-20" },
  { title: "Body panel mold prep", status: "todo", priority: "low", tags: ["Manufacturing"], assigneeIdx: 3, due: "2027-01-05" },
  { title: "QC weld inspection batch 1", status: "review", priority: "high", tags: ["Manufacturing"], assigneeIdx: 5, due: "2026-12-20" },
  { title: "Update BOM cost sheet", status: "todo", priority: "low", tags: ["DRW"], assigneeIdx: 0, due: "2026-11-10" },
  { title: "Fixture design for jig", status: "in-progress", priority: "medium", tags: ["CAD"], assigneeIdx: 1, due: "2026-11-25" },
  { title: "Titanium bracket analysis", status: "todo", priority: "high", tags: ["FEA"], assigneeIdx: 6, due: "2026-10-25" },
  { title: "Final frame assembly", status: "todo", priority: "critical", tags: ["Manufacturing"], assigneeIdx: 0, due: "2027-01-10" },
];

const BOM_PARTS = [
  { partName: "Main Hoop", partNumber: "BH-001", material: "Steel 4130", quantity: 1, unitWeight: 3200, unitCost: 1500, vendorStatus: "received", manufacturingStatus: "done" },
  { partName: "Front Bulkhead", partNumber: "BH-002", material: "Steel 4130", quantity: 1, unitWeight: 2800, unitCost: 1300, vendorStatus: "received", manufacturingStatus: "welding" },
  { partName: "Side Impact Bar", partNumber: "BH-003", material: "Alu 6061", quantity: 2, unitWeight: 850, unitCost: 600, vendorStatus: "shipping", manufacturingStatus: "cutting" },
  { partName: "Roll Hoop Brace", partNumber: "BH-004", material: "Steel 4130", quantity: 2, unitWeight: 1100, unitCost: 700, vendorStatus: "received", manufacturingStatus: "cutting" },
  { partName: "Fuel Cell Enclosure", partNumber: "BD-001", material: "Carbon Fiber", quantity: 1, unitWeight: 1400, unitCost: 4200, vendorStatus: "ordering", manufacturingStatus: "waiting" },
  { partName: "Floor Panel", partNumber: "BD-002", material: "Carbon Fiber", quantity: 1, unitWeight: 900, unitCost: 3100, vendorStatus: "qc_passed", manufacturingStatus: "done" },
  { partName: "Suspension Mount L", partNumber: "SM-001", material: "Alu 6061", quantity: 1, unitWeight: 620, unitCost: 450, vendorStatus: "received", manufacturingStatus: "done" },
  { partName: "Suspension Mount R", partNumber: "SM-002", material: "Alu 6061", quantity: 1, unitWeight: 620, unitCost: 450, vendorStatus: "received", manufacturingStatus: "done" },
  { partName: "Steering Bracket", partNumber: "SB-001", material: "Alu 6061", quantity: 1, unitWeight: 340, unitCost: 280, vendorStatus: "shipping", manufacturingStatus: "cutting" },
  { partName: "Pedal Box Frame", partNumber: "PB-001", material: "Steel 4130", quantity: 1, unitWeight: 1500, unitCost: 900, vendorStatus: "ordering", manufacturingStatus: "waiting" },
  { partName: "Seat Back Structure", partNumber: "BS-001", material: "Carbon Fiber", quantity: 1, unitWeight: 1100, unitCost: 3800, vendorStatus: "qc_failed", manufacturingStatus: "waiting" },
  { partName: "Diffuser Support", partNumber: "BD-003", material: "Alu 6061", quantity: 2, unitWeight: 480, unitCost: 320, vendorStatus: "received", manufacturingStatus: "cutting" },
];

const FILES = [
  { name: "Main_Hoop_v3.step", category: "CAD", type: "CAD", size: 4200000 },
  { name: "Impact_FEA_Report.pdf", category: "FEA", type: "FEA_Report", size: 2800000 },
  { name: "BOM_Cost_Sheet.xlsx", category: "DRW", type: "DRW", size: 540000 },
  { name: "Welding_Procedure.pdf", category: "Manufacturing", type: "DRW", size: 1200000 },
  { name: "Side_Impact_Bar_dgw.pdf", category: "DRW", type: "DRW", size: 980000 },
  { name: "Frame_Assembly_v2.step", category: "CAD", type: "CAD", size: 6100000 },
];

const WEIGHT_HISTORY = [
  { timestamp: new Date("2026-08-20"), weight: 0, note: "Baseline (design start)" },
  { timestamp: new Date("2026-09-15"), weight: 15.2, note: "Main hoop + bulkhead" },
  { timestamp: new Date("2026-10-10"), weight: 28.6, note: "Impact structures added" },
  { timestamp: new Date("2026-11-05"), weight: 36.1, note: "Suspension mounts" },
  { timestamp: new Date("2026-12-01"), weight: 41.3, note: "Welding progress" },
  { timestamp: new Date("2027-01-10"), weight: 46.8, note: "Body panels start" },
];

async function seed() {
  await connectDB();

  // Idempotent: clean before seeding
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    BOM.deleteMany({}),
    File.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  const members = await User.insertMany(MEMBERS);

  const project = await Project.create({
    name: "FSAE 2026",
    year: 2026,
    targetWeight: 55,
    currentWeight: 46.8,
    milestones: MILESTONES,
    subsystemWeights: SUBSYSTEM_WEIGHTS,
    weightHistory: WEIGHT_HISTORY,
    materialMix: { aluminum: 14.2, steel: 22.5, carbon: 10.1 },
  });

  const tasks = await Task.insertMany(
    TASKS.map((t) => ({
      projectId: project._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      tags: t.tags,
      assignee: members[t.assigneeIdx]._id,
      dueDate: new Date(t.due),
    }))
  );

  const bom = await BOM.insertMany(
    BOM_PARTS.map((b) => ({
      projectId: project._id,
      ...b,
      totalCost: b.unitWeight ? b.unitCost * b.quantity : b.unitCost,
    }))
  );

  const files = await File.insertMany(
    FILES.map((f) => ({
      projectId: project._id,
      ...f,
      storage: "mongo",
      uploadedBy: members[0]._id,
      uploadedAt: new Date("2026-12-01"),
    }))
  );

  const activities = [
    { message: "Project FSAE 2026 created", type: "meeting" },
    { message: "Uploaded Main_Hoop_v3.step", type: "upload" },
    { message: "FEA on impact structure approved", type: "approve" },
    { message: "Side impact bar cutting completed", type: "approve" },
    { message: "Seat Back Structure QC failed — rework needed", type: "error" },
    { message: "Welding procedure document uploaded", type: "upload" },
    { message: "Design review meeting scheduled", type: "meeting" },
    { message: "BOM cost sheet updated", type: "upload" },
    { message: "Frame welding 60% complete", type: "reminder" },
    { message: "Fuel cell enclosure ordered", type: "upload" },
  ];
  // Spread activity over the past ~10 days relative to a fixed season "today" (2026-12-15)
  const SEASON_NOW = new Date("2026-12-15T09:00:00").getTime();
  await ActivityLog.insertMany(
    activities.map((a, i) => ({
      projectId: project._id,
      userId: members[i % members.length]._id,
      timestamp: new Date(SEASON_NOW - (activities.length - i) * 22 * 3600_000),
      ...a,
    }))
  );

  console.log("Seed complete:", {
    members: members.length,
    tasks: tasks.length,
    bom: bom.length,
    files: files.length,
    activities: activities.length,
    milestones: MILESTONES.length,
    weightPoints: WEIGHT_HISTORY.length,
  });
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
