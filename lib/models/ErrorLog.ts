import mongoose, { Schema, models, model } from "mongoose";

const errorLogSchema = new Schema(
  {
    route: { type: String, required: true },
    method: { type: String, required: true },
    errorMessage: { type: String, required: true },
    stackTrace: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ErrorLog = models.ErrorLog || model("ErrorLog", errorLogSchema);
