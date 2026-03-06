import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    avatar?: string;
    googleId?: string;
    refreshTokens: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model<IUser>("Users", userSchema);
export default userModel;
