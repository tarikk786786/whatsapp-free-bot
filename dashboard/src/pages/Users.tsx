import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function Users() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        apiFetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data.data || []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                <p className="text-gray-500 mt-1">Manage users and view their memory structs.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.phoneNumber}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <pre className="bg-gray-50 p-2 rounded max-h-32 overflow-y-auto text-xs">
                                            {JSON.stringify(user.memory, null, 2)}
                                        </pre>
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
