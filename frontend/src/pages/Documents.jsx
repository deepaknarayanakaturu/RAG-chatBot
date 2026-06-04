import React, { useEffect, useState } from 'react';
import { documentService } from '../services/documentService';
import { UploadBox } from '../components/UploadBox';
import { FileText, Download, Trash2, Calendar, HardDrive, AlertCircle, Loader2 } from 'lucide-react';

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to fetch documents. Database connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? All associated vector chunk tables will be permanently removed.')) return;
    try {
      await documentService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse';
    }
  };

  return (
    <div className="space-y-8 p-6 text-slate-100 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Document Management</h2>
        <p className="text-sm text-slate-400">
          Upload and index PDF, DOCX, or TXT documents. Once processed, they become searchable in the chat page.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-900/40 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-base font-bold text-white mb-4">Index New Document</h3>
        <UploadBox onUploadSuccess={fetchDocuments} />
      </div>

      {/* Documents List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-6 border-b border-slate-850 flex items-center justify-between bg-slate-900/20">
          <h3 className="text-base font-bold text-white">Indexed Repositories</h3>
          <span className="text-xs text-slate-400 font-semibold uppercase">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} total
          </span>
        </div>

        {loading ? (
          <div className="flex h-36 items-center justify-center p-6">
            <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12">
            <HardDrive className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">No documents found. Drag & drop files above to parse them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Filename</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Chunks</th>
                  <th className="p-4">Indexed On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 pl-6 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-400 shrink-0" />
                        <span className="truncate max-w-xs" title={doc.filename}>{doc.filename}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{formatBytes(doc.file_size)}</td>
                    <td className="p-4 text-slate-450 font-semibold">{doc.chunk_count}</td>
                    <td className="p-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStatusStyle(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-1.5">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        download
                        className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Download Document"
                      >
                        <Download className="h-4.5 w-4.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/30 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Documents;
