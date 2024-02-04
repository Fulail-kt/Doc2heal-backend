import mongoose,{Types} from 'mongoose';

interface Otp{
        // userId:Types.ObjectId;
        userMail:string;
        otp: number;
        expiresAt: Date;
        createdAt:Date
      }

export default Otp



