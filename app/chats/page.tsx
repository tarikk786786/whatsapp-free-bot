import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function ChatsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch chats with associated user data
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      id,
      created_at,
      last_message,
      users:user_id ( phone, name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Chats</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Last Message</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {error ? (
              <tr><td colSpan={5} className="px-6 py-4 text-red-500 text-center">Error loading chats</td></tr>
            ) : chats?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">No chats found</td></tr>
            ) : (
              chats?.map((chat: any) => (
                <tr key={chat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{chat.users?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{chat.users?.phone || 'N/A'}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{chat.last_message || 'No messages yet'}</td>
                  <td className="px-6 py-4">{new Date(chat.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Link href={`/chats/${chat.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                      View Messages
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
