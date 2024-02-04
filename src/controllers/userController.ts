import {Response,Request} from "express"
import UserUsecase from "../useCases/userUseCase";
import UserRepository from "../frameworks/repository/user.repository";
import User from "../entities/user";
import GenerateOtp from "../frameworks/utils/generateOtp";
import SendMail from "../frameworks/utils/sendMail";
import OtpRepository from "../frameworks/repository/otp.repository";
import Otp from "../entities/otp"
import CloudinaryUpload from "../frameworks/utils/cloudinaryUpload";
import stripe from 'stripe';
import fs from "fs";


const stripeInstance = new stripe("sk_test_51OLmR8SJmqVejvmLolrT1nzPZYm8AwHYl4nkIX1ekPt53r0rqCppRMq0D78KxcvkhW7VWh2baX73WxWklaNrGGHL00pzsghBVk");


export interface CustomRequest extends Request {
    file: any; 
  }

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

class UserController {
    private userUsercase: UserUsecase
    private userRepository: UserRepository
    private generateOtp: GenerateOtp
    private sendMail: SendMail
    private otpRepository: OtpRepository
    private cloudinaryUpload: CloudinaryUpload;

    constructor(userUsercase: UserUsecase,) {
        this.userUsercase = userUsercase;
        this.userRepository = new UserRepository;
        this.otpRepository = new OtpRepository
        this.generateOtp = new GenerateOtp()
        this.sendMail = new SendMail()
        this.cloudinaryUpload = new CloudinaryUpload
    }


    // Validation function for email using regex
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validation function for phone number using regex and minimum length
    private isValidPhoneNumber(phone: string): boolean {
        const phoneRegex = /^\d{10}$/; // Adjust the regex based on your requirements
        return phoneRegex.test(phone);
    }

    // Validation function for password minimum length
    private isValidPassword(password: string): boolean {
        return password.length >= 6; // Adjust the minimum length based on your requirements
    }

    async register(req: Request, res: Response) {
        try {

            let { username, email, password, phone, gender } = req.body

            username = username.trim();
            email = email.trim();
            password = password.trim();
            phone = phone.trim();

            if (!username || !email || !password || !phone) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }


            // Validate email
            if (!this.isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                });
            }

            // Validate phone number
            if (!this.isValidPhoneNumber(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number",
                });
            }

            // Validate password
            if (!this.isValidPassword(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long",
                });
            }

            const existResponse = await this.userRepository.findByEmail(email);

            if (existResponse) {

                return res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
            }

            const user: User = {
                username,
                email,
                password,
                phone,
                gender,
            }

            const Otp = await this.generateOtp.generateOtp(4);

            const sendOtp = await this.sendMail.sendMail(username, email, Otp)


            if (!sendOtp.success) {

                return res.json({
                    sendOtp
                })

            }

            const response = await this.userUsercase.register(user, Otp)

            if (!response?.success) {
                return res.status(500).json(response)
            }


            res.status(response?.status).json(response)

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "server error"
            })
        }
    }



    async login(req: Request, res: Response) {
        try {

            let { email, password } = req.body
            
            email = email.trim();
            password = password.trim();

            if (!this.isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                });
            }
            
            if (!this.isValidPassword(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long",
                });
            }
            
            const user = await this.userUsercase.login({ email, password })
          

            if (!user) {
                res.status(200).json({ message: 'Invalid credentials' });
                return
            }


            if (user.success && user.isApproved == false) {

                res.cookie("refresh", user?.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Set to true in production
                    sameSite: 'strict', // Adjust as needed
                  });
              
                return res.status(200).json({
                    success: true,
                    message: user.message,
                    user: user?.storedUser,
                    token: user?.accessToken,
                    refresh: user?.refreshToken
                })
            }
            if (!user.success) {
                return res.status(400).json({
                    message: user.message
                })
            }

            if (user.user?.isVerified == false) {

                const Otp = await this.generateOtp.generateOtp(4);
                const username = user.user?.username

                const sendOtp = await this.sendMail.sendMail(username, email, Otp)

                const otpDetails: Otp = {
                    // userId:new mongoose.Types.ObjectId(response.user?._id) as Types.ObjectId,
                    userMail: user.user?.email,
                    otp: Otp,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                    createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
                const saveOtp = await this.otpRepository.SaveOtp(otpDetails)


                return res.status(200).json({
                    success: false,
                    message: "Please verify your account",
                    // user:user?.user,
                    isVerified: false,
                    email: user?.user?.email,
                    username:user?.user?.username
                });

            }


            res.cookie("refresh", user?.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict', // Adjust as needed
              });
            // res.cookie("refresh",user?.refreshToken)
            res.status(200).json({
                success: true,
                message: "login successful",
                user: user?.user,
                isVerified: true,
                token: user?.accessToken,
                refresh: user?.refreshToken
            });


        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: 'false', message: 'error occured try again'
            })
        }
    }


    async updateUser(req: Request, res: Response) {

        try {

            const id = req.params.id
            const { username, email, password, phone, gender } = req.body;
            
            const updatedUser: User = {
                username,
                email,
                phone,
                password,
                gender
            };

            const response = await this.userUsercase.updateUser(id, updatedUser);

            if (response.success) {
                return res.status(200).json({
                    success: true,
                    message: "User updated successfully",
                    updatedUser: response?.updatedUser,
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "User not found or not updated",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error. Please try again later.",
            });
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            let { code, email, id } = req.body
            code = parseInt(code)
            if(!code||!email){
                return res.status(200).json({ success: false, message: 'Invalid Otp or Email, please try again' })
            }
            
            const otp = await this.userUsercase.verifyOtp(email, code, id)
           
            if (!otp.success) {
                return res.json({ success: false, message: 'an error occured try again' })
            }

            return res.json({ success: true, message: 'otp verified' })

        } catch (error) {

            return res.json({ success: false, message: (error as Error).message })
        }
    }

    async resendOtp(req:Request,res:Response){
        try {
            const Otp = await this.generateOtp.generateOtp(4);
            
           const {email,username}=req.body

            const sendOtp = await this.sendMail.sendMail(username, email, Otp)

            const otpDetails: Otp = {
                // userId:new mongoose.Types.ObjectId(response.user?._id) as Types.ObjectId,
                userMail: email,
                otp: Otp,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
            const saveOtp = await this.otpRepository.SaveOtp(otpDetails)


            return res.status(200).json({
                success: true,
                message: "OTP send successfully",
                // user:user?.user,
                isVerified: false,
                email: email
            });

        
        } catch (error) {
            
        }
    }



    async getAllusers(req: Request, res: Response) {
        try {

            const user: string | any = req.query.user;
            const response = await this.userUsercase.findAllUser();

            if (!response.success) {
                return res.status(400).json({ success: false, message: response.message });
            }

            return res.status(200).json({ success: true, message: response.message, user: response.data });
        } catch (error) {
            return res.status(500).json({ success: false, message: (error as Error).message });
        }
    }


    async getUser(req: Request, res: Response) {
        try {

            const userId = req.query.id

            if (typeof userId === 'string') {

                const currentUser = await this.userUsercase.getuser(userId)

                if (!currentUser.success) {
                    return res.status(400).json({ success: false, message: currentUser.message });
                }

                return res.status(200).json({ success: true, message: currentUser.message, user: currentUser.user });
            } else {

            }
        } catch (error) {
            return res.status(500).json({ success: false, message: (error as Error).message });
        }
    }


    async doctorRegister(req: Request, res: Response) {

        try {
            const Id = (req as any)?.user.id

            const {
                email,
                phone,
                address,
                specialization,
                hospital,
                experience,
                fee
            } = req.body;

            const newUser = {
                email,
                phone,
                address,
                specialization,
                hospital,
                experience,
                fee,
            }

            const response = await this.userUsercase.updateUser(Id, newUser)

            if (response.success) {
                return res.status(200).json({
                    success: true,
                    message: "User updated successfully",
                    user: response?.updatedUser,
                });

            } else {
                return res.status(404).json({
                    success: false,
                    message: "User not found or not updated",
                });
            }
        } catch (error) {
            console.error((error as Error));
            return res.status(500).json({
                success: false,
                message: "Internal server error. Please try again later.",
            });
        }
    }


    async saveDocuments(req: CustomRequest, res: Response) {
        try {
          const Id = (req as any)?.user.id;
      
          if (req?.file) {
            const documents = req.file as any;
            let docs: any[] = [];
            if (documents && documents.length > 0) {
              const documentPaths = await Promise.all(documents.map(async (document: { path: string; }) => {
                const doc = await this.cloudinaryUpload.upload(document.path, "Doctor-documents");
                return doc.secure_url;
              }));
              docs.push(...documentPaths);
      
              const submitDocuments = await this.userUsercase.saveDocuments(Id, docs);
              res.status(200).json({ success: true, message: 'Documents submitted successfully', docs });
            }
          } else {
            res.status(400).json({ success: false, message: 'No documents found in the request' });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
      }
      
      async editProfile(req: CustomRequest, res: Response) {
        try {
          if (req?.file) {
            const Id = (req as any)?.user.id;
            let url = '';
            const img = await this.cloudinaryUpload.upload(
              req.file.path,
              "Patient-profile"
            );
      
            url = img.secure_url;
      
            const updateImg = await this.userUsercase.updateProfile(url, Id);
      
            if (req?.file) {
              fs.unlink(req.file.path, (err) => {
                if (err) {
                  console.error("Error while unlinking:", err);
                } else {
                  console.log("File has been deleted successfully");
                }
              });
            } else {
              console.error("No file to delete");
            }
            if (updateImg) {
              return res.status(200).json({ success: true, message: 'profile updated', user: updateImg });
            }
          } else {
            res.status(401).json({ success: false, message: 'some error occurred' });
          }
        } catch (error) {
          res.json({ success: false, message: (error as Error).message });
        }
      }


    async getBookings(req: Request, res: Response) {
        try {
            if (req.query) {
                let Id: string | any = req.query.id;

                let date:string | any =req.query.selected

                
                if (Id) {

                    const response = await this.userUsercase.getbookings(Id,date)
                    
                    if (response) {
                        return res.status(200).json({ success: true, bookings: response?.bookings })
                    }
                }

            }

        } catch (error) {
            res.status(500).json({ message: (error as Error) })
        }
    }


    async bookingPayment(req: Request, res: Response) {

        try {
            const { amount } = req.body;

            if (!amount) {
                return res.status(400).json({ success: false, message: 'Amount is invalid' })
            }


            const paymentIntent = await stripeInstance.paymentIntents.create({
                amount: amount * 100,
                currency: 'inr',
                description: 'Appointment Booking',
                payment_method_types: ['card'],
            });

            res.json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }

    }



    async saveBooking(req: Request, res: Response) {
        try {
            const Id = (req as any)?.user.id
            const bookingId = req.body.selectedBookingId
            const bookingData = req.body.bookingData
            const useWallet = req.body.useWallet
            bookingData.bkId = bookingId;
            bookingData.status="booked"
            const response = await this.userUsercase.saveBooking(Id, bookingData,useWallet)
            if (response?.success) {

                if(response.payment=="wallet"){
                    return res.status(200).json({ success: true, message: 'Appointment Scheduled', booking: response.booking,wallet:true })
                }
                return res.status(200).json({ success: true, message: 'Appointment Scheduled', booking: response.booking })
            }

        } catch (error) {
            return res.status(500).json({ success: true, message: (error as Error).message })
        }
    }

    async getAllBookings(req: Request, res: Response) {
        try {
            let Id = (req as any)?.user.id

            if (!Id) {
                return res.status(401).json({ message: 'unAuthorised' })
            }

            const bookings = await this.userUsercase.getAllbookings(Id)

            if (bookings?.success) {
                return res.status(200).json({ success: true, bookings: bookings?.bookings })
            }

        } catch (error) {
            return res.status(500).json({ success: true, message: (error as Error).message })
        }
    }

    async cancelBooking(req: Request, res: Response) {
        try {
            const { bookingId, status } = req.body
            if (!bookingId || !status) {
                return res.status(400).json({ message: "some error occured" })
            }
            const response = await this.userUsercase.cancelBooking(bookingId, status)
            if (response) {
                return ({ message: "Booking successfully cancelled", success: true })
            }
        } catch (error) {
            return res.status(500).json({ success: true, message: (error as Error).message })
        }
    }


    async paymentHistory(req:Request,res:Response){
        try {
            const id:any=req.query.id
            const response=await this.userUsercase.paymentHistory(id)
            if (!response.success) {
                return ({ message: "Error occured while getting Payment", success: false })
            }
            return  res.status(200).json({ message: "successfully retrived Payment", success: true,payment:response.payment,total:response.totalAmount })
        } catch (error) {
            return res.status(500).json({ success: true, message: (error as Error).message })      
        }
    }

}



export default UserController