import { Request, Response } from "express";
import UserUsecase from "../useCases/userUseCase";
import UserRepository from "../frameworks/repository/user.repository";
import User from "../entities/user";
import { ObjectId } from "mongoose";
import GenerateOtp from "../frameworks/utils/generateOtp";
import SendMail from "../frameworks/utils/sendMail";
import OtpRepository from "../frameworks/repository/otp.repository";
import Otp from "../entities/otp"



class UserController {
    private userUsercase: UserUsecase
    private userRepository: UserRepository
    private generateOtp: GenerateOtp
    private sendMail: SendMail
    private otpRepository:OtpRepository

    constructor(userUsercase: UserUsecase,) {
        this.userUsercase = userUsercase;
        this.userRepository = new UserRepository;
        this.otpRepository= new OtpRepository
        this.generateOtp = new GenerateOtp()
        this.sendMail = new SendMail()
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
            let { username, email, password, phone } = req.body

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

            if (existResponse.success) {

                // if(!existResponse.user?.isVerified){

                //   return  res.status(200).json({message:'Email is already exist',success:false})

                // }

                return res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
            }

            let user: User = {
                username,
                email,
                password,
                phone,
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

            console.log('login')

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


            if (user.success && user.isApproved==false ) {
                console.log(user.message)
                return res.status(200).json({
                    success:true,
                    message: user.message,
                    user:user.storedUser,
                    token:user.token
                })
            }
            if (!user.success) {
                console.log(user.message)
                return res.status(400).json({
                    message: user.message
                })
            }

            

            if(user.user?.isVerified==false){

                let Otp = await this.generateOtp.generateOtp(4);
                let username=user.user?.username
               

            const sendOtp = await this.sendMail.sendMail(username, email, Otp)

            let otpDetails: Otp = {
                // userId:new mongoose.Types.ObjectId(response.user?._id) as Types.ObjectId,
                userMail:user.user?.email,
                otp:Otp,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
            const saveOtp = await this.otpRepository.SaveOtp(otpDetails)


       

              return  res.status(200).json({
                    success: false,
                    message: "Please verify your account",
                    // user:user?.user,
                    isVerified:false,
                    email:user?.user?.email
                });
    
            }

            console.log(user.message,"msg")

            res.status(200).json({
                success: true,
                message: "login successful",
                user:user?.user,
                isVerified:true,
                token:user?.token
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

            let id = req.params.id

            const { username, email, password, phone } = req.body;

            let updatedUser: User = {
                username,
                email,
                phone,
                password
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

            console.log(req.body);

            code = parseInt(code)


            const otp = await this.userUsercase.verifyOtp(email, code, id)


            if (!otp.success) {
                return res.json({ success: false, message: 'an error occured try again' })
            }

            return res.json({ success: true, message: 'otp verified' })



        } catch (error: any) {

            return res.json({ success: false, message: error.message })
        }
    }

   

    async getAllusers(req: Request, res: Response) {
      try {
        // Explicitly handle different types and convert to string
        
        let user:string|any=req.query.user;
        const response = await this.userUsercase.findAllUser(user);
    
        if (!response.success) {
          return res.status(400).json({ success: false, message: response.message });
        }
    
        return res.status(200).json({ success: true, message: response.message, user: response.data });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }
    }


    async getUser(req:Request,res:Response){
        try {

            // console.log(req.user);
            let userId = (req as any)?.user.id

            const currentUser=await this.userUsercase.getuser(userId)
            
            if (!currentUser.success) {
                return res.status(400).json({ success: false, message: currentUser.message });
              }

              console.log(currentUser,"44444444444444444");
              
          
              return res.status(200).json({ success: true, message: currentUser.message,user:currentUser.user });
            } catch (error: any) {
              return res.status(500).json({ success: false, message: error.message });
        }
    }
    
    



}



export default UserController