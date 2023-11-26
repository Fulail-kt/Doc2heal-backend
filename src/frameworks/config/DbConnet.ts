import mongoose from 'mongoose';

export const DbConnect = async () => {
  try {
    const dbConnection = await mongoose.connect('mongodb://127.0.0.1:27017/Doc2heal');

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
