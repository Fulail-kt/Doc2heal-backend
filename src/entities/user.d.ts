interface User {
    username: string;
    email: string;
    password: string;
    image?: string;
    documents?: [string];
    phone: number;
    gender:"male"|"female"
    address?: {
      name: string;
      house: string;
      post: string;
      pin: number;
      contact: number;
      state: string;
      District: string;
    }[];
    formStatus?:string
    specialization?: string;
    fee?: number;
    timeSchedules?: string[];
    hospital?: string;
    experience?: string;
    booking?: {

    }[];
    feedback?: {

    }[];
    report?: {

    }[];
    role?: 'patient' | 'doctor'|'admin';
    wallet?: {
      balance: number,
      transactions: [
        {
          paymentType: string,
          amount: number,
        }]};
    isBlocked?: boolean;
    isApproved?:boolean,
    isVerified?:boolean;
    timeTolive?:Date|number
  }
  
  export default User;
  