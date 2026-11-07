import mongoose from "mongoose";
const paramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, default: "" },
  resultType: { type: String, enum: ["numeric","qualitative"], default: "numeric" },
  referenceRange: { type: String, default: "" },
  low: Number,
  high: Number
});
const schema = new mongoose.Schema({
  testCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  testName: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  sampleType: { type: String, default: "Blood" },
  parameters: [paramSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("Test", schema);
