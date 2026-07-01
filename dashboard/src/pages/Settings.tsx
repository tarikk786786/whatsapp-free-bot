import { useState, useEffect } from 'react';

export default function Settings() {
    const [settings, setSettings] = useState<any>({ systemPrompt: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setSettings(data.data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
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
                <p className="text-gray-500 mt-1">Configure your bot behavior.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bot System Prompt
                        </label>
                        <textarea
                            rows={8}
                            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="You are a helpful assistant..."
                            value={settings?.systemPrompt || ''}
                            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            This prompt defines the personality and rules for the AI.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
