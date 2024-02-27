import mongoose from "mongoose";

const subSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "userModel",
    },
    channel: {
      type: Schema.type.ObjectId,
      ref: "userModel",
    },
  },
  { timestamps: true }
);

export const subscription = mongoose.model("subscription", subSchema);
