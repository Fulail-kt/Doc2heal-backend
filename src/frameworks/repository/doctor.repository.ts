import userModel from "../models/user.model";
import bookingModel from "../models/booking.model";
import mongoose, { ObjectId } from "mongoose";

class DoctorRepository{


    async findById( id: string | mongoose.Types.ObjectId|any){
        try {

            if (!mongoose.Types.ObjectId.isValid(id)) {
                id = new mongoose.Types.ObjectId(id);
            }
        
             const doctor= await userModel.findById(id)

             if(doctor){
                return doctor
             }else{
                return null
             }


        } catch (error) {
            
            throw error
        }
    }



    async findByIdAndUpdateTime(value: { date: string, time: string }, id: string | mongoose.Types.ObjectId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            id = new mongoose.Types.ObjectId(id);
        }
    
        const dateObject = new Date(value.date);
        const timeObject = new Date(`${value.date}T${value.time}:00Z`);
    
        // Checking if there's an existing booking within an hour

        const existingBookings = await bookingModel.find({
            doctorId: new mongoose.Types.ObjectId(id),
            status: { $in: ["pending", "booked"] },
            date: dateObject,
            time: {
                $gte: new Date(timeObject.getTime() - 60 * 60 * 1000), // 1 hour before
                $lte: new Date(timeObject.getTime() + 60 * 60 * 1000)  // 1 hour after
            }
        });
    
        if (existingBookings.length > 0) {
           
            return( {message:'There is an existing booking within an hour. Cannot create a new booking.',success:false})
        }

        const doctor= await this.findById(id)

       if(doctor){

        console.log(doctor,"doctotr save time");
        
        if(!doctor.fee){
            return ({message:'invalid amount add your fee'})
        }

           const doctorId = new mongoose.Types.ObjectId(id);
           const timeSchedules = {
               doctorId,
               status: "pending",
               date: dateObject,
               time: timeObject,
               end:new Date(timeObject.getTime() + 60 * 60 * 1000),
               fee: doctor?.fee
           };


           const createSlot = await bookingModel.create([timeSchedules], { new: true });

           if(createSlot){
               return({message:'Successfully created Timeslot',success:true})
           }
       }else{

        return ({message:'some error occured try after some time'})
       }

    }
    
    
}

export default DoctorRepository