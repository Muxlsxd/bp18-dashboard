import mongoose, { Schema, models, model } from "mongoose";

const taskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: { type: Date, default: null },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    tags: {
      type: [String],
      enum: ["CAD", "DRW", "FEA", "Manufacturing"],
      default: [],
    },
  },
  { timestamps: true }
);

export const Task = models.Task || model("Task", taskSchema);
