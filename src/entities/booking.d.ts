import mongoose, { Document } from "mongoose";

interface Booking {
  doctorId: mongoose.Types.ObjectId;
  status: string;
  date: Date;
  time: Date;
  fee: number;
  end:Date;
  feedback: {
    userId: mongoose.Types.ObjectId;
  };
  note: string;
  userAge: number;
  userId: mongoose.Types.ObjectId;
  userName: string;
  prescription?:string
}