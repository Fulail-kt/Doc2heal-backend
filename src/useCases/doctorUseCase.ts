import UserRepository from "../frameworks/repository/user.repository"
import DoctorRepository from "../frameworks/repository/doctor.repository"
import mongoose, { ObjectId } from "mongoose"
import BookingRepository from "../frameworks/repository/booking.repository"
import userModel from "../frameworks/models/user.model"
import PaymentRepository from "../frameworks/repository/payment.repository"


class DoctorUseCase {

    private userRepository: UserRepository

    private doctorRepository: DoctorRepository

    private bookingRepository: BookingRepository

    private paymentRepository: PaymentRepository


    constructor(userRepository: UserRepository, bookingRepository: BookingRepository, paymentRepository: PaymentRepository) {

        this.userRepository = userRepository
        this.bookingRepository = bookingRepository
        this.paymentRepository = paymentRepository
        this.doctorRepository = new DoctorRepository()

    }



    async timeSlot(occurrences: [{ start: string; end: string }], id: string) {
        try {

            const response = await this.doctorRepository.findByIdAndUpdateTime(occurrences, id);
            if (!response) {
                return ({ success: false, message: "Failed Creating Time Schedules may any of the time already existed" })
            }
            return ({ success: true, message: "Time Schedule created succcessfully" })

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
            const updateBooking = await this.bookingRepository.findByIdAndStatusUpdate(id, status);

            if (!updateBooking) {
                return { message: 'Error occurred while updating status', success: false };
            }

            if (status === 'cancelled') {

                const user = await this.userRepository.findById(booking.userId);

                if (!user) {
                    return { message: 'User not found', success: false };
                }

                const updateData = { bookingfee: booking.fee, type: "credit", id: booking._id }

                const updatedUser = await this.userRepository.findByIdAndUpdateWallet(user._id, updateData);

                if (!updatedUser) {
                    return { message: 'Error updating user wallet', success: false };
                }

            }

            if (status == "completed") {

                const Amount = booking.fee;
                const percentageToSubtract = 20;
                const decimalEquivalent = percentageToSubtract / 100;
                const result = Amount - Amount * decimalEquivalent;

                const updateData = { bookingfee: result, type: "credit", id: booking._id }

                const updateAmount = await this.userRepository.findByIdAndUpdateWallet(booking.doctorId, updateData)

                if (!updateAmount) {
                    return { message: 'Error updating doctor wallet', success: false };
                }

                const updateUser = {
                    $addToSet: { patients: booking.userId }
                };

                const updatedDoctor = await this.userRepository.findByIdAndUpdate(booking.doctorId, updateUser);

            }

            return { message: 'Booking status updated successfully', success: true };
        } catch (error) {
            console.error('Error in BookingStatus:', error);
            throw error;
        }
    }

    async getDoctor(doctorId: string | ObjectId) {
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
        } catch (error) {
            return {
                success: false,
                message: '(an error occured from database)' + (error as Error).message
            }
        }
    }

    async updateBanking(docId: string, data: { acNumber: number; repeatAcNumber: number; ifscCode: string; accountHolder: string }) {

        try {
            const updatedUser = {
                bankDetails: {
                    AcNumber: data.acNumber,
                    Repeataccount: data.repeatAcNumber,
                    ifsce: data.ifscCode,
                    accountHolder: data.accountHolder
                }
            };

            const updateBanking = await this.userRepository.findByIdAndUpdate(docId, updatedUser);

            if (updateBanking) {
                return {
                    success: true,
                    message: "Banking details updated successfully",
                    updatedBanking: updateBanking
                };
            } else {
                return {
                    success: false,
                    message: "User not found or banking details not updated",
                };
            }
        } catch (error) {
            throw error
        }
    }

    async prescription(id: string, prescription: string) {
        try {
            const res = await this.bookingRepository.findById(id)
            const data = {
                bkId: id,
                prescription,
                status:res?.status
            }
            const userId = res?.userId;
            const response = await this.bookingRepository.findByIdAndUpdate(userId, data);
        } catch (error) {

        }
    }

    async getAllbookings() {
        try {
            const allBookings = await this.bookingRepository.findAll()

            if (allBookings) {
                return {
                    allBookings,
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

    async deleteBookings(bookingId:string){
        try {
            const booking=await this.bookingRepository.findByIdAndDelete(bookingId)
            if(booking){
                return({success:true,message:'succesfully deleted'})
            }else{
                return({success:false,message:'deleting failed'})
            }
        } catch (error) {
            throw error
        }
    }

    async getAlldoctors() {
        try {
            const allDoctors = await this.userRepository.findAllDoctor()

            if (allDoctors) {
                return ({ success: true, doctors: allDoctors })
            } else {
                return ({ success: false })
            }
        } catch (error) {
            throw error
        }
    }

    async paymentRequest(doctorId: string) {
        try {
            const doctor = await this.doctorRepository.findById(doctorId)

            if (!doctor) {
                return ({ success: false, message: 'doctor not found' })
            }

            const bankDetails = { bankdetails: doctor?.bankDetails, wallet: doctor?.wallet?.balance }

            const request = await this.paymentRepository.create(doctorId, bankDetails)

            if (!request) {
                return ({ success: false, message: 'request failed' })
            }

            return ({ success: true, message: "request successfully submitted" })
        } catch (error) {
            throw error
        }
    }



}

export default DoctorUseCase