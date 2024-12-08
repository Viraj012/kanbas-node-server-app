import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: String,
    description: String,
    course: {
      type: mongoose.Schema.Types.Mixed,
      ref: "CourseModel",
    },
  },
  { collection: "modules" }
);
export default schema;
