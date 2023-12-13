import UserRepository from "../frameworks/repository/user.repository"
import DoctorRepository from "../frameworks/repository/doctor.repository"
import mongoose from "mongoose"
import BookingRepository from "../frameworks/repository/booking.repository"


class DoctorUseCase{

    private userRepository: UserRepository

    private doctorRepository:DoctorRepository

    private bookingRepository:BookingRepository


    constructor(userRepository:UserRepository,bookingRepository:BookingRepository){

        this.userRepository=userRepository
        this.bookingRepository=bookingRepository

        this.doctorRepository=new DoctorRepository()

    }



    async timeSlot(value: { date: string; time: string }, id: string) {
      
    
        try {
            // Convert the date and time strings to Date objects
        
    
            const response = await this.doctorRepository.findByIdAndUpdateTime(value,id);
    
            console.log(response, "from doctor uses");
        } catch (error:any) {
            console.log(error.message);
        }
    }


    async UpcommingBookings(Id:string,condition:string){
        try {
            const upcomming=await this.bookingRepository.findByDoctorIdWith(Id,condition)

            if(upcomming){
                return {
                    upcomming,
                    message:'successfully retrived',
                    success:true
                }
            }else{
                return {
                    message:'an error occured',
                    success:false
                }
            }
        } catch (error) {
            throw error
        }
    }
}

export default DoctorUseCase