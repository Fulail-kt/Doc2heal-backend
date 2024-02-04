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



    // async findByIdAndUpdateTime(occurrences: [{ start: string, end: string }], id: string | mongoose.Types.ObjectId) {
    //     if (!mongoose.Types.ObjectId.isValid(id)) {
    //       id = new mongoose.Types.ObjectId(id);
    //     }
    
    //     try {
       
    //       const doctor = await this.findById(id);
    //       if (!doctor) {
    //         throw new Error('Doctor not found.');
    //       }
    
    //       // Check if any of the specified timeslots already exist
    //       const existingTimeslots = await bookingModel.find({
    //         doctorId: id,
    //         time: { $in: occurrences.map(occurrence => new Date(occurrence.start)) },
    //       });
    
    //       if (existingTimeslots.length > 0) {
    //         // Handle the case where one or more timeslots already exist
    //         // throw new Error('One or more timeslots already exist for the specified period.');
    //         return null
    //       }
    
    
    //       const savedOccurrences = await Promise.all(
    //         occurrences.map(async (occurrence: { start: string, end: string }) => {
    //           const timeslot = new bookingModel({
    //             doctorId: new mongoose.Types.ObjectId(id),
    //             status: 'pending',
    //             date: new Date(occurrence.start),
    //             time: new Date(occurrence.start),
    //             end: new Date(occurrence.end),
    //             fee: doctor.fee,
    //           });
    
    //           return await timeslot.save();
    //         })
    //       );
    
    //       if(savedOccurrences){
    //           return savedOccurrences;

    //       }else{
    //         return null
    //       }
    //     } catch (error) {
    //       throw error;
    //     }
    //   }


    
    async findByIdAndUpdateTime(occurrences: [{ start: string, end: string }], id: string | mongoose.Types.ObjectId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          id = new mongoose.Types.ObjectId(id);
        }
      
        try {
          const doctor = await this.findById(id);
          if (!doctor) {
            throw new Error('Doctor not found.');
          }
      
          const bufferStartTime = new Date(occurrences[0].start);
          bufferStartTime.setHours(bufferStartTime.getHours() + 1);
      
          // Check if any existing schedules overlap with the new schedules (considering a one-hour buffer)
          const overlappingSchedules = await bookingModel.find({
            doctorId: id,
            $or: [
              {
                $and: [
                  { time: { $lt: bufferStartTime } },
                  { end: { $gt: new Date(occurrences[0].start) } },
                ],
              },
              {
                $and: [
                  { time: { $lt: new Date(occurrences[0].end) } },
                  { end: { $gt: bufferStartTime } },
                ],
              },
            ],
          });
      
          if (overlappingSchedules.length > 0) {
      
            return null;
          }
      
          const savedOccurrences = await Promise.all(
            occurrences.map(async (occurrence: { start: string, end: string }) => {
              const timeslot = new bookingModel({
                doctorId: new mongoose.Types.ObjectId(id),
                status: 'pending',
                date: new Date(occurrence.start),
                time: new Date(occurrence.start),
                end: new Date(occurrence.end),
                fee: doctor.fee,
              });
      
              return await timeslot.save();
            })
          );
      
          if (savedOccurrences) {
            return savedOccurrences;
          } else {
            return null;
          }
        } catch (error) {
          throw error;
        }
      }
      
    
}

export default DoctorRepository