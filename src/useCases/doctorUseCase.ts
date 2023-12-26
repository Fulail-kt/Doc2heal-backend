import UserRepository from "../frameworks/repository/user.repository"
import DoctorRepository from "../frameworks/repository/doctor.repository"
import mongoose, { ObjectId } from "mongoose"
import BookingRepository from "../frameworks/repository/booking.repository"
import userModel from "../frameworks/models/user.model"


class DoctorUseCase {

    private userRepository: UserRepository

    private doctorRepository: DoctorRepository

    private bookingRepository: BookingRepository


    constructor(userRepository: UserRepository, bookingRepository: BookingRepository) {

        this.userRepository = userRepository
        this.bookingRepository = bookingRepository
        this.doctorRepository = new DoctorRepository()

    }



    async timeSlot(value: { date: string; time: string }, id: string) {


        try {

            const response = await this.doctorRepository.findByIdAndUpdateTime(value, id);

            if (!response?.success) {
                return ({ message: response?.message })
            }


            return ({ message: response?.message })



        } catch (error) {

            throw error

        }
    }


    async Bookings(Id: string) {
        try {
            const upcomming = await this.bookingRepository.findByDoctorId(Id)

            if (upcomming) {
                return {
                    upcomming,
                    message: 'successfully retrived',
                    success: true
                }
            } else {
                return {
                    message: 'an error occured',
                    success: false
                }
            }
        } catch (error) {
            throw error
        }
    }

    async BookingStatus(id: string, status: string) {
        try {
            const booking = await this.bookingRepository.findById(id);

            if (!booking) {
                return { message: 'Booking not found', success: false };
            }

            const cancelledBooking = await this.bookingRepository.findByIdAndStatusUpdate(id, status);

            if (!cancelledBooking) {
                return { message: 'Error occurred while cancelling', success: false };
            }

            if (status === 'cancelled') {


                const user = await this.userRepository.findById(booking.userId);

                if (!user) {
                    return { message: 'User not found', success: false };
                }


                const updateData = { bookingfee: booking.fee, type: "credit" }

                const updatedUser = await this.userRepository.findByIdAndUpdateWallet(user._id, updateData);

                if (!updatedUser) {
                    return { message: 'Error updating user wallet', success: false };
                }


            }

            return { message: 'Booking cancelled successfully', success: true };
        } catch (error) {
            console.error('Error in BookingStatus:', error);
            throw error;
        }
    }

    async getDoctor(doctorId:string|ObjectId) {
        try {
            const doctor = await this.doctorRepository.findById(doctorId)
            if (!doctor) {
                return {
                    success: false,
                    message: 'an error occured while retrived doctor'
                }
            }

            return {
                success: true,
                doctor,
                message: 'Retrived the doctor'
            }
        } catch (error: any) {
            return {
                success: false,
                message: '(an error occured from database)' + error.message
            }
        }
    }




}

export default DoctorUseCase