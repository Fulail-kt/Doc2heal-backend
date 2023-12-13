import mongoose,{Types} from 'mongoose';

const conversationSchema = new mongoose.Schema({

members:{
  type:Array,
required:true}
  
});


export default  mongoose.model('Conversation', conversationSchema);
