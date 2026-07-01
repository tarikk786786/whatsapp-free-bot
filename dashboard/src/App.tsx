import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Chats from './pages/Chats';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const handleLogin = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    if (!token) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/chats" element={<Chats />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/logs" element={<Logs />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}
