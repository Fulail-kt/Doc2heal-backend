import express from 'express';
import userRoute from './frameworks/routes/userRouter';
import { DbConnect } from './frameworks/config/DbConnet'
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto'; // Import the crypto module
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: true,
};

// Generate a secure random string for the session secret
const secret = crypto.randomBytes(64).toString('hex');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(cors(corsOptions));

app.use('/api/v1/', userRoute);

module.exports = {
  start: () => {
    DbConnect();
    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  },
};
