export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Bot Personality</h2>
          <p className="text-sm text-slate-500 mb-4">Update the system prompt for your AI bot.</p>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">System Prompt</label>
            <textarea 
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none"
              defaultValue="You are a helpful and polite WhatsApp assistant..."
            />
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Save Prompt
            </button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800">Environment Variables</h2>
          <p className="text-sm text-slate-500 mb-4">Manage your API keys in Vercel.</p>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700">
              To update your API keys (OpenAI, Supabase, GreenAPI, PyWa), please navigate to your Vercel Project Settings. 
              Changes will take effect on the next deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
