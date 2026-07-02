import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = () => {
        apiFetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data.data || []))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async () => {
        if (!editingUser) return;
        setLoading(true);
        try {
            await apiFetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tag: editingUser.tag,
                    custom_prompt: editingUser.custom_prompt,
                    summary: editingUser.memory?.summary
                })
            });
            alert('Contact updated successfully!');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to update contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Users & Contacts</h2>
                    <p className="text-gray-500 mt-1">Manage contacts, tags, and AI memory overrides.</p>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory Summary</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No contacts found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown Name'}</div>
                                        <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.tag === 'Blocked' ? 'bg-red-100 text-red-800' :
                                            user.tag === 'VIP' ? 'bg-purple-100 text-purple-800' :
                                            user.tag ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.tag || 'No Tag'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                        {user.memory?.summary || 'No memory yet'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => setEditingUser(user)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                            Edit Contact: {editingUser.name || editingUser.phoneNumber}
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Tag</label>
                            <select 
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                value={editingUser.tag || ''}
                                onChange={e => setEditingUser({...editingUser, tag: e.target.value})}
                            >
                                <option value="">None</option>
                                <option value="VIP">VIP</option>
                                <option value="Family">Family</option>
                                <option value="Friend">Friend</option>
                                <option value="Work">Work</option>
                                <option value="Blocked">Blocked (Ignore Messages)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">AI Memory Summary</label>
                            <textarea 
                                rows={4}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={editingUser.memory?.summary || ''}
                                onChange={e => setEditingUser({
                                    ...editingUser, 
                                    memory: { ...editingUser.memory, summary: e.target.value }
                                })}
                                placeholder="What the AI knows about this person..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Prompt Override (Optional)</label>
                            <textarea 
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={editingUser.custom_prompt || ''}
                                onChange={e => setEditingUser({...editingUser, custom_prompt: e.target.value})}
                                placeholder="E.g. Only speak to this person in Spanish. Always be highly professional."
                            />
                            <p className="text-xs text-gray-500 mt-1">This will override global settings for this specific contact.</p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button 
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveUser}
                                disabled={loading}
                                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
