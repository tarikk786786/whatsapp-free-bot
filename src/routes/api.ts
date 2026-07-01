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

// GET /api/chats
router.get('/chats', async (req, res) => {
    try {
        const allChats = await prisma.chats.findMany({
            include: { users: true },
            orderBy: { updated_at: 'desc' }
        });
        
        // Format for frontend
        const formattedChats = allChats.map(c => ({
            id: c.users?.phone || c.user_id,
            unreadCount: c.unread_count || 0,
            lastMessageSnippet: c.last_message || '',
            paused: false // To be implemented in state or db later if needed
        }));
        
        res.json({ status: 'success', data: formattedChats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch chats' });
    }
});

// GET /api/users
router.get('/users', async (req, res) => {
    try {
        const allUsers = await prisma.users.findMany({
            include: { memory: true },
            orderBy: { created_at: 'desc' }
        });
        
        const formattedUsers = allUsers.map(u => ({
            id: u.id,
            phoneNumber: u.phone,
            name: u.name,
            memory: u.memory.length > 0 ? u.memory[0] : {}
        }));
        
        res.json({ status: 'success', data: formattedUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
    }
});

// GET /api/logs
router.get('/logs', async (req, res) => {
    try {
        const allLogs = await prisma.logs.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        
        const formattedLogs = allLogs.map(l => ({
            id: l.id,
            level: l.level || 'info',
            message: l.message || '',
            createdAt: l.timestamp
        }));
        
        res.json({ status: 'success', data: formattedLogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch logs' });
    }
});

// GET /api/settings
router.get('/settings', async (req, res) => {
    try {
        const setting = await prisma.settings.findUnique({
            where: { key: 'bot_config' }
        });
        
        res.json({ status: 'success', data: setting?.value || { systemPrompt: '' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch settings' });
    }
});

// PUT /api/settings
router.put('/settings', async (req, res) => {
    try {
        const body = req.body;
        await prisma.settings.upsert({
            where: { key: 'bot_config' },
            update: { value: body },
            create: { key: 'bot_config', value: body }
        });
        
        res.json({ status: 'success', message: 'Settings saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to save settings' });
    }
});

export default router;
