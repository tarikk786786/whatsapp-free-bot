import { useState, useEffect } from 'react';

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/logs')
            .then(res => res.json())
            .then(data => setLogs(data.data || []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Logs</h2>
                <p className="text-gray-500 mt-1">System logs and recent events.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No logs available.</div>
                    ) : (
                        logs.map((log, idx) => (
                            <div key={idx} className="text-sm font-mono p-3 bg-gray-50 rounded border border-gray-200">
                                <span className="text-gray-400">[{new Date(log.createdAt).toLocaleString()}]</span>{' '}
                                <span className={`font-semibold ${log.level === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                                    {log.level.toUpperCase()}
                                </span>
                                : {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
