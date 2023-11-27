import User from "../entities/user"
import UserRepository from "../frameworks/repository/user.repository"
import Encrypt from "../frameworks/passwordServices.ts/hashPassword"
import JWTtoken from "../frameworks/passwordServices.ts/jwt"
import OtpRepository from "../frameworks/repository/otp.repository"
import Otp from "../entities/otp"
import mongoose,{Types} from "mongoose"
import { errorMonitor } from "nodemailer/lib/xoauth2"
import userModel from "../frameworks/models/user.model"

class UserUsecase {
    private userRepository: UserRepository
    private otpRepository: OtpRepository
    private encrypt:Encrypt
    private jwtToken:JWTtoken
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
        this.otpRepository= new OtpRepository
        this.encrypt= new Encrypt()
        this.jwtToken=new JWTtoken()
    }

    async register(user: User,otp:number) {
        try {
            const newPassword = await this.encrypt.createHash(user.password);

            const NewUser:User={
             username: user.username,
             email: user.email,
             password: newPassword,
             phone:user.phone,
            }
            const response = await this.userRepository.create(NewUser)
            
            if (!response.success) {
                return {
                    status:500,
                        success: false,
                        message: response.message,
                        // user:response.user
                }
            } 

           

            let otpDetails:Otp={
                // userId:new mongoose.Types.ObjectId(response.user?._id) as Types.ObjectId,
                userMail:user.email,
                otp,
                expiresAt:new Date(Date.now() + 15 * 60 * 1000),
                createdAt:new Date(Date.now() + 24 * 60 * 60 * 1000)
            }

            
            
            const saveOtp= await this.otpRepository.SaveOtp(otpDetails)

            if(saveOtp?.success){

                return {
                    status:200,
                    success: true,
                    message:response.message+" & "+"otp Sent",
                    // user:NewUser,
                    user:response?.user,
                    email:response.user?.email,
                    id:response.user?._id
                }
    
            }




        } catch (error) {
            return {
                status: 500,
                    success: false,
                    message: "server error"
                
            }
        }
    }

    async login(credentials:{email: string; password: string}){
        try {

            const {email,password}=credentials

            // console.log("hleeeeeeeeeeeeeee");
            

            const response=await this.userRepository.findByEmail(email)
            
            if (response.success) {
                const storedUser  = response.user;

                if (storedUser && storedUser.password) {
                    const passwordMatch = await this.encrypt.compare(password,storedUser.password);

                    if (!passwordMatch) {
                        // Incorrect password
                        return {
                            status: 401,
                            success: false,
                            message: "Invalid credentials",
                        };
                    }


                    // Password is correct

                    const userId = storedUser?._id?.toString() || '';
                    const role=storedUser?.role || ''
                    const token = this.jwtToken.createJWT(userId,role);
                    return {
                        token,
                        status: 200,
                        user: storedUser,
                        success: true,
                        message: "Login successful",

                    };
                } else {
                    // User or password not found
                    return {
                        status: 401,
                        data: {
                            success: false,
                            message: "Invalid credentials",
                        },
                    };
                }
            } else {
                
                return {
                    status: 400,
                    data: {
                        success: false,
                        message: response.message,
                    },
                };
            }
        } catch (error) {
            return{ 
                status:500,
                success: false,
                message: "Internal server error. Please try again later.",
            }
        }
    }



    async updateUser(id: string, updatedUser: any) {
        try {
            const response = await this.userRepository.findByIdAndUpdate(id,updatedUser);
    
            if (response.success) {
                return {
                    status: 200,
                    success: true,
                    message: "Updated successfully",
                    updatedUser
                };
            } else {
                return {
                    status: 400,
                    success: false,
                    message: response.message,
                };
            }
        } catch (error:any) {
            console.error(error.message);
            return {
                status: 500,
                success: false,
                message: "Internal server error. Please try again later.",
            };
        }
    }


    async verifyOtp(email: string, code: number, id: string): Promise<{ success: boolean, message: string }> {
        try {
            console.log(email, code, "use=========================");
    
            // Check if the provided OTP matches the stored OTP for the user
            const isOtpValid = await this.otpRepository.findOtpByEmailAndCode(email, code);
    
            console.log(isOtpValid, ";;;;;;;;;;------------");
    
            if (isOtpValid.success) {
                // Log the ID before updating
             
    
                // Update the user with timeTolive set to 0
          


                let ID=new mongoose.Types.ObjectId(id)
             

                const response= await userModel.findOne({email})
    
                if (response) {

                    response.timeTolive = undefined;
                    await response.save();
                    return {
                        success: true,
                        message: 'OTP verified and user updated'
                    };
                } else {
                    return {
                        success: false,
                        message: 'User not found or not updated'
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'Invalid OTP'
                };
            }
        } catch (error) {
            console.error('Error verifying OTP in UserUseCase:', error);
            return {
                success: false,
                message: 'Error occurred while OTP verification'
            };
        }
    }
    
      
    
}



export default UserUsecase