import nodemailer from 'nodemailer';
require('dotenv').config();

class SendMail {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'Doc2heal.service@gmail.com',
                pass: process.env.MAIL_PASS,
            },
        });
    }

    sendMail(name: string, email: string, verificationCode: number): Promise<{status:number; success: boolean; message: string }> {
        return new Promise((resolve, reject) => {
            const mailOptions: nodemailer.SendMailOptions = {
                from: 'Doc2heal.service@gmail.com',
                to: email,
                subject: 'Doc2heal Email Verification',
                text: `Hi ${name},\n\n Your Verification Code is ${verificationCode}. Do not share this code with anyone.`,
            };

            this.transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error(err.message);
                    reject({
                        status:401,
                        success: false,
                        message: 'Failed to send verification code',
                    });
                } else {
                    resolve({
                        status:200,
                        success: true,
                        message: 'Otp Sent Successfully',
                    });
                }
            });
        });
    }
}

export default SendMail;
