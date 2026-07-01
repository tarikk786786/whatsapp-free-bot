import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function Chats() {
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        apiFetch('/api/chats')
            .then(res => res.json())
            .then(data => setChats(data.data || []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
                <p className="text-gray-500 mt-1">Manage active WhatsApp conversations.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unread</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {chats.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No chats found.
                                </td>
                            </tr>
                        ) : (
                            chats.map((chat, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{chat.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chat.unreadCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                                        {chat.lastMessageSnippet || 'No messages yet'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {chat.paused ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Paused
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
