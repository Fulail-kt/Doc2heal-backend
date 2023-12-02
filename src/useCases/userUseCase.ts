import User from "../entities/user"
import UserRepository from "../frameworks/repository/user.repository"
import Encrypt from "../frameworks/passwordServices.ts/hashPassword"
import JWTtoken from "../frameworks/passwordServices.ts/jwt"
import OtpRepository from "../frameworks/repository/otp.repository"
import Otp from "../entities/otp"
import mongoose, { Types } from "mongoose"
import { errorMonitor } from "nodemailer/lib/xoauth2"
import userModel from "../frameworks/models/user.model"

class UserUsecase {
    private userRepository: UserRepository
    private otpRepository: OtpRepository
    private encrypt: Encrypt
    private jwtToken: JWTtoken
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
        this.otpRepository = new OtpRepository
        this.encrypt = new Encrypt()
        this.jwtToken = new JWTtoken()
    }


    // USER REGISTRATION----------------------------------

    async register(user: User, otp: number) {
        try {
            const newPassword = await this.encrypt.createHash(user.password);

            const NewUser: User = {
                username: user.username,
                email: user.email,
                password: newPassword,
                phone: user.phone,
            }
            const response = await this.userRepository.create(NewUser)

            if (!response.success) {
                return {
                    status: 500,
                    success: false,
                    message: response.message,
                    // user:response.user
                }
            }

            let otpDetails: Otp = {
                // userId:new mongoose.Types.ObjectId(response.user?._id) as Types.ObjectId,
                userMail: user.email,
                otp,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }



            const saveOtp = await this.otpRepository.SaveOtp(otpDetails)


            if (saveOtp?.success) {

                const userId = response.user?._id?.toString() || '';
                const role = response.user?.role || ''
                const token = this.jwtToken.createJWT(userId, role);
                return {
                    status: 200,
                    success: true,
                    message: response.message + " & " + "otp Sent",
                    // user:NewUser,
                    token,
                    user: response?.user,
                    email: response.user?.email,
                    id: response.user?._id
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


    //LOGIN---------------------------

    async login(credentials: { email: string; password: string }) {
        try {

            const { email, password } = credentials

            const response = await this.userRepository.findByEmail(email)

            if (response.success) {
                const storedUser = response.user;

                if (storedUser && storedUser.password) {
                    const passwordMatch = await this.encrypt.compare(password, storedUser.password);

                    if (!passwordMatch) {
                        // Incorrect password
                        return {
                            status: 401,
                            success: false,
                            message: "Invalid credentials",
                        };
                    }


                    const userId = storedUser?._id?.toString() || '';
                    const role = storedUser?.role || ''
                    const token = this.jwtToken.createJWT(userId, role);


                    // Password is correct then // checking is blocked or not

                    if (storedUser?.isBlocked) {
                        return {
                            message: 'admin blocked',
                            user: storedUser,
                        }
                    }


                    // if user not verified

                    // if (!storedUser?.isVerified) {

                    //     let otpDetails: Otp = {
                    //         // userId:new mongoose.Types.ObjectId(response.user?._id) as Types.ObjectId,
                    //         userMail: storedUser.email,
                    //         otp,
                    //         expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                    //         createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    //     }
                    //     return { success: false, message: 'Account is not verified,' }
                    // }



                    // checking user is doctor

                    if (storedUser?.role == "doctor") {
                        //checking approval status of Doctor
                        if (!storedUser?.isApproved) {
                            console.log(token);

                            return { success: true, isApproved: false, message: 'Account is not approved by admin', storedUser, token }
                        }


                    }




                    return {
                        status: 200,
                        token,
                        user: storedUser,
                        success: true,
                        message: "Login successful",
                    }

                } else {
                    // User or password not found
                    return {
                        status: 401,
                        success: false,
                        message: "Invalid credentials",

                    };
                }
            } else {

                return {
                    status: 400,
                    success: false,
                    message: response.message,
                };
            }
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: "Internal server error. Please try again later.",
            }
        }
    }



    //UPDATE USER DETAILS-----------------------------------

    async updateUser(id: string, updatedUser: any) {
        try {
            const response = await this.userRepository.findByIdAndUpdate(id, updatedUser);

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
        } catch (error: any) {
            console.error(error.message);
            return {
                status: 500,
                success: false,
                message: "Internal server error. Please try again later.",
            };
        }
    }


    //VERIFY OTP------------------------------------------


    async verifyOtp(email: string, code: number, id: string): Promise<{ success: boolean, message: string }> {
        try {
            console.log(email, code, "use=========================");

            // Check if the provided OTP matches the stored OTP for the user
            const isOtpValid = await this.otpRepository.findOtpByEmailAndCode(email, code);

            console.log(isOtpValid, ";;;;;;;;;;------------");

            if (isOtpValid.success) {
                // Log the ID before updating


                // Update the user with timeTolive set to 0



                let ID = new mongoose.Types.ObjectId(id)


                const response = await userModel.findOne({ email })

                if (response) {

                    response.timeTolive = undefined;
                    response.isVerified = true;
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



    async findAllUser(user: string): Promise<{ success: boolean, message: string, data?: any }> {
        try {


            const response = await this.userRepository.findAll(user)


            if (!response.success) {
                return {
                    success: false,
                    message: 'an error occured while retrived all doctors'
                }
            }

            return {
                success: true,
                data: response.data,
                message: 'Retrived all doctors'
            }
        } catch (error: any) {

            console.log(error.message);

            return {
                success: false,
                message: '(an error occured from database)' + error.message
            }


        }
    }



    async getuser(userId: string): Promise<{success:boolean,message:string,user?:{}}> {
        try {

            
            const user = await this.userRepository.findById(userId)

            if (!user) {
                return {
                    success: false,
                    message: 'an error occured while retrived all users'
                }
            }


            

            return {
                success: true,
                user,
                message: 'Retrived the user'
            }
        } catch (error:any) {
            return {
                success: false,
                message: '(an error occured from database)' + error.message
            }
        }
    }


    //     async getuser(userId:string)Promise<{ }> {


    //         try{
    //         // const response = await this.userRepository.(user)



    //         // if (!response.success) {
    //         //     return {
    //         //         success: false,
    //         //         message: 'an error occured while retrived all doctors'
    //         //     }
    //         // }

    //         // return {
    //         //     success: true,
    //         //     data: response.data,
    //         //     message: 'Retrived all doctors'
    //         // }
    //     }catch (error: any) {

    //         console.log(error.message);

    //         return {
    //             success: false,
    //             message: '(an error occured from database)' + error.message
    //         }

    //     }


    // }


}




export default UserUsecase