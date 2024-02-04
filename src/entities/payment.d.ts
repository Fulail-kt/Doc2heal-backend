import { ObjectId } from "mongoose";

interface BankDetails {
    AcNumber: number;
    Repeataccount: number;
    ifsce: string;
    accountHolder: string;
  }
  
  interface PaymentRequest {
    doctorId: ObjectId;
    bankDetails: BankDetails[];
    status: string;
    walletAmount:number
  }
  
  export default PaymentRequest;
  