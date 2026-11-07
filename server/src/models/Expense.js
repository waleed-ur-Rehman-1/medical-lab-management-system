import mongoose from "mongoose";

const schema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Salaries","Rent","Electricity","Internet","Lab Supplies","Maintenance","Transport","Other"],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  note: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

schema.index({ date: -1 });
schema.index({ category: 1, date: -1 });

export default mongoose.model("Expense", schema);
