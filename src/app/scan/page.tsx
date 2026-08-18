'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';

export default function ScanPage() {
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    setScannedData(decodedText);
    
    // Example: QR code contains cycle ID (e.g., "CYCLE-102") or URL
    // Navigate to active ride confirmation or trigger backend API
    alert(`Scanned Cycle ID: ${decodedText}`);
    router.push('/my-rides');
  };

  return (
    <main className="min-h-screen p-6 bg-slate-950 text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <QRScanner onScanSuccess={handleScanSuccess} />
      </div>
    </main>
  );
}