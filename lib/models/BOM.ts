import mongoose, { Schema, models, model } from "mongoose";

const bomSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    partName: { type: String, required: true },
    partNumber: { type: String, default: "" },
    material: {
      type: String,
      enum: ["Alu 6061", "Steel 4130", "Carbon Fiber"],
      required: true,
    },
    quantity: { type: Number, default: 1 },
    unitWeight: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    vendorStatus: {
      type: String,
      enum: ["ordering", "shipping", "received", "qc_passed", "qc_failed"],
      default: "ordering",
    },
    manufacturingStatus: {
      type: String,
      enum: ["waiting", "cutting", "welding", "done"],
      default: "waiting",
    },
    drawingFileId: { type: Schema.Types.ObjectId, ref: "File", default: null },
    receivedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const BOM = models.BOM || model("BOM", bomSchema);
