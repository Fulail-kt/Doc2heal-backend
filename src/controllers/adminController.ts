import { Request, Response } from "express";
import adminUseCase from '../useCases/adminUseCase'

class adminController{

    private adminuseCase:adminUseCase


    constructor(adminuseCase:adminUseCase){
        this.adminuseCase=adminuseCase
    }




   async BlockUser(req:Request,res:Response){

    try {

        const userId=req?.params.id

        const response=await this.adminuseCase.blockUser(userId)

        res.status(response?.status).json(response?.user)
        
        
    } catch (error:any) {
        
        console.log(error.message);
        
        res.status(500).json({messge:'an error occured'})
    }
    }

    async ApproveUser(req:Request,res:Response){

        try {
    
            const userId=req?.params.id
    
            const response=await this.adminuseCase.approveUser(userId)
    
            res.status(response?.status).json(response?.user)
            
            
        } catch (error:any) {
            
            console.log(error.message);
            
            res.status(500).json({messge:'an error occured'})
        }
        }


}

export default adminController