'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QrCode, AlertCircle } from 'lucide-react';

// Explicitly defining userId in the component props interface fixes TS2322
export interface QRScannerProps {
  userId: string;
  onRideStarted: (rideId: string) => void;
}

export default function QRScanner({ userId, onRideStarted }: QRScannerProps) {
  const [cycleCode, setCycleCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartRide = async (codeToUse?: string) => {
    const code = codeToUse || cycleCode;
    if (!code) {
      setError('Please enter or scan a cycle code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: rideError } = await supabase
        .from('rides')
        .insert([
          {
            user_id: userId,
            cycle_code: code,
            start_station: 'NITC Main Station',
            status: 'active',
            start_time: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (rideError) {
        throw rideError;
      }

      if (data) {
        onRideStarted(data.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 mb-2 border border-emerald-200 dark:border-emerald-800">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unlock a Cycle</h2>
        <p className="text-xs text-slate-500">Scan QR or type the cycle ID located near the lock</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual Input / Simulation */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Cycle Code (e.g. NITC-01)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="NITC-01"
              value={cycleCode}
              onChange={(e) => setCycleCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
            />
            <button
              onClick={() => handleStartRide()}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs transition disabled:opacity-50"
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </button>
          </div>
        </div>

        {/* Quick Demo Selector Buttons */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick Test Cycles:</p>
          <div className="grid grid-cols-3 gap-2">
            {['NITC-01', 'NITC-02', 'NITC-03'].map((code) => (
              <button
                key={code}
                onClick={() => {
                  setCycleCode(code);
                  handleStartRide(code);
                }}
                className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-500 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}