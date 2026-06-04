import React, { useEffect, useState } from 'react';
import { chatService } from '../services/chatService';
import { documentService } from '../services/documentService';
import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { MessageSquare, Plus, Trash2, ArrowRight, Bot, AlertCircle } from 'lucide-react';

export const Chat = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load sessions and documents on mount
  useEffect(() => {
    const initPage = async () => {
      try {
        setSessionsLoading(true);
        const fetchedSessions = await chatService.getSessions();
        setSessions(fetchedSessions);

        const fetchedDocs = await documentService.getDocuments();
        setDocuments(fetchedDocs.filter((d) => d.status === 'completed'));

        if (fetchedSessions.length > 0) {
          handleSelectSession(fetchedSessions[0].id);
        }
      } catch (err) {
        setError('Initialization failed. Check your database connection.');
      } finally {
        setSessionsLoading(false);
      }
    };
    initPage();
  }, []);

  const handleSelectSession = async (sessionId) => {
    setActiveSession(sessionId);
    setMessages([]);
    setSources([]);
    setError('');
    
    try {
      const msgs = await chatService.getMessages(sessionId);
      setMessages(msgs);
    } catch (err) {
      setError('Failed to load session messages.');
    }
  };

  const handleCreateSession = async () => {
    try {
      const newSess = await chatService.createSession();
      setSessions((prev) => [newSess, ...prev]);
      handleSelectSession(newSess.id);
    } catch (err) {
      setError('Failed to create new chat session.');
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await chatService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession === sessionId) {
        setMessages([]);
        setSources([]);
        setActiveSession(null);
      }
    } catch (err) {
      setError('Failed to delete chat session.');
    }
  };

  const handleSendMessage = async (content, documentIds) => {
    if (!activeSession) return;
    
    // Add user message locally
    const userMsg = { role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const response = await chatService.sendMessage(activeSession, content, documentIds);
      
      // Update session title locally if it was "New Chat"
      const session = sessions.find(s => s.id === activeSession);
      if (session && session.title === 'New Chat') {
        setSessions(prev => prev.map(s => s.id === activeSession ? { ...s, title: content.slice(0, 30) } : s));
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }]);
      setSources(response.sources);
    } catch (err) {
      setError('RAG query engine failed to resolve. Check API key status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] text-slate-100 overflow-hidden">
      {/* Session History Sidebar */}
      <div className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950 sm:flex">
        {/* Actions */}
        <div className="p-4">
          <button
            onClick={handleCreateSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600/10 border border-blue-500/20 px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition"
          >
            <Plus className="h-4.5 w-4.5" />
            New Chat Thread
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1.5">
          {sessionsLoading ? (
            <div className="flex justify-center p-4">
              <span className="text-xs text-slate-500 animate-pulse">Loading threads...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-600">
              No chat histories. Click 'New Chat' to start.
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSession;
              return (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess.id)}
                  className={`group flex items-center justify-between gap-2 rounded-xl px-3.5 py-3 cursor-pointer transition ${
                    isActive
                      ? 'bg-slate-900 border border-slate-850 text-white'
                      : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                    <span className="text-sm font-medium truncate">{sess.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-slate-950/20">
        {activeSession ? (
          <>
            <ChatWindow
              messages={messages}
              sources={sources}
              loading={loading}
              error={error}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              documents={documents}
              disabled={loading}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 bg-slate-900/10">
            <Bot className="h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-white">Select a Chat Session</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">
              Pick an existing session from the history or start a new thread to query documents.
            </p>
            <button
              onClick={handleCreateSession}
              className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              Start New Session
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Chat;
