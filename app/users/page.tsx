import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Joined At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {error ? (
              <tr><td colSpan={4} className="px-6 py-4 text-red-500 text-center">Error loading users</td></tr>
            ) : users?.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">No users found</td></tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.id}</td>
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4">{user.name || 'N/A'}</td>
                  <td className="px-6 py-4">{new Date(user.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
