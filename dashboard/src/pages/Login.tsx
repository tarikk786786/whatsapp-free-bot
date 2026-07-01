import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                onLogin(data.token);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-green-100 text-green-600 p-3 rounded-full mb-4">
                        <MessageSquare size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                    <p className="text-gray-500 mt-2 text-center text-sm">
                        Enter your admin password to access the WhatsApp AI Dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="Enter password..."
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
