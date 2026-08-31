import React from 'react';
import { X, Download, FileText, Printer } from 'lucide-react';
import { DocumentRecord } from '../../../types';
import { Modal } from '../../common/Modal';

interface DocumentViewerModalProps {
  document: DocumentRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document: doc, isOpen, onClose }) => {
  const isImage = doc.file_path.startsWith('data:image/') || doc.file_name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isPdf = doc.file_path.startsWith('data:application/pdf') || doc.file_name.endsWith('.pdf');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`معاينة المستند: ${doc.file_name}`}
      subtitle={`${doc.document_type} (الإصدار v${doc.version})`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Document Preview Content */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[400px] flex items-center justify-center overflow-hidden text-center">
          {isImage ? (
            <img 
              src={doc.file_path} 
              alt={doc.file_name}
              className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg border border-slate-700" 
            />
          ) : isPdf && doc.file_path.startsWith('data:') ? (
            <iframe 
              src={doc.file_path} 
              title={doc.file_name}
              className="w-full h-[60vh] rounded-lg border border-slate-700"
            />
          ) : (
            <div className="text-slate-300 space-y-3 p-8">
              <FileText className="w-16 h-16 text-emerald-400 mx-auto" />
              <div className="font-extrabold text-base">{doc.file_name}</div>
              <p className="text-xs text-slate-400">
                مستند مؤرشف معتمد - تم رفعه بواسطة: {doc.uploaded_by_name}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-mono text-slate-400">
            حجم الملف: {(doc.file_size / 1024).toFixed(1)} KB
          </span>

          <div className="flex items-center gap-2">
            <a
              href={doc.file_path}
              download={doc.file_name}
              className="px-4 py-2 rounded-xl bg-emerald-900 text-white font-extrabold flex items-center gap-1.5 shadow-sm hover:bg-emerald-800 transition"
            >
              <Download className="w-4 h-4 text-gold-400" />
              <span>تحميل المستند</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border font-bold hover:bg-slate-100 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
