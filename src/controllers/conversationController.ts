import { Request, Response } from 'express';
import UserUsecase from "../useCases/userUseCase"
import conversationModal from "../frameworks/models/conversation";
import messagesModal from '../frameworks/models/messages';


class ConversationController {
    private userUseCase: UserUsecase

    constructor(userUseCase: UserUsecase,) {
        this.userUseCase = userUseCase;
    }


    async createConversation(req: Request, res: Response) {
        try {
            // const response = await this.userUseCase.createConverstaion(req.body)
            const newConversation = new conversationModal({ members: [req.body.senderId, req.body.receiverId] })
            await newConversation.save();
            res.status(200).send('conversation created')
        } catch (error) {
            console.error(error, "error")
        }
    }

    async getConversation(req: Request, res: Response) {
        try {
            const userId = req.params.userId;

            const response = await this.userUseCase.getConversation(userId)

            if (!response.success) {
                return res.status(400).json({ message: "some error occured while getting message" })
            }

            res.status(200).json({ conversations: response.conversation, success: true });
        } catch (error) {
            console.error(error, 'error');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async sendMessage(req: Request, res: Response) {

        try {
            const { conversationId, senderId, message } = req.body;

            const sendMessage = await this.userUseCase.sendMessage(conversationId, senderId, message)

            if (!sendMessage.success) {
                return ({ success: false, messsage: 'Message Not Send' })
            }
            return res.status(200).json({ success: true, messsage: sendMessage.messsage })

        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const conversationId = req.params.conversationId

            const messages = await this.userUseCase.getMessages(conversationId);

            if (!messages.success) {
                return res.status(400).json({ messages: 'message not getting' })
            }

            return res.status(200).json(messages?.messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}


export default ConversationController