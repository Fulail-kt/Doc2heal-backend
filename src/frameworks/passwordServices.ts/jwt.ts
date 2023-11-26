import jwt from '../../useCases/types/jwt.types'
import JWT from 'jsonwebtoken'

class JWTtoken implements jwt {

    createJWT(userId: string, role: string): string {
        const jwtKey=process.env.JWT_SECRET_KEY;
        if(jwtKey){
            const token:string=JWT.sign({id:userId,role:role},jwtKey)
            return token
        }
        throw new Error("JWT_KEY is not defined");
    }

}

export default JWTtoken