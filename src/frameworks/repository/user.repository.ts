import mongoose, { ObjectId } from "mongoose";
import User from "../../entities/user"
import userModel from "../models/user.model"

class UserRepository {
    constructor(){}

    async create(user: User){
        try {
            console.log(user,"user");
            
            const response = await new userModel(user).save({ new: true }as any);

            console.log(response,"response");

            
            return {
                success: true,
                message: "user created",
                user:response

            }
        } catch (error) {
            return {
                 success : false,
                 message: "database error"
            }
        }
    }


    async findById(id:string|any) {

        console.log(id,"1212212");
        

        id=new mongoose.Types.ObjectId(id)

            const user = await userModel.findById(id);
            if (user) {
                
                return user;
            } else {
                return null;
            }
  
    }

    async findByEmail(email:String){
        try {
            const user=await userModel.findOne({email:email})

            if(user){
                return{
                    success:true,
                   user,
                   message:'user email found'
                }  
            }else {
                return {
                  success: false,
                  message: "user not found",
                };
              }
        } catch (error) {
            return {
                success: false,
                message: "database error",
              };
        }
    }


   async findByIdAndUpdate(id:string,updatedUser:any){
    try {

        // console.log(updatedUser,"ddddddddd");
        const updatedUserDocument = await userModel.findByIdAndUpdate(id, updatedUser, { new: true });

        console.log(updatedUserDocument,"-----------------------");
        

        if (updatedUserDocument) {
            return {
                success: true,
                message: "User updated successfully",
                updatedUser: updatedUserDocument.toObject(),
            };
        } else {
            return {
                success: false,
                message: "User not found or not updated",
            };
        }
    } catch (error:any) {
        console.error(error.message);
        return {
            success: false,
            message: "Internal server error. Please try again later.",
        };
    }
  }


 async findAll(user:string){
    try {
        const USER=await userModel.find({role:user})
        if(!USER){
            return{
                success:true,
                status:400,
                message:'doctors not found'
            }
        }
        return{
            success:true,
            status:200,
            data:USER,
            message:'all doctors retrived'

        }
        
    } catch (error:any) {
        return{
            success:false,
            status:500,
            message:error.message
        }
    }
 }
}

export default UserRepository