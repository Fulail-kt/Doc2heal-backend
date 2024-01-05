import mongoose, { Schema } from "mongoose";
import { Booking } from "../../entities/booking";


const bookingSchema = new mongoose.Schema<Booking>({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
  },
  date: {
    type: Date,
  },
  time: {
    type: Date,
  },
  end: { type: Date },
  fee: {
    type: Number,
  },
  feedback: {
    userId: {
      type: mongoose.Types.ObjectId,
    },
  },
  note: {
    type: String,
  },
  userAge: {
    type: Number,
  },
  userId: mongoose.Types.ObjectId,
  userName: {
    type: String,
  },
  prescription:String
});

export default mongoose.model<Booking>("Booking", bookingSchema);