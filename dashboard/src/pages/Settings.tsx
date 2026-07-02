import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function Settings() {
    const [settings, setSettings] = useState<any>({ 
        systemPrompt: '',
        ignoreUnknown: false,
        quietHours: false,
        aiMode: 'friendly',
        replyLength: 'medium',
        emojiLevel: 'some'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiFetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setSettings((prev: any) => ({ ...prev, ...data.data }));
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiFetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            alert('Settings saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-500 mt-1">Configure your bot behavior and reply rules.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                <div className="space-y-6">
                    
                    {/* Reply Rules Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Reply Rules</h3>
                        
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-medium text-gray-900">Ignore Unknown Numbers</div>
                                <div className="text-sm text-gray-500">Only reply to people already in your contacts/database</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.ignoreUnknown || false} onChange={e => setSettings({...settings, ignoreUnknown: e.target.checked})} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-medium text-gray-900">Quiet Hours (10 PM - 7 AM)</div>
                                <div className="text-sm text-gray-500">Do not send any replies during the night</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.quietHours || false} onChange={e => setSettings({...settings, quietHours: e.target.checked})} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* AI Behavior Section */}
                    <div className="pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">AI Behavior Controls</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Personality Mode</label>
                                <select 
                                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-green-500 focus:border-green-500"
                                    value={settings.aiMode || 'friendly'}
                                    onChange={e => setSettings({...settings, aiMode: e.target.value})}
                                >
                                    <option value="casual">Casual & Relaxed</option>
                                    <option value="professional">Professional</option>
                                    <option value="friendly">Friendly & Helpful</option>
                                    <option value="romantic">Romantic & Sweet</option>
                                    <option value="business">Business / Customer Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reply Length</label>
                                <select 
                                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-green-500 focus:border-green-500"
                                    value={settings.replyLength || 'medium'}
                                    onChange={e => setSettings({...settings, replyLength: e.target.value})}
                                >
                                    <option value="short">Very Short (1-2 sentences)</option>
                                    <option value="medium">Medium (Standard)</option>
                                    <option value="long">Long (Detailed)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji Usage</label>
                                <select 
                                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-green-500 focus:border-green-500"
                                    value={settings.emojiLevel || 'some'}
                                    onChange={e => setSettings({...settings, emojiLevel: e.target.value})}
                                >
                                    <option value="none">No Emojis</option>
                                    <option value="some">Some Emojis (Natural)</option>
                                    <option value="lots">Lots of Emojis</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom System Prompt (Advanced)
                            </label>
                            <textarea
                                rows={6}
                                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Override or add additional rules..."
                                value={settings?.systemPrompt || ''}
                                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                This gets added to the generated prompt based on the settings above.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
