import { Request, Response } from 'express';
import DoctorUseCase from "../useCases/doctorUseCase";
import mongoose from 'mongoose';
import bookingModel from '../frameworks/models/booking.model';
import userModel from '../frameworks/models/user.model';
import User from '../entities/user';
// import UserRepository from "../frameworks/repository/user.repository";



interface DoctorsResponse {
    doctors: User[];
    totalPages: number;
  }

class DoctorController {
    private doctorUsecase: DoctorUseCase;
    // private userRepository: UserRepository;

    constructor(doctorUsecase: DoctorUseCase,) {
        this.doctorUsecase = doctorUsecase;
        // this.userRepository = new UserRepository ;
    }

    async saveTimeSlot(req: Request, res: Response) {
        try {

            const { occurrences } = req.body
            const userId = (req as any)?.user.id

            const response = await this.doctorUsecase.timeSlot(occurrences, userId)

            if (!response.success) {
                
              return  res.status(200).json({ message: response.message })
            }
        
            return res.status(200).json({ message: response.message })

        } catch (error) {
            return res.status(500).json({ message: (error as Error).message })

        }

    }


    async Bookings(req: Request, res: Response) {

        try {

            const Id = (req as any)?.user.id
            
            const response = await this.doctorUsecase.Bookings(Id)


            if (!response.success) {
                return res.status(400).json({ message: response.message, success: false })
            }

            return res.status(200).json({ message: response.message, success: true, booking: response?.upcomming })
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message })


        }
    }

    async BookingStatusUpdate(req: Request, res: Response) {
        try {

            const { bookingId, status } = req.body

            if (!bookingId || !status) {
                return res.status(400).json({ message: "some error occured" })
            }

            const response = await this.doctorUsecase.BookingStatus(bookingId, status)

            if (response) {
                return ({ message: "Booking successfully updated", success: true })
            }

        } catch (error) {
            res.status(500).json({ message: "some error occured while updating status", success: false })
        }
    }


    async getDoctor(req: Request, res: Response) {
        try {
            const doctorId: any = req.query.id
            const doctor = await this.doctorUsecase.getDoctor(doctorId)

            if (!doctor.success) {
                return res.status(400).json({ success: false, message: doctor.message });
            }
            return res.status(200).json({ success: true, doctor })

        } catch (error) {
            res.status(500).json({ message: "some error occured while get Doctor", success: false })
        }
    }

    async updateBankingDetails(req: Request, res: Response) {
        try {
            const { acNumber, repeatAcNumber, ifscCode, accountHolder } = req.body
           const docId=req.params.id

            if (repeatAcNumber != acNumber) {
                return res.status(400).json({ message: 'Account number is not matching' })
            }

            const data = {
                acNumber, repeatAcNumber, ifscCode, accountHolder
            }
            const response = await this.doctorUsecase.updateBanking(docId, data)

            if (!response.success) {
                res.status(400).json({ message: response?.message })
            }

            res.status(200).json({ message: response?.message, bankDetails: response.updatedBanking })
        } catch (error) {
            res.status(500).json({ message: "some error occured" })
        }
    }

   async getBookings(req:Request,res:Response){
        try {
            
            const response = await this.doctorUsecase.getAllbookings()
            if (!response.success) {
                return res.status(400).json({ message: response.message, success: false })
            }

            return res.status(200).json({ message: response.message, success: true, booking: response?.allBookings })
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message })
        }
    }

    async deleteBooking(req:Request,res:Response){
        try {
            const bookingId:any=req.query.id


            if(!bookingId){
                return res.status(400).json({ message:"something went wrong", success: false })
                
            }
        
            const response=await this.doctorUsecase.deleteBookings(bookingId)

            if(!response.success){
                return res.status(400).json({ message: response.message, success: false })
            }
            return res.status(200).json({ message: response.message, success: true })
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message })
            
        }
    }

    async prescription(req:Request,res:Response){
        try {
            const {prescription,selected}=req.body

            const response=await this.doctorUsecase.prescription(selected,prescription)
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message })
        }
    }

    async getAlldoctors(req: Request, res: Response) {
        try {
            const { page = 1 } = req.query as { page?: number };
            const pageSize: number = 4;
    
            const totalDoctors = await userModel.countDocuments({
                role: 'doctor',
                isApproved: true,
            });
    
            const totalPages = Math.ceil(totalDoctors / pageSize);
    
            const doctors = await userModel
                .find({ role: 'doctor', isApproved: true })
                .skip((page - 1) * pageSize)
                .limit(Number(pageSize));
    
            res.status(200).json({
                success: true,
                message: 'Retrieved successfully',
                doctors,
                totalPages,
            });
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }
    
    
      async paymentRequest(req:Request,res:Response){
        try {
            const doctorId:any=req.query.id

            if(!doctorId){
               return res.status(200).json({message:"Your Id is null"})
            }
            const response=await this.doctorUsecase.paymentRequest(doctorId)

            if(!response.success){
                return res.status(200).json({success:false,message:response.message})
              }
            return res.status(200).json({success:true,message:response.message})
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
      }
}   


export default DoctorController;
