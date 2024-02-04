import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.model";
import cookieParser from 'cookie-parser'

interface User {
    id: string,
    role: string
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



export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    cookieParser()(req, res, () => {});

    const authToken = req.headers.authorization;
    const refreshToken = req.cookies.refresh;

    if (!authToken && !refreshToken) {
        return res.status(401).json({ success: false, message: 'No tokens provided' });
    }

    const jwtSecret: string = process.env.JWT_SECRET_KEY!;
    const refreshSecret: string = process.env.JWT_REFRESH_KEY!;

    if (authToken) {
        try {
            const decoded = jwt.verify(authToken, jwtSecret) as User;
            (req as any).user = decoded;
            const role = (req as any)?.user?.role;
            if (!role) {
                return res.status(401).json({ message: 'Role not found in token' });
            }
            // Continue if access token is successfully verified
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Token verification failed' });
        }
    } else if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, refreshSecret);
            const user = decoded as any;
            (req as any).user = user;

            const newAccessToken = jwt.sign(
                { id: user.id, role: user.role, isApproved: user.isApproved },
                jwtSecret,
                { expiresIn: '1h' }
            );

            if (!newAccessToken) {
                return res.status(403).json({ success: false, message: 'Token generation failed' });
            }
            // Set the new access token in the response header or wherever it's needed
            res.setHeader('Authorization', newAccessToken);

            // Continue with the request
            next();
        } catch (refreshError) {
            console.error(refreshError);
            return res.status(401).json({ success: false, message: 'Refresh token verification failed' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'No tokens provided' });
    }
};