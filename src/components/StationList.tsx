'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, Bike, RefreshCw } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  code: string;
  available_bikes: number;
  total_racks: number;
}

export default function StationList({ onSelectScan }: { onSelectScan: () => void }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('name');

    if (!error && data) {
      setStations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStations();

    // Subscribe to real-time changes when bikes are taken/returned
    const channel = supabase
      .channel('station_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stations' },
        () => fetchStations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Header bar for stations */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" /> Campus Hubs
          </h2>
          <p className="text-[11px] text-slate-500">Real-time availability across NITC</p>
        </div>
        <button
          onClick={fetchStations}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-emerald-600 transition rounded-xl bg-slate-100 dark:bg-slate-800"
          title="Refresh availability"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Station Cards Grid */}
      <div className="space-y-3">
        {loading && stations.length === 0 ? (
          <div className="text-center py-8 text-xs font-semibold text-slate-400">
            Loading station data...
          </div>
        ) : (
          stations.map((station) => {
            const isLow = station.available_bikes <= 2;
            const isEmpty = station.available_bikes === 0;

            return (
              <div
                key={station.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-emerald-500 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {station.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
                      {station.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Total Capacity: {station.total_racks} Racks
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold px-2.5 py-1 rounded-xl inline-flex items-center gap-1 ${
                        isEmpty
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40'
                          : isLow
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                      }`}
                    >
                      <Bike className="w-4 h-4" /> {station.available_bikes}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5 text-center">Available</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}