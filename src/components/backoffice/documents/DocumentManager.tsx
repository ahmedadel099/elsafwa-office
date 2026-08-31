import React, { useState } from 'react';
import { 
  FolderKanban, 
  UploadCloud, 
  Scan, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  File, 
  Trash2, 
  Eye, 
  Download,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, DocumentRecord } from '../../../types';
import { formatDateArabic } from '../../../utils/formatters';
import { ScannerModal } from './ScannerModal';
import { DocumentViewerModal } from './DocumentViewerModal';

interface DocumentManagerProps {
  request: RequestRecord;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ request }) => {
  const { serviceTypes, getRequestDocuments, uploadDocument, deleteDocument } = useData();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const service = serviceTypes.find(s => s.id === request.service_type_id);
  const docs = getRequestDocuments(request.id);

  const [selectedDocType, setSelectedDocType] = useState<string>(service?.required_documents[0] || 'صورة بطاقة الرقم القومي');
  const [fileNameInput, setFileNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentRecord | null>(null);

  // Missing documents checklist check
  const requiredDocs = service?.required_documents || [];
  const uploadedDocTypes = docs.map(d => d.document_type);
  const missingDocs = requiredDocs.filter(reqDoc => !uploadedDocTypes.includes(reqDoc));
  const completionPercentage = requiredDocs.length === 0 ? 100 : Math.round(((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100);

  const handleRealFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fileNameInput.trim() || selectedFile?.name || `${selectedDocType.replace(/\s+/g, '_')}_مرفق.pdf`;

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        uploadDocument({
          request_id: request.id,
          document_type: selectedDocType,
          file_name: cleanName,
          file_path: dataUrl || '/uploads/file.pdf',
          file_size: selectedFile.size,
          uploaded_by: currentUser?.id || 'usr-admin'
        });

        setSelectedFile(null);
        setFileNameInput('');
      };
      reader.readAsDataURL(selectedFile);
    } else {
      uploadDocument({
        request_id: request.id,
        document_type: selectedDocType,
        file_name: cleanName,
        file_path: '/uploads/req-file.pdf',
        file_size: 1250000,
        uploaded_by: currentUser?.id || 'usr-admin'
      });
      setFileNameInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Checklist Match Progress Banner */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {t('مُطابق مصلحي للمستندات المطلوبة مسبقاً', 'Required Document Checklist Inspector')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t(`نسبة استيفاء الأوراق المطلوبة: ${completionPercentage}%`, `Checklist Completion: ${completionPercentage}%`)}
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${completionPercentage === 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {/* Missing Documents Amber Banner */}
        {missingDocs.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t('ينقص الملف المستندات التالية لاتمام تقديم المعاملة:', 'Missing Required Documents:')}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {missingDocs.map((mDoc, idx) => (
                <span key={idx} className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
                  ⚠️ {mDoc}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('تم استيفاء كافة المستندات المطلوبة لهذه الخدمة بنجاح!', 'All required documents successfully archived!')}</span>
          </div>
        )}
      </div>

      {/* Upload & Scanner Action Controls */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            {t('رفع أو مسح ضوئي جديد لمستندات المعاملة', 'Upload or Scan Document')}
          </h4>

          {/* Scanner Tool Trigger Button */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400 text-slate-950 font-extrabold text-xs hover:bg-gold-300 transition shadow-sm"
          >
            <Scan className="w-4 h-4 text-slate-950" />
            <span>{t('ربط الماسح الضوئي / الكاميرا', 'Open Scanner Tool')}</span>
          </button>
        </div>

        {/* Real File Drag-and-Drop Form */}
        <form onSubmit={handleRealFileUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('تصنيف المستند', 'Document Category')} *
              </label>
              <select
                value={selectedDocType}
                onChange={e => setSelectedDocType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              >
                {requiredDocs.map((rDoc, idx) => (
                  <option key={idx} value={rDoc}>⭐ {rDoc} (مطلوب)</option>
                ))}
                <option value="صورة بطاقة الرقم القومي">صورة بطاقة الرقم القومي</option>
                <option value="عقد الملكية / الإيجار">عقد الملكية / الإيجار</option>
                <option value="الرسومات الهندسية والكروكي">الرسومات الهندسية والكروكي</option>
                <option value="إيصال سداد الرسوم">إيصال سداد الرسوم</option>
                <option value="موافقة الجهة الحكومية">موافقة الجهة الحكومية</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('تسمية مخصصة للملف (اختياري)', 'Custom Label')}
              </label>
              <input
                type="text"
                placeholder="e.g. الرسم_الهندسي_المعدل.pdf"
                value={fileNameInput}
                onChange={e => setFileNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Real Drag-and-Drop Zone */}
          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center hover:border-emerald-600 transition">
            <input
              type="file"
              id={`file-input-${request.id}`}
              accept="image/*,application/pdf"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor={`file-input-${request.id}`} className="cursor-pointer space-y-2 block">
              <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-extrabold text-slate-900 dark:text-white">
                {selectedFile ? selectedFile.name : t('اضغط هنا لاختيار ملف من الجهاز (PDF / PNG / JPG)', 'Click or drag real file to upload')}
              </div>
              {selectedFile && (
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  حجم الملف: {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              )}
            </label>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold shadow-md transition"
            >
              <UploadCloud className="w-4 h-4 text-gold-400" />
              <span>{t('رفع وأرشفة الملف بالطلب', 'Upload & Attach File')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          {t('المستندات المؤرشفة بالطلب', 'Archived Documents')} ({docs.length})
        </h4>

        {docs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            {t('لا يوجد مستندات مؤرشفة بهذا الطلب حتى الآن', 'No archived documents')}
          </div>
        ) : (
          docs.map(doc => (
            <div key={doc.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{doc.file_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      v{doc.version}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                    {doc.document_type} • بواسطة: {doc.uploaded_by_name} • {formatDateArabic(doc.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                  title={t('معاينة الملف', 'Preview')}
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={doc.file_path}
                  download={doc.file_name}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                  title={t('تحميل الملف', 'Download')}
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    if (confirm(t('حذف هذا المستند من الأرشيف؟', 'Delete document from archive?'))) {
                      deleteDocument(doc.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 transition"
                  title={t('حذف', 'Delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scanner Device Tool Modal */}
      {isScannerOpen && (
        <ScannerModal
          requestId={request.id}
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScannedComplete={(scanned) => {
            uploadDocument({
              request_id: request.id,
              document_type: scanned.document_type,
              file_name: scanned.file_name,
              file_path: scanned.file_path,
              file_size: 950000,
              uploaded_by: currentUser?.id || 'usr-admin'
            });
          }}
        />
      )}

      {/* Document Previewer Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
};
