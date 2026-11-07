import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ["admin","receptionist","technician","patient","doctor","accountant"],
    required: true
  },
  isActive: { type: Boolean, default: true },
  patientProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" }
}, { timestamps: true });
schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
schema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};
export default mongoose.model("User", schema);
