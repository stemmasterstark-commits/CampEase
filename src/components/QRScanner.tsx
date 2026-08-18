'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Clear scanner once a valid code is captured
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Handle subtle scanning frame errors gracefully
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-white">
      <h3 className="text-lg font-bold mb-2">Scan Cycle QR Code</h3>
      <p className="text-sm text-slate-400 mb-4">Point your camera at the QR code on the cycle rack</p>
      
      <div id="qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden" />

      {scanError && <p className="mt-2 text-red-400 text-sm">{scanError}</p>}
    </div>
  );
}