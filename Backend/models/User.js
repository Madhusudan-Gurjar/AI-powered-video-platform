import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const watchProgressSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  percent: { type: Number, default: 0 },
  watchedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["Student", "Teacher", "Admin"], default: "Student" },

  // Student-specific
  likedVideos:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  watchProgress: [watchProgressSchema],

  createdAt: { type: Date, default: Date.now },
});

/* Hash password before save */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* Compare password helper */
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
