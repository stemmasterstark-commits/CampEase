'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  userId?: string;
  onScanSuccess?: (decodedText: string) => void;
  onRideStarted?: (rideId: string) => void;
}

export default function QRScanner({ userId, onScanSuccess, onRideStarted }: QRScannerProps) {
  const [scanError, setScanError] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const qrCodeId = 'qr-reader';
    const html5Qrcode = new Html5Qrcode(qrCodeId);
    html5QrcodeRef.current = html5Qrcode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Request environment (back) camera directly and keep it running
    html5Qrcode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Stop camera scanning once a code is successfully captured
          html5Qrcode.stop().then(() => {
            if (onScanSuccess) onScanSuccess(decodedText);
            if (onRideStarted) onRideStarted(decodedText);
          });
        },
        (errorMessage) => {
          // Silently ignore frame parse errors while scanning
        }
      )
      .catch((err) => {
        console.error('Camera access error:', err);
        setScanError('Unable to start camera. Please ensure camera permissions are granted.');
      });

    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((err) => console.error(err));
      }
    };
  }, [onScanSuccess, onRideStarted]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-white">
      <h3 className="text-lg font-bold mb-2">Scan Cycle QR Code</h3>
      <p className="text-sm text-slate-400 mb-4">Point your camera at the QR code on the cycle</p>

      <div id="qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden" />

      {scanError && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
          {scanError}
        </div>
      )}
    </div>
  );
}