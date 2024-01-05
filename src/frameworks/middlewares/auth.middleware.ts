import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.model";

interface User {
    id: string,
    role: string
}



export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers.authorization;



    //check token exist

    if (!authToken) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    try {

        const token = authToken

        const jwtSecret: string = process.env.JWT_SECRET_KEY!;

        const decoded = jwt.verify(token, jwtSecret) as User;

        (req as any).user = decoded;

        const role = (req as any)?.user?.role;

        if (!role) {
            return res.status(401).json({ message: 'Role not found in token' });
        }
        next()

    } catch (error) {
        console.error(error);
        return res.status(403).json({ success: false, message: 'Token verification failed' });
    }

}

export const isBlocked = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let Id = (req as any)?.user.id

        const user = await userModel.findById(Id)

        if (user?.isBlocked) {

            return res.status(400).json({ message: 'admin blocked you', isBlocked: true })

        } else {
            next()
        }

    } catch (error) {
        return res.status(500).json({ message: (error as Error).message })
    }
}



export const AdminroleCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let Id = (req as any)?.user.id;
        const user = await userModel.findById(Id);

        if (user) {
            const UserRole = user.role;
            if (UserRole !== "admin") {
                return res.status(200).json({ success: false, message: `This is not admin` });
            } else {
                next();
            }
        }
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const DocRoleCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let Id = (req as any)?.user.id;
        const user = await userModel.findById(Id);
        if (user) {
            const UserRole = user.role;
            if (UserRole !== "doctor") {
                return res.status(200).json({ success: false, message: `This is not doctor`,notAdmin:true });
            } else {
                next();
            }
        }
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
};




