import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Upload, Trash2, Download, ShieldCheck, HelpCircle, Eye, AlertTriangle } from 'lucide-react';

interface HealthReport {
  id: string;
  name: string;
  type: string; // 'application/pdf' or image types
  size: number;
  date: string;
  data: string; // Base64 content
}

export const HealthReports: React.FC = () => {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('medicare_reports');
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load reports from localStorage:', err);
    }
  }, []);

  // Save to localStorage
  const saveReports = (newReports: HealthReport[]) => {
    try {
      localStorage.setItem('medicare_reports', JSON.stringify(newReports));
      setReports(newReports);
    } catch (err) {
      console.error(err);
      setError('Storage limit reached! Please delete older reports before uploading new ones.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError('');
    setSuccess('');

    // Check file size (limit to 1MB for localStorage safety)
    const MAX_SIZE = 1024 * 1024; // 1MB
    if (file.size > MAX_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 1MB to ensure offline local storage.`);
      return;
    }

    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF reports and JPG/PNG images/prescriptions are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        const newReport: HealthReport = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          date: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          data: base64Data
        };

        const updated = [newReport, ...reports];
        saveReports(updated);
        setSuccess(`Successfully uploaded and stored "${file.name}" locally.`);
      }
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDelete = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
    setSuccess('Report deleted successfully.');
  };

  const handleView = (report: HealthReport) => {
    // Open Base64 document in a new window/tab
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(
        `<iframe src="${report.data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    } else {
      setError('Popup blocked! Please allow popups to view files.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Platform notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
        <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Secure Local Processing</h4>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
            Your medical records and prescriptions are stored **exclusively in your browser's local sandbox**. 
            No files are uploaded to our servers, keeping your personal health information entirely private.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all relative ${
          dragActive 
            ? 'border-blue-500 bg-blue-50/40 scale-[0.99]' 
            : 'border-slate-300 hover:border-blue-400 bg-white shadow-xs'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-3">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-full border border-blue-100/50">
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Upload Health Reports & Prescriptions</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Drag and drop your files here, or <span className="text-blue-600 font-bold hover:underline">browse files</span>
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Supports PDF, JPEG, and PNG. Maximum size 1MB.
            </p>
          </div>
        </label>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Document Directory */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Your Local Medical Directory
        </h3>
        
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div 
                key={report.id}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex gap-4 hover:border-slate-200/80 transition-all items-start group relative overflow-hidden"
              >
                {/* File icon type */}
                <div className={`p-3 rounded-xl shrink-0 bg-white border border-slate-100/70 shadow-2xs ${
                  report.type === 'application/pdf' ? 'text-red-500' : 'text-blue-500'
                }`}>
                  {report.type === 'application/pdf' ? (
                    <FileText className="h-6 w-6" />
                  ) : (
                    <ImageIcon className="h-6 w-6" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-sm font-bold text-slate-800 truncate" title={report.name}>
                    {report.name}
                  </h4>
                  <div className="text-[10px] text-slate-450 font-semibold space-y-0.5 mt-1">
                    <div>Size: {formatBytes(report.size)}</div>
                    <div>Uploaded: {report.date}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleView(report)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-2xs"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <a
                    href={report.data}
                    download={report.name}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-2xs"
                    title="Download File"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-2xs"
                    title="Delete File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 border border-slate-100/50 rounded-2xl bg-slate-50/30">
            <HelpCircle className="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Saved Documents</h4>
            <p className="text-xs text-slate-450 font-semibold mt-1">Upload files using the drag zone above. They will appear here for immediate access.</p>
          </div>
        )}
      </div>
    </div>
  );
};
