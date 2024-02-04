import mongoose from 'mongoose';
require('dotenv').config();
export const DbConnect = async () => {
  try {
    // const dbConnection = await mongoose.connect('mongodb+srv://muhamedfulail77:23kqD2Uk4kgzCf5f@cluster0.vkypwrx.mongodb.net/?retryWrites=true&w=majority');
    const mongoUri = process.env.MONGO_URI || '';
    const dbConnection = await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    dbConnection.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    dbConnection.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};
