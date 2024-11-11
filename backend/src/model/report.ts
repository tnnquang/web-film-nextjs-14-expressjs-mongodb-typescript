import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    episode: { type: String, required: true },
    title: {type: String, required: false}
  },
  { timestamps: true },
);

export default mongoose.model("report", reportSchema);
