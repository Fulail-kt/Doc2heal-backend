import jwt from '../../useCases/types/jwt.types'
import JWT from 'jsonwebtoken'
require('dotenv').config();
interface JwtTokens {
    accessToken: string;
    refreshToken: string;
  }
class JWTtoken implements jwt {

 async createJWT(userId: string, role: string, isApproved: boolean): Promise<JwtTokens> {

  try {
    
    const jwtKey = process.env.JWT_SECRET_KEY;
    const refreshKey = process.env.JWT_REFRESH_KEY;

    
  
    if (jwtKey && refreshKey ) {
      const accessToken: string = JWT.sign({ id: userId, role, isApproved }, jwtKey, { expiresIn: '24h' });
  
  
    const refreshToken: string = JWT.sign({ id: userId, role, isApproved }, refreshKey);
          
          return ({accessToken,refreshToken});
  
      }
      throw new Error('JWT_KEY or JWT_REFRESH_KEY is not defined');
    } catch (error) {
      throw new Error('JWT_KEY or JWT_REFRESH_KEY is not defined');
      
  }

    
    }
    

    verifyJWT(data: any): any {
        const verify = JWT.verify(data, `${process.env.JWT_SECRET_KEY}`)
        return verify;
    }

}

export default JWTtoken