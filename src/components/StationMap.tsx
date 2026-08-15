'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, Bike, Navigation, RefreshCw } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  code: string;
  available_bikes: number;
  total_racks: number;
}

// Initial NIT Calicut Station Hubs fallback
const NITC_STATIONS: Station[] = [
  { id: '1', name: 'Main Gate Station', code: 'NITC-MG', available_bikes: 8, total_racks: 15 },
  { id: '2', name: 'Central Library Hub', code: 'NITC-LIB', available_bikes: 4, total_racks: 12 },
  { id: '3', name: 'ELHC / Lecture Halls', code: 'NITC-LHC', available_bikes: 12, total_racks: 20 },
  { id: '4', name: 'Main Building (MB)', code: 'NITC-MB', available_bikes: 2, total_racks: 10 },
  { id: '5', name: 'Mega Hostel Complex', code: 'NITC-MH', available_bikes: 9, total_racks: 25 },
  { id: '6', name: 'Ladies Hostel (LH) Gate', code: 'NITC-LH', available_bikes: 6, total_racks: 15 },
];

export default function StationMap() {
  const [stations, setStations] = useState<Station[]>(NITC_STATIONS);
  const [selectedStation, setSelectedStation] = useState<Station | null>(NITC_STATIONS[0]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStationData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('stations').select('*');
      if (!error && data && data.length > 0) {
        setStations(data);
        if (!selectedStation) setSelectedStation(data[0]);
      }
    } catch (e) {
      console.log('Using fallback NITC station data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();

    // Subscribe to real-time cycle state changes
    const subscription = supabase
      .channel('public:cycles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cycles' }, () => {
        fetchStationData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" /> NITC Station Hubs
          </h2>
          <p className="text-xs text-slate-500">Live cycle availability on campus</p>
        </div>
        <button
          onClick={fetchStationData}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Campus Map Visual Grid */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 relative overflow-hidden shadow-xl border border-slate-800 min-h-55 flex flex-col justify-between">
        {/* Background Stylized Radar lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[16px_16px] opacity-20"></div>

        <div className="relative z-10 flex justify-between items-start">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            NITC Main Campus
          </span>
          {selectedStation && (
            <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg backdrop-blur">
              {selectedStation.code}
            </span>
          )}
        </div>

        {/* Selected Hub Focus Box */}
        {selectedStation && (
          <div className="relative z-10 my-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 backdrop-blur">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-base text-white">{selectedStation.name}</h3>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 text-xs font-bold">
                <Bike className="w-3.5 h-3.5" />
                <span>{selectedStation.available_bikes} Available</span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${(selectedStation.available_bikes / selectedStation.total_racks) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>{selectedStation.available_bikes} cycles parked</span>
              <span>Capacity: {selectedStation.total_racks}</span>
            </div>
          </div>
        )}

        <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Tap any station below for live rack details
        </div>
      </div>

      {/* Station Cards List */}
      <div className="grid grid-cols-1 gap-2.5">
        {stations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const isLow = st.available_bikes <= 2;

          return (
            <div
              key={st.id}
              onClick={() => setSelectedStation(st)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                isSelected
                  ? 'bg-emerald-50/75 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{st.name}</h4>
                  <p className="text-[11px] text-slate-400">{st.code}</p>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-sm font-black ${
                    isLow ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {st.available_bikes} <span className="text-xs font-normal text-slate-400">bikes</span>
                </div>
                <div className="text-[10px] text-slate-400">of {st.total_racks} racks</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}