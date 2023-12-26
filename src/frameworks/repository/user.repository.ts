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

    async findByEmail(email:string){
        try {
            const user=await userModel.findOne({email:email})

            console.log(user,"resposit");
            
            if(user){
                return user
                
            }else {
                return null
                
              }
        } catch (error) {
           throw error
        }
    }


   async findByIdAndUpdate(id:string|ObjectId|any,updatedUser:any){
    try {

        
        console.log("hait t");
        console.log(updatedUser,"du");
        
        
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


  async otpSuccess(email:string){

    try {

        const response = await userModel.findOne({email})

        
        if(response){

        
          
            response.timeTolive = undefined;
            response.isVerified = true;
            await response.save();

            return {success:true}

        }else{

            return {success:false}
        }


        
    } catch (error) {
        
    }
  }


 async findAll(){
    try {
        const USER=await userModel.find()
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



 async saveDocuments(id:string,doc:[string]){

    try {
        
     const user=await this.findById(id)

     if(!user){
        return {sucess:false,message:'user not found'}
     }

     if(user){

         let save =doc.map((url:string)=>{
             user.documents?.push(url)
         })
     }

       
       user.formStatus="submited"
        

        await user.save();
    } catch (error) {
        
    }
}

async findByIdAndUpdateWallet(id: string | ObjectId | any, updateData: {bookingfee:number,type:string}) {
    try {

        const options = { new: true };
       
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                $inc: { 'wallet.balance': updateData.bookingfee },
                $push: {
                    'wallet.transactions': {
                        paymentType: updateData.type,
                        amount: updateData.bookingfee,
                    },
                },
            },
            { new: true } 
        );

        if (updatedUser) {
            return updatedUser;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}





}



export default UserRepository