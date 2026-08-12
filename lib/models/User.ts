import mongoose, { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "engineer", "viewer"], default: "viewer" },
    position: { type: String, default: "" }, // e.g. "Frame Lead", "Welding", "Analysis"
    subsystem: { type: String, default: "" }, // e.g. "Chassis", "Impact", "Suspension"
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = models.User || model("User", userSchema);
