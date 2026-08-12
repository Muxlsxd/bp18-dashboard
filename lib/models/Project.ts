import mongoose, { Schema, models, model } from "mongoose";

const milestoneSchema = new Schema(
  {
    name: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "completed", "delayed"], default: "pending" },
  },
  { _id: false }
);

const weightEntrySchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    weight: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { _id: false }
);

// Weight budget per subsystem (target allocation, kg)
const subsystemWeightSchema = new Schema(
  {
    subsystem: { type: String, required: true }, // e.g. "Chassis", "Impact", "Suspension"
    budget: { type: Number, default: 0 }, // target kg
    actual: { type: Number, default: 0 }, // current measured kg
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    year: { type: Number, required: true },
    targetWeight: { type: Number, default: 55 },
    currentWeight: { type: Number, default: 0 },
    weightHistory: { type: [weightEntrySchema], default: [] },
    milestones: { type: [milestoneSchema], default: [] },
    subsystemWeights: { type: [subsystemWeightSchema], default: [] },
    materialMix: {
      aluminum: { type: Number, default: 0 },
      steel: { type: Number, default: 0 },
      carbon: { type: Number, default: 0 },
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Project = models.Project || model("Project", projectSchema);
