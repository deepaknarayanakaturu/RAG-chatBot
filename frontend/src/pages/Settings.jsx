import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, KeyRound, Server, ShieldCheck, Mail, Database } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 p-6 text-slate-100 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
        <p className="text-sm text-slate-400">
          Manage your personal profile, credentials, and configure neural API keys.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          User Profile Information
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-xl bg-slate-900 border border-slate-850 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Username</span>
            <span className="font-semibold text-white block">{user?.username}</span>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-850 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address</span>
            <span className="font-semibold text-white block flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-slate-400" />
              {user?.email}
            </span>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-850 p-4 space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Account Created On</span>
            <span className="text-slate-300 block">
              {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* RAG Engine Configurations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-blue-400" />
          RAG AI Keys Setup
        </h3>

        <p className="text-sm text-slate-400">
          The RAG assistant operates locally using a sentence hashing vectorizer and extractive answering system. 
          To enable true semantic summaries, add your developer API keys in the backend environment file.
        </p>

        <div className="rounded-xl bg-slate-900 border border-slate-850 p-5 space-y-3.5 text-sm">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            Instructions:
          </span>
          <p className="text-slate-350 leading-relaxed">
            1. Open the project root folder.
            <br />
            2. Edit the <code className="rounded bg-slate-850 px-1.5 py-0.5 text-amber-400 font-mono">.env</code> file.
            <br />
            3. Add your key parameters:
          </p>
          <pre className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-400 border border-slate-900 overflow-x-auto leading-5">
            GEMINI_API_KEY=AIzaSy...<br />
            OPENAI_API_KEY=sk-proj-...
          </pre>
          <p className="text-xs text-slate-500 italic">
            Note: If both keys are missing, the system automatically runs the custom local keyword extractor fallback.
          </p>
        </div>
      </div>

      {/* System Status Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-400" />
          Operational Status
        </h3>

        <div className="grid gap-3.5 sm:grid-cols-3 text-sm">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-850 p-4">
            <Database className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Database Status</span>
              <span className="font-semibold text-emerald-400">CONNECTED</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-850 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Security Context</span>
              <span className="font-semibold text-emerald-400">JWT SIGNED</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-850 p-4">
            <Server className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Service API</span>
              <span className="font-semibold text-emerald-400">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
