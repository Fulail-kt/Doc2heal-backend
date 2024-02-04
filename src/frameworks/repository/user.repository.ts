import mongoose, { ObjectId } from "mongoose";
import User from "../../entities/user"
import userModel from "../models/user.model"
import bookingModel from "../models/booking.model";

class UserRepository {
    constructor() { }

    async create(user: User) {
        try {

            const response = await new userModel(user).save({ new: true } as any);

            return {
                success: true,
                message: "user created",
                user: response

            }
        } catch (error) {
            return {
                success: false,
                message: "database error"
            }
        }
    }


    async findById(id: string | any) {

        id = new mongoose.Types.ObjectId(id)

        const user = await userModel.findById(id);
        if (user) {

            return user;
        } else {
            return null;
        }

    }

    async findByEmail(email: string) {
        try {
            const user = await userModel.findOne({ email: email })

            if (user) {
                return user

            } else {
                return null

            }
        } catch (error) {
            throw error
        }
    }


    async findByIdAndUpdate(id: string | ObjectId | any, updatedUser: any) {
        try {

            const updatedUserDocument = await userModel.findByIdAndUpdate(id, updatedUser, { new: true });

            if (updatedUserDocument) {
                return {
                    success: true,
                    message: "User updated successfully",
                    updatedUser: updatedUserDocument.toObject(),
                };
            } else {
                return {
                    success: false,
                    message: "User not found or not updated",
                };
            }
        } catch (error) {
            console.error((error as Error).message);
            throw error
        }
    }


    async otpSuccess(email: string) {

        try {
            const response = await userModel.findOne({ email })

            if (response) {

                response.timeTolive = undefined;
                response.isVerified = true;
                await response.save();

                return { success: true }

            } else {

                return { success: false }
            }
        } catch (error) {

        }
    }


    async findAll() {
        try {
            const USER = await userModel.find()
            if (!USER) {
                return {
                    success: true,
                    status: 400,
                    message: 'doctors not found'
                }
            }
            return {
                success: true,
                status: 200,
                data: USER,
                message: 'all doctors retrived'

            }

        } catch (error) {
            return {
                success: false,
                status: 500,
                message: (error as Error).message
            }
        }
    }


    async findAllDoctor(){
        try {
            const doctors = await userModel.find({role:"doctor"})
            if (!doctors) {
                return   null
            }
            return doctors
            
        } catch (error) {
            throw error
        }
    }

    async saveDocuments(id: string, doc: [string]) {

        try {

            const user = await this.findById(id)

            if (!user) {
                return { sucess: false, message: 'user not found' }
            }

            if (user) {

                let save = doc.map((url: string) => {
                    user.documents?.push(url)
                })
            }

            user.formStatus = "submited"
            await user.save();
        } catch (error) {

        }
    }


    async findByIdAndUpdateWallet(id: string | ObjectId | any, updateData: {id:mongoose.Types.ObjectId, bookingfee: number, type: string }) {
        try {

            const options = { new: true };

            const updatedUser = await userModel.findByIdAndUpdate(
                id,
                {
                    $inc: { 'wallet.balance': updateData.bookingfee },
                    $push: {
                        'wallet.transactions': {
                            _id:updateData.id,
                            paymentType: updateData.type,
                            amount: updateData.bookingfee,
                        },
                    },
                },
                { new: true }
            );

            if (updatedUser) {
                return updatedUser;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    async adminEarnings() {
        try {
            const result = await bookingModel.aggregate([
                {
                    $match: {
                        status: 'completed',
                    },
                },
                {
                    $addFields: {
                        netEarnings: {
                            $multiply: ['$fee', 0.2],
                        },
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$date',
                            },
                        },
                        month: {
                            $dateToString: {
                                format: '%Y-%m',
                                date: '$date',
                            },
                        },
                        year: {
                            $dateToString: {
                                format: '%Y',
                                date: '$date',
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: '$year',
                            month: '$month',
                        },
                        totalEarnings: { $sum: '$netEarnings' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id.month',
                        year: '$_id.year',
                        totalEarnings: 1,
                    },
                },
            ]);


            const statusCounts = await bookingModel.aggregate([
                {
                  $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                  }
                }
              ]).exec();
              
              const completedCount = statusCounts.find(statusCount => statusCount._id === "completed")?.count || 0;
              const bookedCount = statusCounts.find(statusCount => statusCount._id === "booked")?.count || 0;
              const cancelledCount = statusCounts.find(statusCount => statusCount._id === "cancelled")?.count || 0;
            
              const booking={
               Completed:completedCount,Booked:bookedCount,Cancelled:cancelledCount
              }
              
            if (result) {
                return ({result,booking})
            } else {
                null
            }
        } catch (error) {
            throw error
        }
    }


    
}


export default UserRepository