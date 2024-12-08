import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: String,
    description: String,
    course: {
      type: mongoose.Schema.Types.Mixed,
      ref: "CourseModel",
    },
    points: Number,
    "due-date": Date,
    "available-from": Date,
    "available-until": Date,
  },
  { collection: "assignments" }
);
export default schema;
