import mongoose from "mongoose";

const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Result" },
  providerMessageId: { type: String, index: true },
  phone: String,
  reportUrl: String,
  status: {
    type: String,
    enum: ["queued","sent","delivered","read","failed"],
    default: "queued"
  },
  error: String
}, { timestamps: true });

export default mongoose.model("WhatsAppMessage", schema);
