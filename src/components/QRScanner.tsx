'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  userId?: string;
  onScanSuccess?: (decodedText: string) => void;
  onRideStarted?: (rideId: string) => void;
}

export default function QRScanner({ userId, onScanSuccess, onRideStarted }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        scanner.clear();
        if (onScanSuccess) onScanSuccess(decodedText);
        if (onRideStarted) onRideStarted(decodedText);
      },
      (error) => {
        // Silently capture frame parse warnings
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, [onScanSuccess, onRideStarted]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-white">
      <h3 className="text-lg font-bold mb-2">Scan Cycle QR Code</h3>
      <p className="text-sm text-slate-400 mb-4">Point your camera at the QR code on the cycle</p>
      
      <div id="qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden text-slate-900" />

      {scanError && <p className="mt-2 text-red-400 text-sm">{scanError}</p>}
    </div>
  );
}