import express from 'express';
import userRoute from './frameworks/routes/userRouter';
import adminRoute from './frameworks/routes/adminRouter';
import doctorRoute from './frameworks/routes/doctorRouter'
import { DbConnect } from './frameworks/config/DbConnet'
import {SocketServer} from './socket/socket.io'
import cors from 'cors';
import cookieParser from 'cookie-parser';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: true,
};



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors(corsOptions));

app.use('/api/v1/', userRoute);
app.use('/api/v1/doctor', doctorRoute);
app.use('/api/v1/admin', adminRoute);

const server = require('http').Server(app); 
SocketServer(server); 

export default {
  start: () => {
    DbConnect();
    server.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  },
};
