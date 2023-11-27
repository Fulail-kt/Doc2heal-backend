import mongoose from "mongoose";
import User from "../../entities/user"
import userModel from "../models/user.model"

class UserRepository{
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

        console.log(updatedUser,"---");
        

        if (updatedUser.timeTolive === 0 || updatedUser.timeTolive === '0') {
            let Id=new mongoose.Types.ObjectId(id)
           let user=await userModel.findById(Id)

           console.log(user,"p");
           
            
           if (user) {
            // Remove timeTolive field
            console.log(user,"000000000000000000000000");
            user.timeTolive = new Date();
            await user.save();
            console.log(user,"000000000000000000000000");
          
            // Save the updated user document
            // await user.save();

            return {
                success: true,
                message: "User updated successfully",
                updatedUser: user.toObject(),
            };

          }else{

            return {
                success: false,
                message: "User not found or not updated",
            };
          }
        }

        console.log("infind by and update---");
        
       
        const updatedUserDocument = await userModel.findByIdAndUpdate(id, updatedUser, { new: true });

        console.log(updatedUserDocument,"ddddddddd");
        

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
}

export default UserRepository