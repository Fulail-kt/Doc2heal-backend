import mongoose, { ObjectId } from "mongoose";
import bookingModel from "../models/booking.model";



class BookingRepository{


    async  findById(Id:string|ObjectId|any) {
        try {
            if (Id) {
                if (!mongoose.Types.ObjectId.isValid(Id)) {
                    Id = new mongoose.Types.ObjectId(Id);
                }
            }
            const booking = await bookingModel.findById(Id);
    
           console.log(booking);
           
            if (booking) {
                console.log('Booking found:', booking);
                
                return booking;
            } else {
                console.log('Booking not found');
               
            }
        } catch (error:any) {
            console.error('Error finding booking:', error.message);
        
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
                console.log('Bookings found:', bookings);
                
                return bookings;
            } 
        } catch (error:any) {
            console.error('Error finding bookings:', error.message);
       
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

        const bookings = await bookingModel.find({ userId: convertedUserId });

      
        if (bookings ) {
            console.log('Bookings found:', bookings);
            
            return bookings;
        } 
    } catch (error:any) {
        console.error('Error finding bookings:', error.message);
        throw error;
    }
    }

    async findByIdAndUpdate(userId: string, bookingData: { username: string, age: number, note: string, bkId: string }) {
        try {
            let bookingId = new mongoose.Types.ObjectId(bookingData.bkId);
    
            const updateData = {
                status: 'booked',
                note: bookingData.note,
                userAge: bookingData.age,
                userName: bookingData.username,
                userId: new mongoose.Types.ObjectId(userId)
            };
    
            const updatedBooking = await bookingModel.findByIdAndUpdate(bookingId, updateData, { new: true });
    
           return({booking:updateData,success:true})
    
           
        } catch (error:any) {
            console.error('Error updating booking:', error.message);
           
        }
    }


    async findByIdAndStatusUpdate(id:string|ObjectId|any,status:any){
        try {

            if (id) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    id = new mongoose.Types.ObjectId(id);
                }
            }

            console.log(status,"booking");
            
            
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



}

export default BookingRepository