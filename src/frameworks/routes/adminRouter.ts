import adminController from "../../controllers/adminController"
import adminUseCase from "../../useCases/adminUseCase"
import UserRepository from "../repository/user.repository"
import express from 'express'

const routes=express.Router()


const userRepository=new UserRepository
const adminUsecase=new adminUseCase(userRepository)
const admincontroller= new adminController(adminUsecase)







routes.put("/blockUser/:id", (req, res) => admincontroller.blockUser(req, res));
routes.put("/ApproveUser/:id", (req, res) => admincontroller.approveUser(req, res));
routes.put("/applicationStatus", (req, res) => admincontroller.updateVerification(req, res))
routes.get("/totalEarnings", (req, res) => admincontroller.totalEarnings(req, res))





export default routes