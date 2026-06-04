import React, { useState } from 'react';
import { Send, Filter } from 'lucide-react';

export const ChatInput = ({ onSendMessage, documents, disabled }) => {
  const [text, setText] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    
    // Pass message and active doc filter ids
    onSendMessage(text, selectedDocs.length > 0 ? selectedDocs : null);
    setText('');
  };

  const handleToggleDoc = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950 p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-3">
        {/* Document Filter Bar */}
        {showFilter && documents && documents.length > 0 && (
          <div className="rounded-xl bg-slate-900 border border-slate-850 p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              Search Target Filter: (Limit query to selected documents)
            </span>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {documents.map((doc) => {
                const isSelected = selectedDocs.includes(doc.id);
                return (
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => handleToggleDoc(doc.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 text-blue-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {doc.filename}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Toggle Filter Button */}
          {documents && documents.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className={`rounded-xl p-3 border transition ${
                showFilter || selectedDocs.length > 0
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Filter by documents"
            >
              <Filter className="h-5 w-5" />
            </button>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            placeholder={
              selectedDocs.length > 0
                ? `Querying ${selectedDocs.length} selected document(s)...`
                : "Ask a question about your indexed documents..."
            }
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="rounded-xl bg-blue-600 p-3.5 text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 active:scale-95 disabled:opacity-55 disabled:pointer-events-none"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
export default ChatInput;
