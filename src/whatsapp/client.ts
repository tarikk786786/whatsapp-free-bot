import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { generateReply } from '../ai/llm';
import { PrismaClient } from '@prisma/client';

export let currentQR: string | null = null;
export let connectionStatus: 'disconnected' | 'qr' | 'connected' = 'disconnected';

const prisma = new PrismaClient();

async function addLog(level: string, message: string, source: string = 'whatsapp', details: any = null) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    try {
        await prisma.logs.create({
            data: {
                level,
                message,
                source,
                details: details ? JSON.stringify(details) : "{}"
            }
        });
    } catch (e) {
        console.error('Failed to save log to db', e);
    }
}

export async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    await addLog('info', `Using WA v${version.join('.')}, isLatest: ${isLatest}`, 'system');

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            await addLog('info', 'New QR code received');
            currentQR = qr;
            connectionStatus = 'qr';
        }

        if (connection === 'close') {
            currentQR = null;
            connectionStatus = 'disconnected';
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            await addLog('error', `Connection closed. Reconnecting: ${shouldReconnect}, statusCode: ${statusCode}`);
            
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                // We are logged out. Delete the old session and restart to generate a new QR!
                await addLog('warn', 'Logged out from WhatsApp. Wiping old session and generating new QR...');
                const fs = require('fs');
                try {
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                } catch (err) {
                    console.error('Failed to delete auth folder', err);
                }
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            currentQR = null;
            connectionStatus = 'connected';
            await addLog('info', 'Successfully connected to WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const remoteJid = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

            if (remoteJid && text) {
                await addLog('info', `Received message from ${remoteJid}: ${text}`, 'message');
                
                const aiReply = await generateReply(remoteJid, text);
                
                await sock.sendMessage(remoteJid, { text: aiReply });
                await addLog('info', `Sent reply to ${remoteJid}: ${aiReply}`, 'message');
            }
        } catch (err) {
            console.error('Error handling incoming message:', err);
        }
    });
}
