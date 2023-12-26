import express, { Request, Response } from 'express';
import DoctorController from '../../controllers/doctorController';
import DoctorUseCase from '../../useCases/doctorUseCase';
import UserRepository from '../repository/user.repository';
import { authenticateToken } from '../middlewares/auth.middleware';
import BookingRepository from '../repository/booking.repository';


const routes = express.Router();

const bookingRespository=new BookingRepository
const userRepository = new UserRepository();
const doctorUseCase =new DoctorUseCase(userRepository,bookingRespository)
const doctorController=new DoctorController(doctorUseCase)

routes.post('/setTimeslot',authenticateToken, (req, res) => doctorController.saveTimeSlot(req, res));

routes.get('/getAllbookings',authenticateToken, (req, res) => doctorController.Bookings(req, res));

// get Doctors
routes.get('/getdoctor', (req, res) => doctorController.getDoctor(req, res));

routes.post('/cancelBooking',authenticateToken, (req,res)=> doctorController.BookingStatusUpdate(req,res))



// routes.put('/updateUser/:id',authenticateToken,(req,res)=> userController.updateUser(req,res))
// routes.post('/verify-otp',(req,res)=> userController.verifyOtp(req,res))
// routes.get('/getAllusers',(req,res)=> userController.getAllusers(req,res))
// routes.get('/getuser',authenticateToken,(req,res)=> userController.getUser(req,res))
// routes.patch('/editProfile', authenticateToken, upload.single('file'), (req, res) => userController.editProfile(req, res))







export default routes