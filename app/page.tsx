import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Users, MessageCircle, Activity } from 'lucide-react'

export default async function OverviewPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch basic stats
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: chatsCount } = await supabase.from('chats').select('*', { count: 'exact', head: true })
  const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-800">{usersCount || 0}</h3>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-slate-500">Total Chats</p>
            <h3 className="text-2xl font-bold text-slate-800">{chatsCount || 0}</h3>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Activity className="w-8 h-8" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-slate-500">Total Messages</p>
            <h3 className="text-2xl font-bold text-slate-800">{messagesCount || 0}</h3>
          </div>
        </div>

      </div>
    </div>
  )
}
