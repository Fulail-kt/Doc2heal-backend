import mongoose from "mongoose";
import User from "../../entities/user";

const userSchema = new mongoose.Schema<User>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  image: String,
  phone: Number,
  address: [
    {
      name: String,
      house: String,
      post: String,
      pin: Number,
      contact: Number,
      state: String,
      District: String,
    },
  ],
  specialization: String,
  fee: Number,
  timeSchedules: [String],
  hospital: String,
  experience: Number,
  booking: [
    {
  
    },
  ],
  feedback: [
    {
   
    },
  ],
  report: [
    {

    },
  ],
  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "user",
  },
  wallet: {

  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isApproved:{
    type: Boolean,
    default: false,
  }
});

const userModel = mongoose.model<User>("User", userSchema);
export default userModel;
