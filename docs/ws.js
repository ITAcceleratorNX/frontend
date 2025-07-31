import { WebSocketServer, WebSocket } from 'ws';
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

            console.log(`🔗 WebSocket connection attempt from userId: ${userId}`);

            if (userId) {
                // Проверяем, есть ли уже подключение для этого пользователя
                const existingWs = this.clients.get(userId);
                if (existingWs && existingWs.readyState === WebSocket.OPEN) {
                    console.log(`⚠️ Closing existing connection for user ${userId}`);
                    existingWs.close();
                }
                
                this.clients.set(userId, ws);
                logger.info(`Client connected: ${userId}`);
                console.log(`✅ Client connected and stored: ${userId}`);
                console.log(`📊 Total connected clients: ${this.clients.size}`);
                console.log(`👥 Connected users: [${Array.from(this.clients.keys()).join(', ')}]`);
            } else {
                console.log('❌ Connection rejected: no userId provided');
                ws.close();
                return;
            }

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log(`Received message from ${userId}:`, data.type);
                    await this.handleMessage(data, ws);
                } catch (error) {
                    logger.error('Invalid message:', error);
                    console.error('Invalid message:', error);
                }
            });

            ws.on('close', (code, reason) => {
                this.clients.delete(userId);
                logger.info(`Client disconnected: ${userId}`);
                console.log(`🔌 Client disconnected: ${userId} (code: ${code}, reason: ${reason})`);
                console.log(`📊 Remaining connected clients: ${this.clients.size}`);
                console.log(`👥 Remaining users: [${Array.from(this.clients.keys()).join(', ')}]`);
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
        console.log(`Starting chat:${userId}`);
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

        // Уведомить других менеджеров, что чат занят
        // const managers = await User.findAll({ where: { role: 'ADMIN' } });
        // for (const manager of managers) {
        //     if (manager.id !== managerId) {
        //         const otherManagerWs = this.clients.get(String(manager.id));
        //         if (otherManagerWs) {
        //             otherManagerWs.send(JSON.stringify({
        //                 type: 'CHAT_TAKEN',
        //                 chatId,
        //                 byManagerId: managerId
        //             }));
        //         }
        //     }
        // }
    }

    async sendMessage({ chatId, senderId, message, isFromUser }) {
        const chat = await Chat.findByPk(chatId);
        if (!chat) {
            console.log('Chat not found:', chatId);
            return;
        }
        if (chat.status !== 'ACCEPTED') {
            console.log('Chat not active:', chatId);
            return;
        }

        const newMessage = await Message.create({
            chat_id: chatId,
            sender_id: senderId,
            text: message,
            is_from_user: isFromUser
        });

        console.log(`Sending message from user ${senderId} in chat ${chatId}`);
        console.log(`Chat participants: user_id=${chat.user_id}, manager_id=${chat.manager_id}`);
        console.log(`Connected clients:`, Array.from(this.clients.keys()));

        // Хабарламаны екі жаққа да жіберу
        const messageData = {
            type: 'NEW_MESSAGE',
            message: newMessage
        };

        // Пайдаланушыға жіберу
        const userWs = this.clients.get(String(chat.user_id));
        if (userWs && userWs.readyState === WebSocket.OPEN) {
            userWs.send(JSON.stringify(messageData));
            console.log(`✅ Message sent to user ${chat.user_id}`);
        } else {
            console.log(`❌ User ${chat.user_id} WebSocket not found or not open. ReadyState: ${userWs?.readyState}`);
        }

        // Менеджерге жіберу
        if (chat.manager_id) {
            const managerWs = this.clients.get(String(chat.manager_id));
            if (managerWs && managerWs.readyState === WebSocket.OPEN) {
                managerWs.send(JSON.stringify(messageData));
                console.log(`✅ Message sent to manager ${chat.manager_id}`);
            } else {
                console.log(`❌ Manager ${chat.manager_id} WebSocket not found or not open. ReadyState: ${managerWs?.readyState}`);
            }
        }
    }

}
