import mongoose, { ObjectId } from "mongoose";
import bookingModel from "../models/booking.model";
import moment from "moment";



class BookingRepository{


    async  findById(Id:string|ObjectId|any) {
        try {
            if (Id) {
                if (!mongoose.Types.ObjectId.isValid(Id)) {
                    Id = new mongoose.Types.ObjectId(Id);
                }
            }
            const booking = await bookingModel.findById(Id);
    
            if (booking) {
                
                return booking;
            } else {
                return null
               
            }
        } catch (error) {
            console.error('Error finding booking:', (error as Error).message);
        
        }

    }

    async findByDoctorIdfilter(doctorId:any,date:string) {
        try {
            let convertedDoctorId = doctorId;
    
            if (doctorId) {
                if (!mongoose.Types.ObjectId.isValid(doctorId)) {
                    convertedDoctorId = new mongoose.Types.ObjectId(doctorId);
                }
            } else {
                // Handle the case where doctorId is not provided
                throw new Error('Doctor ID is required');
            }

            const bookings = await bookingModel.find({
                doctorId: doctorId,
                date: {
                  $gte: moment(date).startOf('day').toDate(),
                  $lt: moment(date).endOf('day').toDate(),
                },
              });

            // const bookings = await bookingModel.find({ doctorId: convertedDoctorId });
    
            if (bookings ) {  
                return bookings;
            } 
        } catch (error) {
            console.error('Error finding bookings:', (error as Error).message);
       
            throw error;
        }
    }

    async findByDoctorId(doctorId:any) {
        try {
            let convertedDoctorId = doctorId;
    
            if (doctorId) {
                if (!mongoose.Types.ObjectId.isValid(doctorId)) {
                    convertedDoctorId = new mongoose.Types.ObjectId(doctorId);
                }
            } else {
                // Handle the case where doctorId is not provided
                throw new Error('Doctor ID is required');
            }
    
            const bookings = await bookingModel.find({ doctorId: convertedDoctorId });
    
          
            if (bookings ) {              
                return bookings;
            } 
        } catch (error) {
            console.error('Error finding bookings:', (error as Error).message);
       
            throw error;
        }
    }

    async findByUserId(userId:string|ObjectId|any){

        try{
        let convertedUserId:any = userId;
    
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                convertedUserId = new mongoose.Types.ObjectId(userId);
            }
        } else {

            throw new Error('User ID is required');
        }
        // const bookings = await bookingModel.find({ userId: convertedUserId });

        const bookings = await bookingModel.find({ userId: convertedUserId }).populate('doctorId');

        if (bookings ) {       
          return bookings;
        } 
    } catch (error) {
        console.error('Error finding bookings:', (error as Error).message);
        throw error;
    }
    }

    async findByIdAndUpdate(userId: string|any, bookingData: { username?: string, age?: number, note?: string, bkId?: string,status?:string,prescription?:string }) {
        try {
            let bookingId = new mongoose.Types.ObjectId(bookingData.bkId);

            const updateData = {
                status: bookingData.status,
                note: bookingData.note,
                userAge: bookingData.age,
                userName: bookingData.username,
                userId: new mongoose.Types.ObjectId(userId),
                prescription:bookingData.prescription
            };
    
            const updatedBooking = await bookingModel.findByIdAndUpdate(bookingId, updateData, { new: true });
    
           return({booking:updatedBooking,success:true})
    
           
        } catch (error) {
            console.error('Error updating booking:', (error as Error).message);
           
        }
    }


    async findByIdAndStatusUpdate(id:string|ObjectId|any,status:any){
        try {

            if (id) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    id = new mongoose.Types.ObjectId(id);
                }
            }

            const updated=await bookingModel.findByIdAndUpdate(id, { status: status },{ new: true } )

            if(updated){
                return updated
            }else{
                return null
            }
        } catch (error) {
            throw error
        }
    }

    async findByIdAndDelete(bookingId:string){
        try {
            const booking=await bookingModel.findByIdAndDelete(bookingId)
            if(booking){
                return booking
            }else{
                return null
            }
        } catch (error) {
            throw error
        }
    }

    async findAll(){
        try {
            const allBookings=await bookingModel.find()
            if(!allBookings){
                return null
            }
            return allBookings
        } catch (error) {
            throw error
        }
    }



}

export default BookingRepository