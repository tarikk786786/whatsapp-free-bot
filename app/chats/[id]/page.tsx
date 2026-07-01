import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ChatMessagesPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const chatId = params.id

  // Fetch chat and associated user data
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*, users:user_id(phone, name)')
    .eq('id', chatId)
    .single()

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true })

  if (chatError || !chat) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        Error loading chat details: {chatError?.message || 'Chat not found'}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/chats" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Chat with {chat.users?.name || 'Unknown'}
          </h1>
          <p className="text-sm text-slate-500">{chat.users?.phone}</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-y-auto flex flex-col gap-4">
        {messagesError ? (
          <p className="text-red-500">Error loading messages: {messagesError.message}</p>
        ) : messages?.length === 0 ? (
          <p className="text-slate-500 text-center py-10">No messages in this chat yet.</p>
        ) : (
          messages?.map((msg) => {
            const isBot = msg.sender === 'bot'
            return (
              <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                <div 
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    isBot 
                      ? 'bg-slate-100 text-slate-800 rounded-bl-none' 
                      : 'bg-emerald-500 text-white rounded-br-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-2 text-right ${isBot ? 'text-slate-400' : 'text-emerald-100'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
