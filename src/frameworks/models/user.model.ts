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
  documents:[String],
  phone: Number,
  gender: {
    type: String,
    enum: ["male","female",],
  },
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
  timeSchedules: [{
    Date:Date,
    startTime:Date,
    endTime:Date,
  }],
  hospital: String,
  experience: String,
  patients:[],
  booking: [
    {
  
    },
  ],
  feedback: [
    {
   
    },
  ],
  bankDetails:
    {
      AcNumber:Number,
      Repeataccount:Number,
      ifsce:String,
      accountHolder:String
    },
  role: {
    type: String,
    enum: ["patient", "doctor","admin"],
    default: "patient",
  },
  wallet: {
    balance: {
        type: Number,
        default: 0,
    },
    transactions: [
        {
            paymentType: {
                type: String,
            },
            amount: {
                type: Number,
            },
            date: {
              type: Date,
              default:Date.now()
          },
        },
    ],
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
  formStatus:String,
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
