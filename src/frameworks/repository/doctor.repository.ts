import userModel from "../models/user.model";
import bookingModel from "../models/booking.model";
import mongoose, { ObjectId } from "mongoose";

class DoctorRepository{





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
            console.log("There is an existing booking within an hour. Cannot create a new booking.");
            return;  
        }
    
        const doctorId = new mongoose.Types.ObjectId(id);
        const timeSchedules = {
            doctorId,
            status: "pending",
            date: dateObject,
            time: timeObject,
            end:new Date(timeObject.getTime() + 60 * 60 * 1000),
            fee: 500
        };
    
    
    
        const response = await bookingModel.create([timeSchedules], { new: true });

    }
    
    
}

export default DoctorRepository