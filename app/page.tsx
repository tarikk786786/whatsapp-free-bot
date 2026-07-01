import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Test the database connection by fetching chats
  const { data: chats, error } = await supabase.from('chats').select()

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>WhatsApp Bot Admin Dashboard</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error loading data: {error.message}</p>
      ) : (
        <div>
          <h2>Recent Chats</h2>
          {chats && chats.length > 0 ? (
            <ul>
              {chats.map((chat) => (
                <li key={chat.id}>{chat.last_message}</li>
              ))}
            </ul>
          ) : (
            <p>No chats found.</p>
          )}
        </div>
      )}
    </main>
  )
}
