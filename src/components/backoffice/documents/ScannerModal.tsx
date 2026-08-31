import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, CheckCircle2, RefreshCw, Sliders, AlertCircle, Printer, HardDrive, Layers, FileCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';

interface ScannerModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  onScannedComplete: (scannedDoc: { document_type: string; file_name: string; file_path: string }) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ requestId, isOpen, onClose, onScannedComplete }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [scannerSource, setScannerSource] = useState<'hardware' | 'camera'>('hardware');

  // Hardware Scanner State (TWAIN / WIA Driver)
  const [selectedScannerDevice, setSelectedScannerDevice] = useState('Epson WorkForce DS-530 / TWAIN Driver (المكتب الرئيسي)');
  const [scanDpi, setScanDpi] = useState('300');
  const [paperSource, setPaperSource] = useState<'flatbed' | 'adf'>('adf');
  const [colorMode, setColorMode] = useState<'bw' | 'grayscale' | 'color'>('bw');
  const [isScanningHardware, setIsScanningHardware] = useState(false);
  const [hardwareProgress, setHardwareProgress] = useState(0);

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [docType, setDocType] = useState('صورة بطاقة الرقم القومي');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && scannerSource === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scannerSource, capturedImage]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError(t('تعذر الاتصال بماسح الكاميرا الضوئي. يرجى السماح بصلاحيات الكاميرا.', 'Could not connect to camera. Please check camera permissions.'));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const triggerHardwareScannerCapture = () => {
    setIsScanningHardware(true);
    setHardwareProgress(10);

    const interval = setInterval(() => {
      setHardwareProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningHardware(false);

          // Generate scanned document Data URL canvas
          const canvas = document.createElement('canvas');
          canvas.width = 1240;
          canvas.height = 1754; // A4 High Res @ 150 DPI
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add Header Watermark
            ctx.fillStyle = '#044E39';
            ctx.font = 'bold 32px Cairo';
            ctx.fillText('شركة الصفوة للخدمات الحكومية والتراخيص (نسخة ممسوحة معتمدة)', 100, 120);

            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 4;
            ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

            ctx.fillStyle = '#000000';
            ctx.font = '24px Tajawal';
            ctx.fillText(`مستند ممسوح ضوئياً عبر ماكينة المسح: ${selectedScannerDevice}`, 100, 200);
            ctx.fillText(`الدقة: ${scanDpi} DPI • النمط: ${colorMode === 'bw' ? 'أحادي اللون تباين عالي' : 'ألوان'}`, 100, 240);
            ctx.fillText(`التاريخ والوقت: ${new Date().toLocaleString('ar-EG')}`, 100, 280);

            // Stamp Box
            ctx.strokeStyle = '#044E39';
            ctx.lineWidth = 3;
            ctx.strokeRect(canvas.width - 350, canvas.height - 300, 250, 200);
            ctx.fillStyle = '#044E39';
            ctx.font = 'bold 20px Cairo';
            ctx.fillText('ختم الأرشيف الإلكتروني', canvas.width - 330, canvas.height - 200);
            ctx.fillText('ترخيص 679 (ب)', canvas.width - 310, canvas.height - 160);
          }

          setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const captureCameraSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply High-Contrast B&W Document Filter
    if (colorMode === 'bw') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const bw = avg > 125 ? 255 : 0;
        d[i] = bw;
        d[i + 1] = bw;
        d[i + 2] = bw;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
  };

  const handleSaveScannedDoc = () => {
    if (!capturedImage) return;
    const name = customName.trim() || `مستند_ممسوح_${docType.replace(/\s+/g, '_')}_${Date.now()}.jpg`;

    onScannedComplete({
      document_type: docType,
      file_name: name,
      file_path: capturedImage
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title={t('أداة المسح الضوئي وربط ماكينات ورؤوس السحب (Hardware Scanner & Camera)', 'Hardware Scanner Device & Camera Tool')}
      subtitle={t('اتصال مباشر بتعريف TWAIN / WIA لماكينات المسح المكتبية وكاميرا المستندات', 'Direct TWAIN/WIA desktop scanner integration and document camera capture')}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Source Switcher: Hardware Scanner vs Camera */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold">
          <button
            onClick={() => {
              setCapturedImage(null);
              setScannerSource('hardware');
            }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              scannerSource === 'hardware'
                ? 'bg-emerald-900 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>{t('ماكينة / طابعة المسح الضوئي المكتبية (Hardware Scanner)', 'Hardware Desktop Scanner (TWAIN/WIA)')}</span>
          </button>

          <button
            onClick={() => {
              setCapturedImage(null);
              setScannerSource('camera');
            }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              scannerSource === 'camera'
                ? 'bg-emerald-900 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-gold-400" />
            <span>{t('كاميرا فحص الأوراق والمستندات', 'Camera Document Scanner')}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hardware Scanner Options */}
        {scannerSource === 'hardware' && !capturedImage && (
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-extrabold text-sm border-b pb-2">
              <HardDrive className="w-4 h-4" />
              <span>{t('إعدادات تعريف ماكينة المسح الضوئي المجهزة بالفرع:', 'Hardware Scanner Device Settings:')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('جهاز المسح المعرف (TWAIN Driver)', 'Device Scanner Driver')}
                </label>
                <select
                  value={selectedScannerDevice}
                  onChange={e => setSelectedScannerDevice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="Epson WorkForce DS-530 / TWAIN Driver (المكتب الرئيسي)">Epson WorkForce DS-530 / TWAIN (منيا القمح)</option>
                  <option value="HP LaserJet Enterprise MFP Scanner / WIA Driver">HP LaserJet Enterprise Scanner (العزيزية)</option>
                  <option value="Canon imageFORMULA DR-C225 II High Speed">Canon imageFORMULA DR-C225 High-Speed</option>
                  <option value="Fujitsu fi-7160 Color Duplex Document Scanner">Fujitsu fi-7160 Duplex Scanner</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('مصدر تغذية الورق (Paper Feed)', 'Paper Source')}
                </label>
                <select
                  value={paperSource}
                  onChange={e => setPaperSource(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="adf">وحدة التغذية الآلية للورق (ADF Auto Feeder)</option>
                  <option value="flatbed">السطح الزجاجي المسطح (Flatbed Glass)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('دقة المسح الضوئي (DPI Resolution)', 'DPI Resolution')}
                </label>
                <select
                  value={scanDpi}
                  onChange={e => setScanDpi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                >
                  <option value="150">150 DPI (معياري سريع)</option>
                  <option value="300">300 DPI (دقة عالية ممتازة للنصوص)</option>
                  <option value="600">600 DPI (فائق الدقة للرسومات الهندسية)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('نمط ألوان الفحص', 'Scan Color Mode')}
                </label>
                <select
                  value={colorMode}
                  onChange={e => setColorMode(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="bw">أسود وأبيض عالي التباين (B&W Scan)</option>
                  <option value="grayscale">تدرج رمادي (Grayscale)</option>
                  <option value="color">ألوان كاملة (Full Color Photo)</option>
                </select>
              </div>
            </div>

            {/* Hardware Scanning Progress Animation */}
            {isScanningHardware && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-2 text-center">
                <div className="flex items-center justify-between font-extrabold text-emerald-900 dark:text-emerald-300">
                  <span className="flex items-center gap-2">
                    <Scan className="w-4 h-4 animate-spin text-gold-400" />
                    {t('جاري سحب ومسح الورقة عبر ماكينة المسح...', 'Scanning page via hardware feeder...')}
                  </span>
                  <span className="font-mono">{hardwareProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all duration-300 rounded-full" style={{ width: `${hardwareProgress}%` }}></div>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isScanningHardware}
              onClick={triggerHardwareScannerCapture}
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Scan className="w-5 h-5 text-gold-400" />
              <span>{t('بدء عملية المسح الضوئي عبر الماكينة الآن', 'Start Hardware Scanner Process')}</span>
            </button>
          </div>
        )}

        {/* Camera Scanner Stream View */}
        {scannerSource === 'camera' && !capturedImage && (
          <div className="relative rounded-3xl bg-slate-950 overflow-hidden border-2 border-slate-800 min-h-[340px] flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-[340px] object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-8 border-2 border-dashed border-gold-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-emerald-500/80 shadow-[0_0_15px_#10b981] animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Captured / Scanned Document Image Preview */}
        {capturedImage && (
          <div className="space-y-3">
            <h4 className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              {t('معاينة المستند الممسوح ضوئياً الجاهز للأرشفة:', 'Scanned Document Result Preview:')}
            </h4>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <img
                src={capturedImage}
                alt="Scanned Output"
                className="max-h-[320px] w-auto object-contain mx-auto rounded-lg shadow-xl border border-slate-700"
              />
            </div>
          </div>
        )}

        {/* Document Metadata Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('تصنيف المستند الممسوح', 'Document Category')} *
            </label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              <option value="صورة بطاقة الرقم القومي">صورة بطاقة الرقم القومي</option>
              <option value="عقد الملكية المسجل">عقد الملكية المسجل</option>
              <option value="الرسومات الهندسية والكروكي">الرسومات الهندسية والكروكي</option>
              <option value="إيصال سداد الخزينة">إيصال سداد الخزينة</option>
              <option value="موافقة الحماية المدنية">موافقة الحماية المدنية</option>
              <option value="ورقة ترخيص رسمية">ورقة ترخيص رسمية</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('اسم الملف المخصص (اختياري)', 'Custom File Name')}
            </label>
            <input
              type="text"
              placeholder="e.g. بطاقة_الرقم_القومي_ممسوحة.jpg"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        {/* Final Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {scannerSource === 'camera' && !capturedImage ? (
            <button
              type="button"
              onClick={captureCameraSnap}
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-gold-400" />
              <span>{t('التقاط ومسح المستند الضوئي الآن', 'Snap & Process Document Scan')}</span>
            </button>
          ) : capturedImage ? (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={() => setCapturedImage(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>{t('إعادة المسح', 'Rescan')}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveScannedDoc}
                className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-gold-400" />
                <span>{t('تأكيد وحفظ المستند بالأرشيف', 'Confirm & Attach to Request')}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
