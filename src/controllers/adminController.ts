import { Request, Response } from "express";
import adminUseCase from '../useCases/adminUseCase'

class adminController {

    private adminuseCase: adminUseCase

    constructor(adminuseCase: adminUseCase) {
        this.adminuseCase = adminuseCase
    }




    async blockUser(req: Request, res: Response) {

        try {

            const userId = req?.params.id

            const response = await this.adminuseCase.blockUser(userId)

            res.status(response?.status).json(response?.user)


        } catch (error) {

            res.status(500).json({ message: "an error occured" })
        }
    }

    async approveUser(req: Request, res: Response) {

        try {

            const userId = req?.params.id

            const response = await this.adminuseCase.approveUser(userId)

            res.status(response?.status).json(response?.user)


        } catch (error) {

            console.error((error as Error).message);

            res.status(500).json({ messge: 'an error occured' })
        }
    }


    async updateVerification(req: Request, res: Response) {

        const { userId, status } = req.body

        try {
            const response = await this.adminuseCase.applicationStatus(userId, status)
            if (response.success) {
                return res.status(200).json({ message: "updated Successfully", updateUser: response?.updatedUser })
            } else {
                return res.status(400).json({ success: false, message: "updating failed" })
            }
        } catch (error) {
            res.status(500).json({ messge: 'an error occured' })
        }
    }

    async totalEarnings(req: Request, res: Response) {
        try {

            const earnings = await this.adminuseCase.totalEarnings()

            if (!earnings.success) {
                return res.status(400).json({ message: "some error occured " })
            }
            return res.status(200).json(earnings.totalEarnings)

        } catch (error) {
            res.status(500).json({ messge: 'an error occured' })

        }
    }

    async paymentRequests(req:Request,res:Response){
        try {
            const status:any = req.query.status
            const response=await this.adminuseCase.paymentRequests(status)
            if(!response.success){
                return res.status(200).json({success:false,message:response.message})
            }
            return res.status(200).json({success:true,message:response.message,payment:response?.payment})
        } catch (error) {
            res.status(500).json({ messge: 'an error occured' })
        }
    }

    async updatePayment(req:Request,res:Response){
        try {
            const {id,status}=req.body

            const response=await this.adminuseCase.updatePayment(id,status)
            if(!response.success){
                return res.status(200).json({success:false,message:response.message})
            }
            return res.status(200).json({success:true,message:response.message,payment:response?.payment})
        } catch (error) {
            res.status(500).json({ messge: 'an error occured' })
        }
    }



}

export default adminController