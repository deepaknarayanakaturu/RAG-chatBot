import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const UploadBox = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    // Validate type
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setStatus('error');
      setErrorMsg('Unsupported extension. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('File size exceeds 15MB limit.');
      return;
    }

    setStatus('uploading');
    setFileDetails({ name: file.name, size: (file.size / 1024).toFixed(1) });

    try {
      // Import the dynamic service
      const { documentService } = await import('../services/documentService');
      await documentService.uploadDocument(file);
      setStatus('success');
      if (onUploadSuccess) onUploadSuccess();
      
      // Reset back to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setFileDetails(null);
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'File upload failed');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-950/20'
            : status === 'uploading'
            ? 'border-yellow-500/50 bg-yellow-950/5'
            : status === 'success'
            ? 'border-emerald-500/50 bg-emerald-950/5'
            : status === 'error'
            ? 'border-red-500/50 bg-red-950/5'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          disabled={status === 'uploading'}
        />

        {status === 'idle' && (
          <>
            <div className="mb-4 rounded-xl bg-slate-800 p-3 text-blue-400 border border-slate-700">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag & Drop file or <span className="text-blue-500">browse</span>
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              PDF, DOCX, or TXT (Max 15MB)
            </p>
          </>
        )}

        {status === 'uploading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-yellow-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">Uploading & Indexing...</p>
            {fileDetails && (
              <p className="mt-1 text-xs text-slate-400">
                {fileDetails.name} ({fileDetails.size} KB)
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500 italic">
              Parsing, extracting text, generating vector blocks...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-4 animate-bounce" />
            <p className="text-sm font-semibold text-slate-200">Document Processed successfully!</p>
            {fileDetails && (
              <p className="mt-1 text-xs text-slate-400">
                {fileDetails.name} has been indexed.
              </p>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center p-2">
            <XCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-sm font-semibold text-slate-200">Processing Failed</p>
            <p className="mt-1 text-xs text-red-400 max-w-sm">{errorMsg}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStatus('idle');
              }}
              className="mt-4 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadBox;
