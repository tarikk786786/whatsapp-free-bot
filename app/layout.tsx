import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Users, MessageSquare, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Dashboard for managing WhatsApp bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen bg-slate-50 overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <h1 className="text-lg font-bold text-slate-800">Bot Admin</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </Link>
            <Link href="/users" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Users</span>
            </Link>
            <Link href="/chats" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Chats</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 flex items-center px-8 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
          </header>
          <div className="flex-1 overflow-auto p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
