

export default interface JWT {
    createJWT(userId: string, role: string): string;
    // verifyJWT(data: any): any;
}
