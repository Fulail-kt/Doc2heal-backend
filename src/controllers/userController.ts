import { Request, Response, response } from "express";
import UserUsecase from "../useCases/userUseCase";
import UserRepository from "../frameworks/repository/user.repository";
import User from "../entities/user";
import { ObjectId } from "mongoose";

class UserController{
    private userUsercase: UserUsecase
    private userRepository:UserRepository

    constructor(userUsercase: UserUsecase,){
        this.userUsercase = userUsercase;
        this.userRepository= new UserRepository;
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
            let { username, email, password, phone } = req.body.data;

            console.log(req.body);
            

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
                return res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
            }

            let user:User={
                username,
                email,
                password,
                phone,
            }
            const response = await this.userUsercase.register(user)

            
            res.status(response.status).json(response)
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "server error"
            })
        }
    }



    async login(req:Request,res:Response){
        try {
            
            let {email,password}=req.body

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
   
            const user=await this.userUsercase.login({email,password})
            
          
            
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return
              }
           

              if(user.user?.isBlocked){
                return res.status(400).json({
                    message:'admin blocked',
                    data:user,
                })
              }

              if(user.user?.role=="doctor"){
               return res.status(200).json({
                    success: true,
                    message: "login successful",
                    user,
                  });
              }

              if(!user.success){
                return res.status(400).json({
                    message:user.message
                })
              }


          console.log(user,"for token");
          

              res.status(200).json({
                success: true,
                message: "login successful",
                user,
              });
            

        } catch (error) {
            console.error(error);
           res.status(500).json({
            success:'false',message:'error occured try again'
           })
        }
    }


    async updateUser(req:Request,res:Response){

        try {

            let id=req.params.id

            const { username, email,password, phone } = req.body;

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
}



export default UserController