import { Request, Response } from 'express';
import DoctorUseCase from "../useCases/doctorUseCase";
import UserRepository from "../frameworks/repository/user.repository";

class DoctorController {
    private doctorUsecase: DoctorUseCase;
    private userRepository: UserRepository;

    constructor(doctorUsecase: DoctorUseCase,) {
        this.doctorUsecase = doctorUsecase;
        this.userRepository = new UserRepository ;
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
        }else{

         return  res.status(400).json({message:'invalid request'})
        }
        } catch (error) {
            return  res.status(500).json({message:(error as Error).message})

        }
   
    }


  async  upcommingBookings(req:Request,res:Response){

    try {

        let Id = (req as any)?.user.id
        let condition:any;
        if(req.query){

            condition=req.query.condition
        }

        const response=await this.doctorUsecase.UpcommingBookings(Id,condition)


        if(!response.success){
            return res.status(400).json({message:response.message,success:false})
        }
        
        return res.status(200).json({message:response.message,success:true,booking:response?.upcomming})
    } catch (error) {
        return res.status(400).json({message:(error as Error).message})
       

    }
  }
}

export default DoctorController;
