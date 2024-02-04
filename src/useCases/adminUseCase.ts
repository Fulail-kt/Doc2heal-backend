import PaymentRepository from "../frameworks/repository/payment.repository";
import UserRepository from "../frameworks/repository/user.repository"


class adminUseCase {


    private userRepository: UserRepository
    private paymentRepository: PaymentRepository
    constructor(userRepository: UserRepository,paymentRepository:PaymentRepository) {
        this.userRepository = userRepository
        this.paymentRepository= paymentRepository

    }



    async blockUser(userId: string) {
        try {
            const user = await this.userRepository.findById(userId);

            if (user) {
              
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
        } catch (error) {
            console.error((error as Error).message);
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
        } catch (error) {
            console.error((error as Error).message);
            return {
                status: 500,
                message: "Internal server error. Please try again later.",
            };
        }

    }

    async applicationStatus(doctorId: string, status: string) {
        try {
            let updateData: { formStatus: string; role: string; isApproved: boolean } = {
                formStatus: "",
                role: "",
                isApproved: false
            };
            if (status === "Accepted") {
                updateData = {
                    formStatus: status,
                    role: 'doctor',
                    isApproved: true
                };
            } else if (status === "Rejected") {
                updateData = {
                    formStatus: status,
                    role: 'patient',
                    isApproved: false
                };
            }
            const verification = await this.userRepository.findByIdAndUpdate(doctorId, updateData);
            if(verification.success){
                return {
                    success: true,
                    message: "User updated successfully",
                    updatedUser: verification.updatedUser
                }
            } else{
                return{
                    success: false,
                    message: "error occured while updating verification",
                }
            }
        } catch (error) {
            throw error
        }
    }

    async totalEarnings(){
        try {
            const totalEarnings = await this.userRepository.adminEarnings()
            if(totalEarnings){
                return({success:true,totalEarnings})
            }else{
                return({success:false})
            }
        } catch (error) {
            throw error
        }
    }

    async paymentRequests(status:string){
        try {
            const response=await this.paymentRepository.find(status)

            if(!response){
                return ({success:false,message:"error occured while getting payment requests"})
            }
            return ({success:true,message:"Payment request retrived",payment:response})
            
        } catch (error) {
            throw error
        }
    }
    
    async updatePayment(id:string,data:string){
        try {
            const updateData={
                status:data
            }
            const response=await this.paymentRepository.findByIdAndUpdate(id,updateData)

            if(!response){
                return ({success:false,message:"error occured while updating payment requests"})
            }
            return ({success:true,message:"Payment request updated",payment:response})
            
        } catch (error) {
            throw error
        }
    }





}

export default adminUseCase