import mongoose from "mongoose";

const adsSchema = new mongoose.Schema(
  {
    data: { type: Object, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("ads", adsSchema);
