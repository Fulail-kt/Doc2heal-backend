import conversationModal from "../models/conversation";
import messagesModal from "../models/messages";
class ConversationRepository {



    async findConversation(userId: string, receiverId: string) {
        try {
            const res = await conversationModal.findOne({
                members: { $all: [userId, receiverId] }
            });
    
            return res;
        } catch (error) {
            throw error;
        }
    }
    


    async createConversation(senderId:string,receiverId:string){
        try {

            const exist=await this.findConversation(senderId,receiverId)
            if(!exist){

                const newConversation = new conversationModal({ members: [senderId, receiverId] })
                await newConversation.save();
                if(newConversation){
                    return newConversation
                }else{
                    return null
                }
            }else{
                return exist
            }

        } catch (error) {
            throw error
        }
    }
    async getConversation(userId: string) {
        try {
            const conversations = await conversationModal.find({members: { $in: [userId] }, });

            if (conversations) {
                return conversations
            } else {
                null
            }
        } catch (error) {
            throw error
        }
    }


    async sendMessage(conversationId: string, senderId: string, message: string) {
        try {
            const newMessage = new messagesModal({ conversationId, senderId, message })
            await newMessage.save()

            if (!newMessage) {
                return null
            }
            return newMessage
        } catch (error) {
            throw error
        }
    }


    async getMessages(conversationId: string) {
        try {
            const messages = await messagesModal.find({ conversationId });

            if (messages) {
                return messages
            } else {
                return null
            }
        } catch (error) {
            throw error
        }
    }
}

export default ConversationRepository