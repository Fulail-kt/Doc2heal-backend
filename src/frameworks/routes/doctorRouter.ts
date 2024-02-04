import express, { Request, Response } from 'express';
import DoctorController from '../../controllers/doctorController';
import DoctorUseCase from '../../useCases/doctorUseCase';
import UserRepository from '../repository/user.repository';
import { authenticateToken } from '../middlewares/auth.middleware';
import BookingRepository from '../repository/booking.repository';
import mongoose from 'mongoose';
import bookingModel from '../models/booking.model';
import PaymentRepository from '../repository/payment.repository';


const routes = express.Router();
const bookingRespository=new BookingRepository
const userRepository = new UserRepository();
const paymentRepository = new PaymentRepository();
const doctorUseCase =new DoctorUseCase(userRepository,bookingRespository,paymentRepository)
const doctorController=new DoctorController(doctorUseCase)

// ALL DOCTORS
routes.get("/getAlldoctors",(req,res)=>doctorController.getAlldoctors(req,res))
// CREATE TIMESLOT
routes.post('/setTimeslot',authenticateToken, (req, res) => doctorController.saveTimeSlot(req, res));
// ALL BOOKING DATA WITH DOCTORID
routes.get('/getAllbookings',authenticateToken, (req, res) => doctorController.Bookings(req, res));
// ALL BOOKING (FINDALL)
routes.get('/getbookings',(req,res)=>doctorController.getBookings(req,res))
// GET DOCTORS
routes.get('/getdoctor', (req, res) => doctorController.getDoctor(req, res));
// UPDATE BOOKING STATUS
routes.post('/updateBookingStatus',authenticateToken, (req,res)=> doctorController.BookingStatusUpdate(req,res))
// ADD OR UPDATE BANK DETAILS
routes.post('/bankDetailsUpdate/:id',authenticateToken, (req,res)=> doctorController.updateBankingDetails(req,res))
// DOCTOR TOTAL EARNINGS
routes.post('/requestPayment',authenticateToken, (req,res)=> doctorController.paymentRequest(req,res))

routes.post('/prescription',authenticateToken, (req,res)=> doctorController.prescription(req,res))

routes.delete('/deleteBooking',authenticateToken, (req,res)=> doctorController.deleteBooking(req,res))

routes.get('/totalEarnings/:id', async (req, res) => {
    try {
      const doctorId= req.params.id

      const result = await bookingModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: 'completed',
          },
        },
        {
          $addFields: {
            netEarnings: {
              $multiply: ['$fee', 0.8],
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
            uniqueUserIds: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id.month',
            year: '$_id.year',
            totalEarnings: 1,
            uniqueUserCount: { $size: '$uniqueUserIds' },
          },
        },
      ]);
  
      const docId=new mongoose.Types.ObjectId(doctorId)
      const statusCounts = await bookingModel.aggregate([
        {
          $match: { doctorId:docId }
        },
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

      const totalUniqueUserCount = result.reduce((total, item) => total + item.uniqueUserCount, 0);
  
      res.status(200).json({data:result,patient:totalUniqueUserCount,booking});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

export default routes