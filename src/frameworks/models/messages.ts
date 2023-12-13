import mongoose,{Types} from 'mongoose';

const messagesSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
conversationId:String,

  senderId: {
    type:String
  },
  message: {
    type:String,
  }
});

const messages = mongoose.model('Messages', messagesSchema);

export default messages
