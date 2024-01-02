import jwt from '../../useCases/types/jwt.types'
import JWT from 'jsonwebtoken'
require('dotenv').config();
class JWTtoken implements jwt {

    createJWT(userId: string, role: string,isApproved:boolean): string {

        const jwtKey = process.env.JWT_SECRET_KEY;

        if (jwtKey) {

            const token: string = JWT.sign({ id: userId, role: role,isApproved }, jwtKey, { expiresIn: '24h' })

            return token
        }
        throw new Error("JWT_KEY is not defined");
    }

    verifyJWT(data: any): any {
        const verify = JWT.verify(data, `${process.env.JWT_SECRET_KEY}`)
        return verify;
    }

}

export default JWTtoken