import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await prisma.users.count();
        const totalChats = await prisma.chats.count();
        const totalMessages = await prisma.messages.count();
        
        res.json({
            status: 'success',
            data: {
                users: totalUsers,
                chats: totalChats,
                messages: totalMessages,
                aiStatus: 'active',
                connectionStatus: 'connected'
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
    }
});

export default router;
