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
  experience: String,
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
    enum: ["patient", "doctor","admin"],
    default: "patient",
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
  },
  isVerified:{
    type: Boolean,
    default: false,
  },
  timeTolive: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    },
    index: { expires: 0 },
  }
  
});

const userModel = mongoose.model<User>("User", userSchema);
export default userModel;
