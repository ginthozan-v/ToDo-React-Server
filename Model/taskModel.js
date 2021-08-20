import mongoose from "mongoose";

const task = mongoose.Schema({
  task: String,
  assigned: String,
  complete: Boolean,
});

export default mongoose.model("tasks", task);
