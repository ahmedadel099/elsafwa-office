import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  Link2, 
  Scan, 
  File, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, RequestStep, DocumentRecord } from '../../../types';
import { Modal } from '../../common/Modal';
import { ScannerModal } from '../documents/ScannerModal';
import { formatDateArabic } from '../../../utils/formatters';

interface StepDocAttachModalProps {
  request: RequestRecord;
  step: RequestStep;
  targetDocType?: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const StepDocAttachModal: React.FC<StepDocAttachModalProps> = ({
  request,
  step,
  targetDocType = '',
  isOpen,
  onClose,
  onCompleted
}) => {
  const { getRequestDocuments, uploadDocument, linkDocumentToStep } = useData();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [docType, setDocType] = useState(targetDocType || step.required_documents[0] || 'مستند إجرائي');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Existing request documents
  const allRequestDocs = getRequestDocuments(request.id);
  const unlinkedDocs = allRequestDocs.filter(
    d => !step.attached_document_ids?.includes(d.id)
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customFileName.trim() || selectedFile?.name || `${docType.replace(/\s+/g, '_')}_مرفق.pdf`;

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        uploadDocument({
          request_id: request.id,
          step_id: step.id,
          document_type: docType,
          file_name: finalName,
          file_path: dataUrl || '/uploads/file.pdf',
          file_size: selectedFile.size,
          uploaded_by: currentUser?.id || 'usr-admin'
        });
        onCompleted?.();
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } else {
      uploadDocument({
        request_id: request.id,
        step_id: step.id,
        document_type: docType,
        file_name: finalName,
        file_path: '/uploads/step-doc.pdf',
        file_size: 980000,
        uploaded_by: currentUser?.id || 'usr-admin'
      });
      onCompleted?.();
      onClose();
    }
  };

  const handleLinkDoc = (docId: string) => {
    linkDocumentToStep(step.id, docId);
    onCompleted?.();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('استيفاء وأرشفة مستند للخطوة التنفيذية', 'Attach Document to Workflow Step')}
        subtitle={`${step.title} (${request.tracking_ref})`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-sans">
          {/* Target Doc Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>{t('المستند المطلوب:', 'Target Document:')} <strong>{docType}</strong></span>
            </div>
            <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded-lg">
              خطوة {step.order}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`py-2 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                mode === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>{t('رفع أو مسح ضوئي جديد', 'Upload or Scan')}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('link')}
              className={`py-2 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                mode === 'link'
                  ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-4 h-4 text-blue-600" />
              <span>{t('ربط من مستندات الطلب', 'Link from Archive')} ({unlinkedDocs.length})</span>
            </button>
          </div>

          {/* Mode 1: Upload New Document */}
          {mode === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {t('بيانات الملف وتصنيفه:', 'File Meta')}
                </span>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-400 text-slate-950 font-black text-xs hover:bg-gold-300 transition shadow-sm"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{t('تشغيل الماسح الضوئي / الكاميرا', 'Open Scanner Tool')}</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('تصنيف المستند المطلوب بالخطوة', 'Document Type')} *
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  {step.required_documents.map((rDoc, idx) => (
                    <option key={idx} value={rDoc}>⭐ {rDoc} ({t('مطلوب للخطوة', 'Required for step')})</option>
                  ))}
                  <option value="صورة بطاقة الرقم القومي">صورة بطاقة الرقم القومي</option>
                  <option value="عقد الملكية المسجل">عقد الملكية المسجل</option>
                  <option value="الرسم الهندسي المعتمد">الرسم الهندسي المعتمد</option>
                  <option value="موافقة الحماية المدنية">موافقة الحماية المدنية</option>
                  <option value="إيصال سداد الرسوم">إيصال سداد الرسوم</option>
                  <option value="مستند إجرائي إضافي">مستند إجرائي إضافي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('تسمية الملف (اختياري)', 'File Label (Optional)')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. أصل_العقد_معتمد.pdf"
                  value={customFileName}
                  onChange={e => setCustomFileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              {/* Drag and Drop Zone */}
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center hover:border-emerald-600 transition">
                <input
                  type="file"
                  id={`step-file-${step.id}`}
                  accept="image/*,application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor={`step-file-${step.id}`} className="cursor-pointer space-y-2 block">
                  <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {selectedFile ? selectedFile.name : t('اضغط هنا لاختيار ملف من جهازك (PDF / صورة)', 'Click or drag file to upload')}
                  </div>
                  {selectedFile && (
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      حجم الملف: {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('إلغاء', 'Cancel')}
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black shadow-md transition"
                >
                  <UploadCloud className="w-4 h-4 text-gold-400" />
                  <span>{t('رفع وربط المستند بالخطوة', 'Upload & Link')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Link from Existing Request Documents */}
          {mode === 'link' && (
            <div className="space-y-3">
              <p className="text-slate-500 font-medium">
                {t('اختر مستنداً تم رفعه مسبقاً في أرشيف هذا الطلب لربطه مباشرة بهذه الخطوة:', 'Select an already uploaded document from this request archive:')}
              </p>

              {unlinkedDocs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {t('لا توجد مستندات غير مرتبطة بأرشيف هذا الطلب. يمكنك رفع مستند جديد مباشرة من التبويب أعلاه.', 'No unlinked documents found in request archive')}
                </div>
              ) : (
                <div className="space-y-2 max-h-[45vh] overflow-y-auto">
                  {unlinkedDocs.map(doc => (
                    <div 
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-500 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                          <File className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {doc.file_name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {doc.document_type} • {formatDateArabic(doc.created_at)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLinkDoc(doc.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition hover:scale-105"
                      >
                        <Plus className="w-3.5 h-3.5 text-gold-400" />
                        <span>{t('ربط بالخطوة', 'Link to Step')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Scanner Tool Sub-Modal */}
      {isScannerOpen && (
        <ScannerModal
          requestId={request.id}
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScannedComplete={(scanned) => {
            uploadDocument({
              request_id: request.id,
              step_id: step.id,
              document_type: docType,
              file_name: scanned.file_name,
              file_path: scanned.file_path,
              file_size: 950000,
              uploaded_by: currentUser?.id || 'usr-admin'
            });
            setIsScannerOpen(false);
            onCompleted?.();
            onClose();
          }}
        />
      )}
    </>
  );
};
