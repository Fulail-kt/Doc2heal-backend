import express from 'express'
import UserController from '../../controllers/userController';
import ConversationController from '../../controllers/conversationController'
import UserUsecase from '../../useCases/userUseCase';
import UserRepository from '../repository/user.repository';
import ConversationRepository from '../repository/conversation.repository';
import { authenticateToken, isBlocked } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

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

routes.get('/getAllusers', (req, res) => userController.getAllusers(req, res))
routes.get('/getuser',authenticateToken,isBlocked, (req, res) => userController.getUser(req, res))

routes.patch('/editProfile', authenticateToken,isBlocked, upload.single('file'), (req, res) => userController.editProfile(req, res))
routes.post('/application', authenticateToken, (req, res) => userController.doctorRegister(req, res))
routes.post('/submitDocuments', authenticateToken, upload.array('files', 5), async (req, res) => { userController.saveDocuments(req, res) })
routes.post('/payment', authenticateToken, (req, res) => userController.bookingPayment(req, res));

// BOOKING ROUTES
routes.get('/getbookings', (req, res) => userController.getBookings(req, res))
routes.get('/getAllbookings', authenticateToken, async (req, res) => { userController.getAllBookings(req, res) })
routes.post('/savebooking', authenticateToken, async (req, res) => { userController.saveBooking(req, res) })

// CONVERSATIONS ROUTES
routes.post('/conversation', async (req, res) => { conversationController.createConversation(req,res)})
routes.get('/conversations/:userId',authenticateToken,isBlocked, async (req, res) => {conversationController.getConversation(req,res)});
routes.post('/messages', async (req, res) => {conversationController.sendMessage(req,res)})
routes.get('/messages/:conversationId', async (req, res) => {conversationController.getMessages(req,res)});


// routes.get('/users/:userId', async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const users = await userModel.find({ _id: { $ne: userId } });
//         const usersData = await Promise.all(users.map(async (user) => {
//             return { user: { email: user.email, username: user.username, receiverId: user._id } }
//         }));

//         console.log(usersData);
//         res.status(200).json(usersData);  // Send the array directly

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });




export default routes