import React from 'react';
import { Files, Database, MessageSquare, MessagesSquare } from 'lucide-react';

export const DashboardCards = ({ stats }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const cards = [
    {
      title: 'Total Documents',
      value: stats?.total_documents || 0,
      icon: Files,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Vector Storage Size',
      value: formatBytes(stats?.total_size_bytes || 0),
      icon: Database,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Chat Sessions',
      value: stats?.total_chats || 0,
      icon: MessageSquare,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Messages Logs',
      value: stats?.total_messages || 0,
      icon: MessagesSquare,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition hover:border-slate-700/80 hover:bg-slate-900"
          >
            <div className={`rounded-xl p-3 border ${card.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                {card.title}
              </span>
              <span className="mt-1 text-2xl font-bold text-white block">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default DashboardCards;
