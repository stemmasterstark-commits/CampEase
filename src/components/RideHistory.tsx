'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { History, MapPin, Clock, Leaf, Bike } from 'lucide-react';

interface RideRecord {
  id: string;
  start_station: string;
  end_station: string;
  start_time: string;
  duration_minutes: number;
}

export default function RideHistory({ userId }: { userId: string }) {
  const [rides, setRides] = useState<RideRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRides() {
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (data) setRides(data);
      setLoading(false);
    }
    fetchRides();
  }, [userId]);

  const totalMinutes = rides.reduce((acc, r) => acc + (r.duration_minutes || 0), 0);
  const totalCarbonKg = (totalMinutes * 0.04).toFixed(2); // ~0.04kg CO2 saved per min cycling vs auto

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Eco Impact Banner */}
      <div className="bg-emerald-900 text-white p-5 rounded-3xl border border-emerald-800 shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            <Leaf className="w-4 h-4" /> Green Impact
          </div>
          <div className="text-2xl font-black">{totalCarbonKg} kg</div>
          <div className="text-[11px] text-emerald-200">CO2 emissions saved on campus</div>
        </div>
        <div className="p-3 bg-emerald-800/80 rounded-2xl">
          <Bike className="w-8 h-8 text-emerald-300" />
        </div>
      </div>

      {/* History Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" /> My Ride History
        </h3>
        <span className="text-xs font-semibold text-slate-400">{rides.length} Total Rides</span>
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">Loading history...</div>
      ) : rides.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          No rides completed yet. Unlock a cycle to start rolling!
        </div>
      ) : (
        <div className="space-y-2.5">
          {rides.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {r.start_station || 'NITC Hub'} → {r.end_station || 'NITC Station'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(r.start_time).toLocaleDateString()} at{' '}
                  {new Date(r.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {r.duration_minutes || 1} min
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}