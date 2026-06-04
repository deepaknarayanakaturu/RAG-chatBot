import React, { useEffect, useRef } from 'react';
import { User, Bot, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const ChatWindow = ({ messages, sources, loading, error }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900/40 p-6 space-y-6">
      {messages.length === 0 && !loading && (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Bot className="h-16 w-16 text-blue-500 animate-bounce mb-4" />
          <h3 className="text-lg font-semibold text-white">Ask your RAG Assistant</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Upload text documents or PDF/Word files in the **Documents** tab, then ask questions here to query them semantically.
          </p>
        </div>
      )}

      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id || index}
            className={`flex w-full gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar */}
            {!isUser && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <Bot className="h-5 w-5" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                isUser
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Show matching sources if they exist (typically mapped to the final message) */}
              {!isUser && index === messages.length - 1 && sources && sources.length > 0 && (
                <div className="mt-4 border-t border-slate-700/50 pt-3">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Retrieved Context Citations:
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {sources.map((source, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-700/40 text-xs hover:bg-slate-900 transition"
                      >
                        <div className="flex items-center justify-between gap-2 font-medium text-slate-300">
                          <span className="flex items-center gap-1.5 truncate">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                            <span className="truncate" title={source.document_name}>
                              {source.document_name}
                            </span>
                          </span>
                          <span className="shrink-0 text-emerald-400">
                            {(source.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="mt-1.5 text-slate-400 line-clamp-2 italic">
                          "{source.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        );
      })}

      {/* Loading Bubble */}
      {loading && (
        <div className="flex w-full gap-4 justify-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Bot className="h-5 w-5" />
          </div>
          <div className="bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl rounded-tl-none px-5 py-4 text-sm flex items-center gap-3">
            <div className="flex space-x-1.5">
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
            </div>
            <span className="text-xs text-slate-500">Searching indices...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-900/40 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
export default ChatWindow;
