import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function Overview() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data.data))
            .catch(err => console.error(err));
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

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">AI Engine Status</h3>
                <div className="flex items-center gap-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                    <div className="p-2 bg-green-100 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="font-semibold">Gemini AI Active</div>
                        <div className="text-sm opacity-90">AI processing is currently operational.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
