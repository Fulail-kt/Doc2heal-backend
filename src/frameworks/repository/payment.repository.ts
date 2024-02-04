import mongoose, { ObjectId } from "mongoose"
import paymentModal from "../models/paymentRequest"

class PaymentRepository{


    async create(id:string,update:any){
        try {
            const data = {
                doctorId: new mongoose.Types.ObjectId(id),
                bankDetails: {
                    AcNumber: update.bankdetails.AcNumber,
                    Repeataccount: update.bankdetails.Repeataccount,
                    ifsce: update.bankdetails.ifsce,
                    accountHolder: update.bankdetails.accountHolder,
                },
                walletAmount:update.wallet
            };
            const payment= await paymentModal.create(data)
            if(payment){
                return payment
            }else{
                null
            }     
        } catch (error) {
            throw error
        }
    }

    async find(status:string){
        try {
            const response=await paymentModal.find({status:status}).populate('doctorId');
            if(response){
                return response
            }else{
                return null
            }
        } catch (error) {
            throw error
        }
    }
    
    async findByIdAndUpdate(id:string,updateData:{}){
        try {
            const response = await paymentModal.findByIdAndUpdate(id, updateData, { new: true });
            if(response){
                return response
            }else{
                return null
            }
        } catch (error) {
            throw error
        }
    }

}

export default PaymentRepository