import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: String,
  parent: {
    type: String,
    required: false,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("users", UserSchema);
