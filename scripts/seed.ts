import "dotenv/config";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Project } from "@/lib/models/Project";
import { Task } from "@/lib/models/Task";
import { BOM } from "@/lib/models/BOM";

async function seed() {
  await connectDB();

  // Idempotent: clean before seeding
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({}), BOM.deleteMany({})]);

  const admin = await User.create({
    name: "X4N3Z",
    email: "muazzinnimah@gmail.com",
    role: "admin",
    isActive: true,
  });

  const project = await Project.create({
    name: "FSAE 2026",
    year: 2026,
    targetWeight: 55,
    currentWeight: 0,
    milestones: [
      { name: "Design Freeze", dueDate: new Date("2026-10-01"), status: "pending" },
      { name: "Manufacturing Start", dueDate: new Date("2026-11-01"), status: "pending" },
      { name: "Testing Start", dueDate: new Date("2027-01-15"), status: "pending" },
    ],
    materialMix: { aluminum: 0, steel: 0, carbon: 0 },
  });

  await Task.create([
    { projectId: project._id, title: "Design main hoop", status: "in-progress", priority: "critical", tags: ["CAD"] },
    { projectId: project._id, title: "FEA on impact structure", status: "todo", priority: "high", tags: ["FEA"] },
    { projectId: project._id, title: "Detail drawing set", status: "review", priority: "medium", tags: ["DRW"] },
  ]);

  await BOM.create([
    { projectId: project._id, partName: "Main Hoop", partNumber: "BH-001", material: "Steel 4130", quantity: 1, unitWeight: 3200, unitCost: 1500, totalCost: 1500, vendorStatus: "received", manufacturingStatus: "done" },
    { projectId: project._id, partName: "Side Impact Bar", partNumber: "BH-002", material: "Alu 6061", quantity: 2, unitWeight: 850, unitCost: 600, totalCost: 1200, vendorStatus: "shipping", manufacturingStatus: "cutting" },
  ]);

  console.log("Seed complete:", {
    admin: admin.email,
    project: project.name,
    tasks: 3,
    bom: 2,
  });
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
