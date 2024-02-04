
interface JwtTokens {
    accessToken: string;
    refreshToken: string;
  }

export default interface JWT {
    createJWT(userId: string, role: string,isApproved:boolean): Promise<JwtTokens>;
    // verifyJWT(data: any): any;
}
