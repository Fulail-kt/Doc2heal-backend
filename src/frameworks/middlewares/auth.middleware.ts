import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


  

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers.authorization;

    //check token exist

    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    try {

        const token=authToken.split(" ")[1];

        const jwtSecret: string = process.env.JWT_SECRET_KEY!;

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next()
        
    } catch (error) {
         console.error(error);
        return res.status(403).json({ success: false, message: 'Token verification failed' });
    }

}


// export const restrict=async(req:Request,res:Response,next:NextFunction){


//     const {userId,role}=req.user

//     let user;

//     cpoo
// }