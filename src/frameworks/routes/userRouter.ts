import express from 'express'
import UserController from '../../controllers/userController';
import UserUsecase from '../../useCases/userUseCase';
import UserRepository from '../repository/user.repository';
import { authenticateToken } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';
import conversationModal from '../models/conversation';
import userModel from '../models/user.model';
import messagesModal from '../models/messages';



const routes=express.Router();


const userRepository = new UserRepository()
const userUsercase = new UserUsecase(userRepository)
const userController = new UserController(userUsercase)

routes.post('/register',(req, res) => userController.register(req, res));
routes.post('/login',(req,res)=> userController.login(req,res))
routes.put('/updateUser/:id',authenticateToken,(req,res)=> userController.updateUser(req,res))
routes.post('/verify-otp',(req,res)=> userController.verifyOtp(req,res))
routes.get('/getAllusers',(req,res)=> userController.getAllusers(req,res))
routes.get('/getuser',(req,res)=> userController.getUser(req,res))
routes.get('/getbookings',(req,res)=> userController.getBookings(req,res))
routes.patch('/editProfile', authenticateToken, upload.single('file'), (req, res) => userController.editProfile(req, res))

routes.post('/application',authenticateToken,(req,res)=> userController.doctorRegister(req,res))


routes.post('/payment',authenticateToken,(req, res) => userController.bookingPayment(req,res));


routes.post('/savebooking',authenticateToken,async (req,res)=>{userController.saveBooking(req,res)})


routes.post('conversation',async(req,res)=>{
    try {
        const {senderId, recieverId}=req.body
        const newConversation= new conversationModal({members:{senderId,recieverId}})
        await newConversation.save();
        res.status(200).send('conversation created')
    } catch (error) {
        console.error(error,"error")
    }
})

routes.post('conversation/:userId',async(req,res)=>{
    try {

        const userId=req.params.userId;

        const conversations= await conversationModal.find({members:{$in:[userId]}})
        const conversationUserData= Promise.all(conversations.map(async(conversation)=>{
            const recieverId= conversation.members.find((member)=> member !==userId);
            const user= await userModel.findById(recieverId);
            return {user:{email:user?.email,name:user?.username},conversationId:conversation._id}
        }))
        res.status(200).json(await conversationUserData)
    } catch (error) {
        console.error(error,"error")
    }
})

routes.post('/message',async(req,res)=>{
    try {
        const {conversationId,senderId,message}=req.body;
        const newMessage= new messagesModal({conversationId,senderId,message})
        await newMessage.save()
        res.status(200).send('message Sucessfully sent')
    } catch (error) {
        console.error(error)
    }
})

routes.get('/message/:conversationId',async(req,res)=>{
    try {
       
        const conversationId =req.params.conversationId;
        const messages= await messagesModal.find({conversationId})
        const messageUserData= Promise.all(messages.map(async(message)=>{
            
            const user= await userModel.findById(message.senderId);
            return {user:{email:user?.email,name:user?.username},message:message.message}

    }));

    res.status(200).json(await messageUserData)
    
     }catch (error) {
        console.error(error)
    }
})

// routes.get('/users')


export default routes