import mongoose, { Schema, models, model } from "mongoose";

const fileSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["CAD", "DRW", "BOM", "FEA_Report"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "review", "approved", "pending"],
      default: "draft",
    },
    version: { type: Number, default: 1 },
    previousVersionId: { type: Schema.Types.ObjectId, ref: "File", default: null },
    googleFileId: { type: String, default: "" },
    googleWebViewLink: { type: String, default: "" },
    googleWebContentLink: { type: String, default: "" },
    // Storage backend: "mongo" (GridFS) or "drive" (Google Drive). Falls back to mongo when Drive unavailable.
    storage: { type: String, enum: ["mongo", "drive"], default: "mongo" },
    mongoFileId: { type: Schema.Types.ObjectId, default: null },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    lockedAt: { type: Date, default: null },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    uploadedAt: { type: Date, default: Date.now },
    metadata: {
      rev: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const File = models.File || model("File", fileSchema);
