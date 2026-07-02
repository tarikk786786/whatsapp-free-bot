import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function Chats() {
    const [chats, setChats] = useState<any[]>([]);
    const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
    const [summaryModal, setSummaryModal] = useState<{chatId: string, text: string} | null>(null);

    useEffect(() => {
        apiFetch('/api/chats')
            .then(res => res.json())
            .then(data => setChats(data.data || []))
            .catch(err => console.error(err));
    }, []);

    const handleSummarize = async (chatId: string) => {
        setLoadingSummary(chatId);
        try {
            const res = await apiFetch(`/api/chats/${chatId}/summarize`, { method: 'POST' });
            const data = await res.json();
            if (data.status === 'success') {
                setSummaryModal({ chatId, text: data.summary });
            } else {
                alert('Failed to summarize: ' + data.message);
            }
        } catch (error) {
            alert('An error occurred.');
        } finally {
            setLoadingSummary(null);
        }
    };

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
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {chats.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleSummarize(chat.id)}
                                            disabled={loadingSummary === chat.id}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                                        >
                                            {loadingSummary === chat.id ? 'Summarizing...' : 'Summarize'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Modal */}
            {summaryModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">AI Chat Summary</h3>
                            <button onClick={() => setSummaryModal(null)} className="text-gray-400 hover:text-gray-500">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Chat: {summaryModal.chatId}</p>
                        <div className="bg-indigo-50 p-4 rounded-md text-sm text-indigo-900 italic">
                            {summaryModal.text}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={() => setSummaryModal(null)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
