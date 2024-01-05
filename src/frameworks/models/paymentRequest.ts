import mongoose,{Types} from 'mongoose';
import paymentRequest from '../../entities/payment'

const paymentRequest = new mongoose.Schema<paymentRequest>({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  bankDetails:{
    AcNumber:Number,
    Repeataccount:Number,
    ifsce:String,
    accountHolder:String
  },
  walletAmount:Number,
  status:{
    type:String,
    default:"requested"
  }
});

const paymentModal = mongoose.model<paymentRequest>('payment', paymentRequest);

export default paymentModal
