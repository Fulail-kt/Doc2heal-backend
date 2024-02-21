# Doc2Heal Online Doctor Consultation Platform Backend

Doc2Heal is an online platform designed to facilitate doctor-patient consultations remotely. With Doc2Heal, users can connect with healthcare professionals from the comfort of their own homes, enabling convenient access to medical advice and assistance.

## Features

- **User Registration**: Users can create accounts to access the platform.
- **Doctor Profiles**: Detailed profiles of healthcare professionals, including specialization, qualifications, and experience.
- **Appointment Scheduling**: Users can schedule appointments with doctors based on availability.
- **Live Video Consultations**: Conduct real-time video consultations between doctors and patients securely.
- **Chat Messaging**: Users can communicate with doctors via text-based messaging for quick inquiries and follow-ups.
- **Prescription Management**: Doctors can issue electronic prescriptions for patients, which are accessible through the platform.
- **Payment Integration**: Secure payment processing for consultations and services offered through the platform.

## Getting Started

To get started with Doc2Heal, follow these steps:

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/fulail-kt/doc2heal-backend

------------------------------------------------------------------------------Install dependencies:----------------------------------------------------------------------------------------

//  bash

cd doc2heal-backend
npm install
Configure environment variables:

Create a .env file based on the provided .env.example.
Update the configuration settings as required, backend BaseURL,  

JWT_REFRESH_KEY='YOUR_REFRESH', JWT_SECRET_KEY='YOUR_SCERET' , MAIL_PASS="YOUR EMAIL APP PASSWORD",  MONGO_URI="YOUR_MONGDB_URI",  PORT='3000',   SECRET_STRIPE_KEY="YOUR_STRIP_KEY"

Start the development server:

//     bash

npm start

Access the platform at http://localhost:3000 in your web browser.
