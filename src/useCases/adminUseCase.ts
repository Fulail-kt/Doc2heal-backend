import UserRepository from "../frameworks/repository/user.repository"


class adminUseCase{


    private userRepository: UserRepository

    
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository

    }






    async blockUser(userId: string) {
        try {
            const user = await this.userRepository.findById(userId);
    
            if (user) {
                console.log("user found");
    
                const isBlocked = !user.isBlocked;
    
                const blockedUser = await this.userRepository.findByIdAndUpdate(userId, { isBlocked });
    
                return {
                    status: 200,
                    user: blockedUser,
                };
            } else {
                return {
                    status: 404,
                    message: "User not found",
                };
            }
        } catch (error: any) {
            console.error(error.message);
            return {
                status: 500,
                message: "Internal server error. Please try again later.",
            };
        }
        
    }
    

    async approveUser(userId: string) {
        try {
            const user = await this.userRepository.findById(userId);
    
            if (user) {
                console.log("user found");
    
                let isApproved = !user.isApproved;
    
                const approvedstatus = await this.userRepository.findByIdAndUpdate(userId, { isApproved });
    
                return {
                    status: 200,
                    user: approvedstatus,
                };
            } else {
                return {
                    status: 404,
                    message: "User not found",
                };
            }
        } catch (error: any) {
            console.error(error.message);
            return {
                status: 500,
                message: "Internal server error. Please try again later.",
            };
        }
        
    }








}

export default adminUseCase