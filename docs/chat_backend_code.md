
под backend еще чат указан код, на котором написано добавить Frontend чат!

wss://extraspace-backend.onrender.com
https://extraspace-backend.onrender.com
--
CREATE TABLE chats (
    user_id INTEGER,
    manager_id INTEGER,
    status VARCHAR(255) -- значения: 'PENDING', 'ACCEPTED', 'CLOSED'
);

CREATE TABLE messages (
    chat_id INTEGER,
    sender_id INTEGER,
    text VARCHAR(255),
    is_from_user BOOLEAN
);
--
import { WebSocketServer } from 'ws';
import { Chat, User, Message } from '../models/init/index.js';
import { URL } from 'url';
import logger from "../utils/winston/logger.js";

let wssInstance = null;

export function setWSS(server) {
    wssInstance = new MyWebSocketServer(server);
    return wssInstance;
}

export function getWSS() {
    return wssInstance;
}

class MyWebSocketServer {
    constructor(server) {
        this.ws = new WebSocketServer({ server });
        this.clients = new Map();
        this.setup();
    }

    setup() {
        this.ws.on('connection', (ws, req) => {
            const url = new URL(req.url, `https://${req.headers.host}`);
            const userId = url.searchParams.get('userId');

            if (userId) {
                this.clients.set(userId, ws);
                logger.info(`Client connected: ${userId}`);
            }

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(data, ws);
                } catch (error) {
                    logger.error('Invalid message:', error);
                }
            });

            ws.on('close', () => {
                this.clients.delete(userId);
                logger.info(`Client disconnected: ${userId}`);
            });
        });
    }

    async handleMessage(data, ws) {
        switch (data.type) {
            case 'START_CHAT':
                await this.startChat(data, ws);
                break;
            case 'SEND_MESSAGE':
                await this.sendMessage(data);
                break;
            case 'ACCEPT_CHAT':
                await this.acceptChat(data, ws);
                break;

        }
    }

    async startChat({ userId }) {
        const chat = await Chat.create({ user_id: userId, status: 'PENDING' });

        // Отправляем пользователю уведомление "Ожидайте"
        const userWs = this.clients.get(String(userId));
        if (userWs) {
            userWs.send(JSON.stringify({
                type: 'WAITING_FOR_MANAGER',
                message: 'Пожалуйста, подождите. Один из свободных менеджеров скоро ответит.'
            }));
        }

        // Уведомляем всех менеджеров
        const managers = await User.findAll({ where: { role: 'MANAGER' } });
        for (const manager of managers) {
            const managerWs = this.clients.get(String(manager.id));
            if (managerWs) {
                managerWs.send(JSON.stringify({
                    type: 'NEW_CHAT',
                    chatId: chat.id,
                    userId
                }));
            }
        }
    }
    async acceptChat({ chatId, managerId }) {
        const [updatedCount] = await Chat.update(
            { manager_id: managerId, status: 'ACCEPTED' },
            { where: { id: chatId, status: 'PENDING' } }
        );

        if (updatedCount === 0) {
            return;
        }

        const chat = await Chat.findByPk(chatId);
        const userWs = this.clients.get(String(chat.user_id));
        if (userWs) {
            userWs.send(JSON.stringify({
                type: 'CHAT_ACCEPTED',
                chatId,
                managerId
            }));
        }

    async sendMessage({ chatId, senderId, message, isFromUser }) {
        const chat = await Chat.findByPk(chatId);
        if (!chat) return;

        const newMessage = await Message.create({
            chat_id: chatId,
            sender_id: senderId,
            text: message,
            is_from_user: isFromUser
        });

        const receiverId = isFromUser ? chat.manager_id : chat.user_id;
        const receiverWs = this.clients.get(String(receiverId));

        if (receiverWs) {
            receiverWs.send(JSON.stringify({
                type: 'NEW_MESSAGE',
                message: newMessage
            }));
        }
    }
}
--
import {ChatService} from '../../service/chat/ChatService.js';
import {asyncHandler} from '../../utils/handler/asyncHandler.js';
import logger from "../../utils/winston/logger.js";

export const ChatController = {
    getMessages: asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        const { beforeId, limit } = req.query;

        const parsedLimit = parseInt(limit) || 50;
        const beforeMessageId = beforeId ? parseInt(beforeId) : null;

        const messages = await ChatService.getMessagesBefore(chatId, beforeMessageId, parsedLimit);

        logger.info('Fetched messages', {
            userId: req.user?.id || null,
            endpoint: req.originalUrl,
            requestId: req.id,
            chatId,
            beforeId: beforeId || null,
            limit: parsedLimit,
            returned: messages.length
        });

        res.json({
            messages: messages.reverse(), // от старых к новым
            hasMore: messages.length === parsedLimit // если меньше — сообщений больше нет
        });
    }),
    getUserChat: asyncHandler(async (req, res) => { // новый Endpoint 
        const userId = req.user.id;

        const chat = await ChatService.getChats({
            where: {
                user_id: userId,
                status: ['PENDING', 'ACCEPTED']
            }
        });

        if (chat && chat.length > 0) {
            logger.info('Fetched user chat', {
                userId: req.user?.id || null,
                endpoint: req.originalUrl,
                requestId: req.id,
                chatId: chat[0].id,
                status: chat[0].status
            });
            res.json(chat[0]);
        } else {
            logger.info('No active chat found for user', {
                userId: req.user?.id || null,
                endpoint: req.originalUrl,
                requestId: req.id,
            });
            res.status(404).json({ message: 'No active chat found' });
        }
    }),


    clearMessages: asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        await ChatService.clearMessages(chatId);
        logger.info('Cleared chat messages', {
            userId: req.user?.id || null,
            endpoint: req.originalUrl,
            requestId: req.id,
            chatId
        });
        res.json({ message: 'Messages cleared successfully' });
    }),

    changeManager: asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        const { newManagerId } = req.body;
        const updatedChat = await ChatService.changeManager(chatId, newManagerId);
        logger.info('Changed chat manager', {
            userId: req.user?.id || null,
            endpoint: req.originalUrl,
            requestId: req.id,
            chatId,
            newManagerId
        });
        res.json(updatedChat);
    }),

    getManagerChats: asyncHandler(async (req, res) => {
        const managerId = req.user.id;
        const chats = await ChatService.getChats({where: {manager_id: managerId}});
        logger.info('Fetched messages', {
            userId: req.user?.id || null,
            endpoint: req.originalUrl,
            requestId: req.id,
        });
        res.json(chats);
    }),
    getPendingChats: asyncHandler(async (req, res) => {
        const chats = await ChatService.getChats({where: {status: "PENDING"}});
        logger.info('Fetched messages', {
            endpoint: req.originalUrl,
            requestId: req.id,
        });
        res.json(chats);
    })
};

--
import {DataTypes} from 'sequelize';
import {sequelize} from '../config/database.js';

export const Chat = sequelize.define('Chat', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            unique: true // Добавляем уникальность
        },
    manager_id: DataTypes.INTEGER,
    status: DataTypes.STRING // 'PENDING', 'ACCEPTED', 'CLOSED'
},
    {
        tableName: 'chats',
        timestamps: false
    });

export default Chat;
--
import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

export const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
    chat_id: DataTypes.INTEGER,
    sender_id: DataTypes.INTEGER,
    text: DataTypes.STRING,
    is_from_user: DataTypes.BOOLEAN
},
    {
        tableName: 'messages',
        timestamps: false
    });
export default Message;
--
import express from 'express';
import { ChatController } from '../../controllers/chat/ChatController.js';
import {authorizeAdminOrManager} from "../../middleware/jwt.js";

const router = express.Router();

router.get('/manager', authorizeAdminOrManager, ChatController.getManagerChats);
router.get('/:chatId/messages', ChatController.getMessages);
router.get("/pending-chats",authorizeAdminOrManager,ChatController.getPendingChats)

router.delete('/:chatId/messages', ChatController.clearMessages);
router.get('/me', authenticateJWT, ChatController.getUserChat); //Новый Endpoint !

router.put('/:chatId/manager', ChatController.changeManager);

export default router;
--
ChatService.js:
import {Chat, Message} from '../../models/init/index.js';

export const ChatService = {
    async getMessagesBefore(chatId, beforeMessageId = null, limit = 50) {
        const where = { chat_id: chatId };
        if (beforeMessageId) {
            where.id = { lt: beforeMessageId };
        }

        const messages = await Message.findAll({
            where,
            order: [['id', 'DESC']],
            limit
        });

        return messages;
    },

    async clearMessages(chatId) {
        return await Message.destroy({ where: { chat_id: chatId } });
    },

    async changeManager(chatId, newManagerId) {
        const chat = await Chat.findByPk(chatId);
        if (!chat) throw new Error('Chat not found');

        chat.manager_id = newManagerId;
        await chat.save();

        return chat;
    },
    async getChats(options = {}) {
        return await Chat.findAll(options);
    }
};
--
app.js:
app.use('/chats',authenticateJWT,chatRoutes)
