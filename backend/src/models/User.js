import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);