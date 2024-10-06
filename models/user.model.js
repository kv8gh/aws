import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  latestScore: { type: Number, default: 0 },  // Add latestScore field
  highestScore: { type: Number, default: 0 }, // Add highestScore field
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
