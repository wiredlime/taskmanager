const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "working", "review", "done", "archived"],
      required: true,
      default: "pending",
    },
    assignee: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

//Create and export model
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
