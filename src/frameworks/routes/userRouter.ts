import express from 'express'
import UserController from '../../controllers/userController';
import UserUsecase from '../../useCases/userUseCase';
import UserRepository from '../repository/user.repository';
import { authenticateToken } from '../middlewares/auth.middleware';
const routes=express.Router();


const userRepository = new UserRepository()
const userUsercase = new UserUsecase(userRepository)
const userController = new UserController(userUsercase)

routes.post('/register',(req, res) => userController.register(req, res));
routes.post('/login',(req,res)=> userController.login(req,res))
routes.put('/updateuser/:id',(req,res)=> userController.updateUser(req,res))
routes.post('/verify-otp',(req,res)=> userController.verifyOtp(req,res))







export default routes