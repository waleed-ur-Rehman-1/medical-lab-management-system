import mongoose from "mongoose";
const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referringDoctorName: String,
  status: { type: String, enum: ["open","closed"], default: "open" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export default mongoose.model("Visit", schema);
