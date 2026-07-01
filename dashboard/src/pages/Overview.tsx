import { useState, useEffect } from 'react';
import { Activity, QrCode } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function Overview() {
    const [stats, setStats] = useState<any>(null);
    const [qrStatus, setQrStatus] = useState<any>(null);

    useEffect(() => {
        apiFetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data.data))
            .catch(err => console.error(err));
            
        // Poll for QR status if not connected
        const interval = setInterval(() => {
            apiFetch('/api/status')
                .then(res => res.json())
                .then(data => {
                    setQrStatus(data.data);
                    if (data.data?.connectionStatus === 'connected') {
                        // Refresh stats when connected
                        apiFetch('/api/stats').then(res => res.json()).then(d => setStats(d.data));
                    }
                })
                .catch(err => console.error(err));
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                    <p className="text-gray-500 mt-1">Monitor your AI assistant's performance.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-gray-900">{stats?.users || 0}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Total Chats</div>
                    <div className="text-3xl font-bold text-gray-900">{stats?.chats || 0}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Messages Processed</div>
                    <div className="text-3xl font-bold text-gray-900">{stats?.messages || 0}</div>
                </div>
            </div>

            {qrStatus?.connectionStatus === 'qr' && qrStatus?.qr && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Connect WhatsApp</h3>
                    <p className="text-gray-500 mb-6 text-center max-w-sm">Scan this QR code with your WhatsApp mobile app to connect the bot.</p>
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                        <QRCodeSVG value={qrStatus.qr} size={256} />
                    </div>
                </div>
            )}
            
            {qrStatus?.connectionStatus === 'disconnected' && !qrStatus?.qr && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <QrCode size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Disconnected</h3>
                    <p className="text-gray-500">Waiting for a new QR code from the server...</p>
                </div>
            )}

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">AI Engine Status</h3>
                <div className="flex items-center gap-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                    <div className="p-2 bg-green-100 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="font-semibold">Groq AI Active</div>
                        <div className="text-sm opacity-90">Llama 3 processing is currently operational.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
