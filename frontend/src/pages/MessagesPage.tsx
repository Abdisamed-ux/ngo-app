import React, { useState } from 'react';
import { Mail, Send, Inbox, PenSquare, X, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { PageLoader, SkeletonRow } from '../components/LoadingSpinner.js';
import { useInbox, useSentMessages, useSendMessage, useMarkMessageRead } from '../hooks/useMessages.js';
import { useAllUsers } from '../hooks/useAdmin.js';
import type { Message } from '../types/index.js';
import { useAuthStore } from '../stores/authStore.js';

export const MessagesPage: React.FC = () => {
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const { data: inbox, isLoading: loadingInbox } = useInbox();
  const { data: sent, isLoading: loadingSent } = useSentMessages();
  const { mutate: markRead } = useMarkMessageRead();
  const { mutate: sendMessage, isPending: sending } = useSendMessage();
  const { data: usersData } = useAllUsers();
  
  const { user: currentUser } = useAuthStore();

  const [form, setForm] = useState({
    receiverId: '',
    subject: '',
    body: '',
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(form, {
      onSuccess: () => {
        setShowCompose(false);
        setForm({ receiverId: '', subject: '', body: '' });
        setTab('sent');
      }
    });
  };

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    if (tab === 'inbox' && !msg.is_read) {
      markRead(msg.id);
    }
  };

  const messages = tab === 'inbox' ? inbox : sent;
  const loading = tab === 'inbox' ? loadingInbox : loadingSent;

  return (
    <Layout title="Messages">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
          <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center justify-center gap-2 py-3 shadow-lg">
            <PenSquare size={18} />
            Compose
          </button>
          
          <nav className="card p-2 flex flex-col gap-1">
            <button
              onClick={() => { setTab('inbox'); setSelectedMessage(null); }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${tab === 'inbox' ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/50'}`}
            >
              <div className="flex items-center gap-3">
                <Inbox size={18} />
                <span>Inbox</span>
              </div>
              {inbox && inbox.filter((m: Message) => !m.is_read).length > 0 && (
                <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {inbox.filter((m: Message) => !m.is_read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setTab('sent'); setSelectedMessage(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'sent' ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/50'}`}
            >
              <Send size={18} />
              <span>Sent</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 card overflow-hidden flex flex-col relative min-w-0">
          
          {selectedMessage ? (
            // Message View
            <div className="flex flex-col h-full animate-in">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-dark-border">
                <button onClick={() => setSelectedMessage(null)} className="btn-ghost px-3 py-1.5 text-sm">
                  <ChevronRight size={16} className="rotate-180 inline mr-1" /> Back
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-dark-border">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-border flex items-center justify-center text-slate-600 font-bold">
                    {(tab === 'inbox' ? selectedMessage.sender?.full_name : selectedMessage.receiver?.full_name)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {tab === 'inbox' ? selectedMessage.sender?.full_name : selectedMessage.receiver?.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {selectedMessage.body.split('\\n').map((line: string, i: number) => (
                    <p key={i} className="min-h-[1rem]">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : !messages?.length ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Mail size={48} className="mb-4 opacity-20" />
                  <p>No messages found in {tab}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-dark-border">
                  {messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                        tab === 'inbox' && !msg.is_read
                          ? 'bg-brand-50/50 dark:bg-brand-500/5 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-dark-border/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
                        {(tab === 'inbox' ? msg.sender?.full_name : msg.receiver?.full_name)?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate pr-4 ${tab === 'inbox' && !msg.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                            {tab === 'inbox' ? msg.sender?.full_name : `To: ${msg.receiver?.full_name}`}
                          </p>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${tab === 'inbox' && !msg.is_read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                          {msg.subject}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !sending && setShowCompose(false)} />
          <div className="relative card w-full max-w-2xl shadow-2xl animate-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-dark-border flex-shrink-0">
              <h3 className="font-bold text-lg">New Message</h3>
              <button onClick={() => setShowCompose(false)} disabled={sending} className="btn-ghost p-1.5">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSend} className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">To:</label>
                <select
                  required
                  value={form.receiverId}
                  onChange={e => setForm(f => ({ ...f, receiverId: e.target.value }))}
                  className="input w-full"
                  disabled={sending}
                >
                  <option value="" disabled>Select a user...</option>
                  {usersData?.data
                    ?.filter((u: any) => u.id !== currentUser?.id)
                    .map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Subject:</label>
                <input
                  required
                  type="text"
                  placeholder="What is this about?"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="input font-semibold"
                  disabled={sending}
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[250px]">
                <textarea
                  required
                  placeholder="Write your message here..."
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  className="input flex-1 resize-none py-3"
                  disabled={sending}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-dark-border mt-auto">
                <button type="submit" disabled={sending || !form.receiverId || !form.subject || !form.body} className="btn-primary flex items-center gap-2 px-8">
                  <Send size={16} />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};
