import mongoose from "mongoose";
const schema = new mongoose.Schema({
  mrNumber: { type: String, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ["male","female","other"], required: true },
  dateOfBirth: Date,
  age: { type: Number, min: 0 },
  contactNumber: { type: String, required: true },
  whatsappNumber: String,
  address: String,
  emergencyContact: String,
  accountStatus: { type: String, enum: ["active","inactive"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export default mongoose.model("Patient", schema);
