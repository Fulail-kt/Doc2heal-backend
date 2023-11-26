import express from 'express'
import userRoute from './frameworks/routes/userRouter'
import { DbConnect } from './frameworks/config/DbConnet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
require('dotenv').config();




const app=express()
const PORT=process.env.PORT || 3000

const corsOptions={
    origin:true
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors(corsOptions))

app.use('/api/v1/',userRoute)

module.exports={
    start:()=>{
        DbConnect()
        app.listen(PORT,()=>{
            console.log(`serverRunning at port ${PORT}`)
        })
    }
}