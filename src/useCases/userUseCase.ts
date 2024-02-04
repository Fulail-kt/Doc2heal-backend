import User from "../entities/user"
import UserRepository from "../frameworks/repository/user.repository"
import Encrypt from "../frameworks/passwordServices.ts/hashPassword"
import JWTtoken from "../frameworks/passwordServices.ts/jwt"
import OtpRepository from "../frameworks/repository/otp.repository"
import Otp from "../entities/otp"
import mongoose, { ObjectId, Types } from "mongoose"
import { errorMonitor } from "nodemailer/lib/xoauth2"
import userModel from "../frameworks/models/user.model"
import bookingModel from "../frameworks/models/booking.model"
import BookingRepository from "../frameworks/repository/booking.repository"
import ConversationRepository from "../frameworks/repository/conversation.repository"
import { Booking } from "../entities/booking"

class UserUsecase {
    private userRepository: UserRepository
    private otpRepository: OtpRepository
    private bookingRepository: BookingRepository
    private conversationRepository: ConversationRepository
    private encrypt: Encrypt
    private jwtToken: JWTtoken
    constructor(userRepository: UserRepository, conversationRepository: ConversationRepository) {
        this.userRepository = userRepository
        this.otpRepository = new OtpRepository
        this.bookingRepository = new BookingRepository
        this.conversationRepository = conversationRepository
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
                gender: user.gender
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
                const isApproved = response?.user?.isApproved || false

                const token = this.jwtToken.createJWT(userId, role, isApproved);
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
            if (response) {

                const storedUser = response;

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
                    const isApproved = storedUser?.isApproved || false
                    // const token = this.jwtToken.createJWT(userId, role, isApproved);
                    const { accessToken, refreshToken } =await this.jwtToken.createJWT(userId, role, isApproved);

                    // Password is correct then // checking is blocked or not
                    if (storedUser?.isBlocked) {
                        return {
                            message: 'admin blocked',
                            user: storedUser,
                        }
                    }


                    // checking user is doctor
                    if (storedUser?.role == "doctor") {
                        //checking approval status of Doctor
                        if (!storedUser?.isApproved) {
                          
                            return { success: true, isApproved: false, message: 'Account is not approved by admin', storedUser,
                             token:accessToken,
                             refresh:refreshToken
                             }
                        }


                    }
                    return {
                        status: 200,
                        accessToken,
                        refreshToken,
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
                    message: "User not found",
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
                    updatedUser: response?.updatedUser
                };
            } else {
                return {
                    status: 400,
                    success: false,
                    message: response.message,
                };
            }
        } catch (error) {
            console.error((error as Error).message);
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
            const isOtpValid = await this.otpRepository.findOtpByEmailAndCode(email,code);
            if (isOtpValid.success) {

                let ID = new mongoose.Types.ObjectId(id)

                const response = await this.userRepository.otpSuccess(email)

                if (response?.success) {
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



    async findAllUser(): Promise<{ success: boolean, message: string, data?: any }> {
        try {
            const response = await this.userRepository.findAll()

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
        } catch (error) {

            console.log((error as Error).message);

            return {
                success: false,
                message: '(an error occured from database)' + (error as Error).message
            }


        }
    }



    async getuser(userId: string | any): Promise<{ success: boolean, message: string, user?: {} }> {
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
        } catch (error) {
            return {
                success: false,
                message: '(an error occured from database)' + (error as Error).message
            }
        }
    }


    //    async doctorApply(user:{}):Promise <{message:string,success:boolean,user?:{}}>{

    //     try {

    //         const registeredUser=await this.userRepository.findByIdAndUpdate(id,user)

    //         if(registeredUser){
    //             return{
    //                 success: true,
    //                 user:registeredUser,
    //                 message: 'Applied'
    //             }
    //         }

    //         return{
    //             success: false,
    //             message: 'Application failed'
    //         }
    //     } catch (error) {

    //     }
    //    }


    async updateProfile(url: string, Id: string) {
        try {
            let user = {
                image: url
            }
            const update = await this.userRepository.findByIdAndUpdate(Id, user)


            if (update) {
                return update;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return { success: false, status: 500 };
        }
    }



    async saveDocuments(id: string, doc: any) {

        try {
            const saveDocuments = await this.userRepository.saveDocuments(id, doc)
            if (saveDocuments) {

                return {
                    message: 'Documents successfully uploaded',
                    success: true
                }
            } else {
                return {
                    message: 'Some error occured while uploading',
                    success: false
                }
            }

        } catch (error) {
            throw error
        }
    }


    // Bookings=======

    async getbookings(Id: string,date:string) {
        try {

            const bookings = await this.bookingRepository.findByDoctorIdfilter(Id,date)
            
            if (bookings) {
                return ({ success: true, bookings })
            } else {
                return null
            }
        } catch (error) {

        }
    }


    async getAllbookings(Id: string) {
        try {
            const bookings = await this.bookingRepository.findByUserId(Id)

            if (bookings) {
                return ({ success: true, bookings })
            } else {
                return null
            }
        } catch (error) {

        }
    }




    async saveBooking(userId: string, bookingData: { username: string, age: number, note: string, bkId: string,prescription?:string,status:string },useWallet:boolean) {
        try {
            let bookingId = new mongoose.Types.ObjectId(bookingData.bkId)

            const response = await this.bookingRepository.findById(bookingId)

            if (response) {

                const res = await this.bookingRepository.findByIdAndUpdate(userId, bookingData)
                if (res?.success) {

                    const createConversation = await this.conversationRepository.createConversation(userId, response.doctorId.toString())

                    if (!createConversation) {
                        return { message: 'Error creating conversation', success: false };
                    }

                    
                    if(useWallet){
                        const updateUser= {
                            $inc: { 'wallet.balance': -response.fee },
                            $push: {
                                'wallet.transactions': {
                                    _id:response._id,
                                    paymentType: "debit",
                                    amount: response.fee,
                                },
                            },
                        }
                        const user=await this.userRepository.findByIdAndUpdate(userId,updateUser)

                        return ({ success: true, booking: res.booking,payment:"wallet" })
                        
                    }

                    return ({ success: true, booking: res.booking,payment:"card" })
                }

            } else {
                return ({ success: false, message: "booking Not found" })
            }

        } catch (error) {

            return ({ success: false, status: 500, message: (error as Error).message, })

        }
    }


    async cancelBooking(id: string, status: string) {
        try {
            const booking = await this.bookingRepository.findById(id);

            if (!booking) {
                return { message: 'Booking not found', success: false };
            }

            const cancelledBooking = await this.bookingRepository.findByIdAndStatusUpdate(id, status);

            const updateData = { id: booking._id, bookingfee: booking.fee, type: "credit" }
            const updateWallet = await this.userRepository.findByIdAndUpdateWallet(booking.userId, updateData)

            if (!cancelledBooking || !updateWallet) {
                return ({ success: false })
            }


            return ({ success: true, cancelledBooking })

        } catch (error) {
            throw error
        }
    }


    async paymentHistory(id:string){
        try {
            
            const response=await this.bookingRepository.findByUserId(id)

            if(!response){
                return ({success:false})
            }
            const totalAmount = response.reduce((acc, booking) => acc + booking.fee, 0);

            const payment = response.filter(item => item.status === "booked" || item.status === "completed").sort((a:any, b:any) =>b-a);

            return ({success:true,payment,totalAmount})

        } catch (error) {
            throw error
        }
    }


    // Conversations---- && Message-----

    async getConversation(userId: string) {

        try {
            const response = await this.conversationRepository.getConversation(userId)

            if (response) {
                return ({ success: true, conversation: response })
            } else {
                return ({ success: false })
            }

        } catch (error) {

            throw error

        }

    }

    async sendMessage(conversationId: string, senderId: string, message: string) {
        try {
            const response = await this.conversationRepository.sendMessage(conversationId, senderId, message)

            if (response) {
                return ({ success: true, messsage: 'Send message successfully' })
            } else {
                return ({ success: false })
            }

        } catch (error) {

            throw error
        }
    }

    async getMessages(conversationId: string) {
        try {
            const messages = await this.conversationRepository.getMessages(conversationId)

            if (messages) {
                return ({ messages, success: true })
            } else {
                return ({ success: false })
            }

        } catch (error) {
            throw error
        }
    }



}




export default UserUsecase