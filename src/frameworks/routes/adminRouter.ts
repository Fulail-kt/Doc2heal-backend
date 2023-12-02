import adminController from "../../controllers/adminController"
import adminUseCase from "../../useCases/adminUseCase"
import UserRepository from "../repository/user.repository"
import express from 'express'

const routes=express.Router()



const userRepository=new UserRepository

const adminUsecase=new adminUseCase(userRepository)
const admincontroller= new adminController(adminUsecase)







routes.put("/blockUser/:id", (req, res) => admincontroller.BlockUser(req, res));
routes.put("/ApproveUser/:id", (req, res) => admincontroller.ApproveUser(req, res));







export default routes