import mongoose, { Schema, models, model } from "mongoose";

const activityLogSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["upload", "approve", "reminder", "meeting", "delete", "error"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ActivityLog = models.ActivityLog || model("ActivityLog", activityLogSchema);
