import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, MessageSquare, Users, Settings, Database } from 'lucide-react';

export default function Sidebar() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data.data))
            .catch(err => console.error(err));
    }, []);

    const navItems = [
        { path: '/', icon: <Activity size={20} />, label: 'Overview' },
        { path: '/chats', icon: <MessageSquare size={20} />, label: 'Chats' },
        { path: '/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/logs', icon: <Database size={20} />, label: 'Logs' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
            <h1 className="text-xl font-bold text-green-600 mb-8 flex items-center gap-2">
                <MessageSquare size={24} /> WP Bot
            </h1>
            
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive 
                                    ? 'text-gray-900 bg-gray-100 font-medium' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`
                        }
                    >
                        {item.icon} {item.label}
                    </NavLink>
                ))}
            </nav>
            
            <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${stats?.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    WhatsApp {stats?.connectionStatus || 'Disconnected'}
                </div>
            </div>
        </div>
    );
}
