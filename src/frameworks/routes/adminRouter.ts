import adminController from "../../controllers/adminController"
import adminUseCase from "../../useCases/adminUseCase"
import { AdminroleCheck, authenticateToken } from "../middlewares/auth.middleware"
import PaymentRepository from "../repository/payment.repository"
import UserRepository from "../repository/user.repository"
import express from 'express'

const routes=express.Router()


const userRepository=new UserRepository
const paymentRepository=new PaymentRepository
const adminUsecase=new adminUseCase(userRepository,paymentRepository)
const admincontroller= new adminController(adminUsecase)








routes.put("/blockUser/:id",authenticateToken, AdminroleCheck,(req, res) => admincontroller.blockUser(req, res));
routes.put("/ApproveUser/:id",authenticateToken, AdminroleCheck, (req, res) => admincontroller.approveUser(req, res));
routes.put("/applicationStatus", authenticateToken, AdminroleCheck,(req, res) => admincontroller.updateVerification(req, res))
routes.get("/totalEarnings",authenticateToken, AdminroleCheck, (req, res) => admincontroller.totalEarnings(req, res))
routes.get("/paymentRequests",authenticateToken, AdminroleCheck, (req, res) => admincontroller.paymentRequests(req, res))
routes.patch("/updatePayment",authenticateToken, AdminroleCheck, (req, res) => admincontroller.updatePayment(req, res))





export default routes