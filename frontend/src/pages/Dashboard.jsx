import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { documentService } from '../services/documentService';
import { DashboardCards } from '../components/DashboardCards';
import { Charts } from '../components/Charts';
import { PlusCircle, MessageSquare, ArrowRight, Loader2, AlertCircle, FileText } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsData = await dashboardService.getStats();
        setStats(statsData);

        const docs = await documentService.getDocuments();
        setRecentDocs(docs.slice(0, 3));
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-slate-400 text-sm">Aggregating analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 text-slate-100 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Operations</h2>
          <p className="text-sm text-slate-400">
            Overview of database indexing, storage consumption, and client usage telemetry.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/documents"
            className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Upload File
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500"
          >
            <MessageSquare className="h-4 w-4" />
            Start Chat
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-900/40 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      <DashboardCards stats={stats} />

      {/* Charts Grid */}
      <Charts stats={stats} />

      {/* Bottom Grid: Recent Documents */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
          <h3 className="text-base font-bold text-white">Recently Indexed Documents</h3>
          <Link
            to="/documents"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-400 transition"
          >
            Manage Files
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            <Link to="/documents" className="mt-3 text-xs text-blue-500 font-semibold hover:underline">
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-800 p-2 border border-slate-700 text-slate-300">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">{doc.filename}</span>
                    <span className="text-xs text-slate-500 block uppercase font-medium">
                      {doc.file_type} • {(doc.file_size / 1024).toFixed(0)} KB • Status: {doc.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      doc.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : doc.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
