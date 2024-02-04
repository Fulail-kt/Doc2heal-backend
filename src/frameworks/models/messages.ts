import mongoose from 'mongoose';

const messagesSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const messages = mongoose.model('Messages', messagesSchema);

export default messages;
