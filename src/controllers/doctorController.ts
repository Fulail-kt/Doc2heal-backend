import { Request, Response } from 'express';
import DoctorUseCase from "../useCases/doctorUseCase";
// import UserRepository from "../frameworks/repository/user.repository";

class DoctorController {
    private doctorUsecase: DoctorUseCase;
    // private userRepository: UserRepository;

    constructor(doctorUsecase: DoctorUseCase,) {
        this.doctorUsecase = doctorUsecase;
        // this.userRepository = new UserRepository ;
    }

    async saveTimeSlot(req: Request, res: Response) {

        try {
            
            const {date,time}=req.body

        if(date && time ){

            let value={
                date,
                time
            }
            
            let userId = (req as any)?.user.id

            const response = await this.doctorUsecase.timeSlot(value,userId)

         return  res.status(200).json({message:response.message})
            
        }else{

         return  res.status(400).json({message:'invalid request'})
        }
        } catch (error) {
            return  res.status(500).json({message:(error as Error).message})

        }
   
    }


  async  Bookings(req:Request,res:Response){

    try {

        let Id = (req as any)?.user.id
        let condition:any;
        

        const response=await this.doctorUsecase.Bookings(Id)


        if(!response.success){
            return res.status(400).json({message:response.message,success:false})
        }
        
        return res.status(200).json({message:response.message,success:true,booking:response?.upcomming})
    } catch (error) {
        return res.status(400).json({message:(error as Error).message})
       

    }
  }

  async BookingStatusUpdate(req:Request,res:Response){
    try {

        const {bookingId,status}=req.body

        if(!bookingId || !status){
            return res.status(400).json({message:"some error occured"})
        }

        const response= await this.doctorUsecase.BookingStatus(bookingId,status)

        if(response){
            return ({message:"Booking successfully cancelled",success:true})
        }
        
    } catch (error) {
        res.status(500).json({message:"some error occured while cancelling",success:false})
    }
  }


  async getDoctor(req:Request,res:Response){
    try {
        let doctorId:any = req.query.id

        const doctor=await this.doctorUsecase.getDoctor(doctorId)
               
        if (!doctor.success) {
            return res.status(400).json({ success: false, message: doctor.message });
          }

          return res.status(200).json({success:true,doctor})
    } catch (error) {
        
    }
  }
}

export default DoctorController;
