import { Request } from "express";
// import { JwtPayload } from "jsonwebtoken";
// declare global  {
//   namespace Express {
//     interface Request {
//       user:JwtPayload
//     }
//   }
// }

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
      };
    }
  }
}



import 'express-session';

// declare module 'express-session' {
//   interface SessionData {
//     user?: {
    
//       email: string;
//       username: string;
//       phone:number;
//       password:string;
      
//     };
//   }
// }



declare module 'express-session' {
  interface SessionData {
    user?: {
      email: string;
      username: string;
      phone: number;
      password: string;
    };
  }
}