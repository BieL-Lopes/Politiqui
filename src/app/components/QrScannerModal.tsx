import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface Props {
  onScan: (rawText: string) => void;
  onClose: () => void;
}

const READER_ID = 'titulo-qr-reader';

export function QrScannerModal({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false); // debounce: process only first successful scan

  useEffect(() => {
    const qr = new Html5Qrcode(READER_ID);
    scannerRef.current = qr;

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText: string) => {
        if (scannedRef.current) return;
        scannedRef.current = true;
        qr.stop().catch(() => {}).finally(() => onScan(decodedText));
      },
      () => {} // suppress individual frame errors
    ).catch(() => {
      // Camera not available or permission denied — close silently
      onClose();
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Escanear Título de Eleitor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* O html5-qrcode renderiza o vídeo dentro deste div */}
        <div id={READER_ID} className="w-full" />

        <p className="text-center text-sm text-gray-500 px-4 pb-4 pt-2">
          Aponte a câmera para o QR Code do título de eleitor
        </p>
      </div>
    </div>
  );
}
