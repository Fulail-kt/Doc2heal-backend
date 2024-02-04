import express from 'express'
import UserController from '../../controllers/userController';
import ConversationController from '../../controllers/conversationController'
import UserUsecase from '../../useCases/userUseCase';
import UserRepository from '../repository/user.repository';
import ConversationRepository from '../repository/conversation.repository';
import { authenticateToken, isBlocked } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';
import bookingModel from '../models/booking.model';
import mongoose from 'mongoose';
import { CustomRequest } from '../../controllers/userController';
const routes = express.Router();


const userRepository = new UserRepository()
const conversationRepository=new ConversationRepository
const userUsercase = new UserUsecase(userRepository,conversationRepository)
const userController = new UserController(userUsercase)
const conversationController= new ConversationController(userUsercase)

routes.post('/register', (req, res) => userController.register(req, res));
routes.post('/login', (req, res) => userController.login(req, res))
routes.put('/updateUser/:id', authenticateToken, (req, res) => userController.updateUser(req, res))
routes.post('/verify-otp', (req, res) => userController.verifyOtp(req, res))
routes.post('/resendOtp', (req, res) => userController.resendOtp(req, res))

routes.get('/getAllusers', (req, res) => userController.getAllusers(req, res))
routes.get('/getuser',authenticateToken,isBlocked, (req, res) => userController.getUser(req, res))


// routes.patch('/editProfile', authenticateToken,isBlocked, upload.single('file'), (req, res) => userController.editProfile(req, res))
routes.patch('/editProfile', authenticateToken, isBlocked, upload.single('file'), (req , res) => userController.editProfile(req as CustomRequest, res));

routes.post('/submitDocuments', authenticateToken, upload.array('files', 5), async (req, res) => { userController.saveDocuments(req as CustomRequest, res) });
routes.post('/application', authenticateToken, (req, res) => userController.doctorRegister(req, res))
// routes.post('/submitDocuments', authenticateToken, upload.array('files', 5), async (req, res) => { userController.saveDocuments(req, res) })
routes.post('/payment', authenticateToken, (req, res) => userController.bookingPayment(req, res));

// BOOKING ROUTES
routes.get('/getbookings', (req, res) => userController.getBookings(req, res))

// ALL BOOKING DATA WITH USER ID
routes.get('/getAllbookings', authenticateToken, async (req, res) => { userController.getAllBookings(req, res) })
routes.post('/savebooking', authenticateToken, async (req, res) => { userController.saveBooking(req, res) })
routes.post('/cancelBooking',authenticateToken, async (req, res) => { userController.cancelBooking(req, res) })
routes.get('/paymenthistory',authenticateToken, async (req, res) => { userController.paymentHistory(req, res) })

// CONVERSATIONS ROUTES
routes.post('/conversation', async (req, res) => { conversationController.createConversation(req,res)})
routes.get('/conversations/:userId',authenticateToken,isBlocked, async (req, res) => {conversationController.getConversation(req,res)});
routes.post('/messages', async (req, res) => {conversationController.sendMessage(req,res)})
routes.get('/messages/:conversationId', async (req, res) => {conversationController.getMessages(req,res)});





export default routes
