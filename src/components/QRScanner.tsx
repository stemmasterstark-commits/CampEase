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
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const startScanner = () => {
    if (scannerRef.current) return;

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
        // Silently handle frame errors
      }
    );
  };

  useEffect(() => {
    // Automatically prompt browser for camera permission on load
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        setHasPermission(true);
        // Stop initial test stream so html5-qrcode can take over
        stream.getTracks().forEach((track) => track.stop());
        startScanner();
      })
      .catch((err) => {
        console.error('Camera permission denied or unavailable:', err);
        setScanError('Camera permission was denied. Please allow camera access in your browser settings.');
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-white">
      <h3 className="text-lg font-bold mb-2">Scan Cycle QR Code</h3>
      <p className="text-sm text-slate-400 mb-4">Point your camera at the QR code on the cycle</p>

      <div id="qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden text-slate-900" />

      {scanError && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
          {scanError}
        </div>
      )}
    </div>
  );
}