interface User {
    username: string;
    email: string;
    password: string;
    image?: string;
    phone: number;
    address?: {
      name: string;
      house: string;
      post: string;
      pin: number;
      contact: number;
      state: string;
      District: string;
    }[];
    specialization?: string;
    fee?: number;
    timeSchedules?: string[];
    hospital?: string;
    experience?: number;
    booking?: {

    }[];
    feedback?: {

    }[];
    report?: {

    }[];
    role?: 'patient' | 'doctor'|'admin';
    wallet?: {

    };
    isBlocked?: boolean;
    isApproved?:boolean,
    isVerified?:boolean;
    timeTolive?:Date|number
  }
  
  export default User;
  