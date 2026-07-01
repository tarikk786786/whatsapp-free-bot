import { useEffect, useState } from 'react';
import { Activity, MessageSquare, Users, Settings } from 'lucide-react';

export default function App() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <h1 className="text-xl font-bold text-green-600 mb-8 flex items-center gap-2">
                    <MessageSquare size={24} /> WP Bot
                </h1>
                
                <nav className="flex-1 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg">
                        <Activity size={20} /> Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
                        <Users size={20} /> Users
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
                        <Settings size={20} /> Settings
                    </a>
                </nav>
                
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full ${stats?.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        WhatsApp {stats?.connectionStatus || 'Disconnected'}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
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

                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">AI Engine Status</h3>
                    <div className="flex items-center gap-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="font-semibold">Groq (Llama 3) Active</div>
                            <div className="text-sm opacity-90">Free AI processing is currently operational.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
