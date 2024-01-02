

export default interface JWT {
    createJWT(userId: string, role: string,isApproved:boolean): string;
    // verifyJWT(data: any): any;
}
