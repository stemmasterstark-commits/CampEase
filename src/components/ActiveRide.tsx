'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bike, Navigation, MapPin, Square, AlertCircle, Clock } from 'lucide-react';

interface ActiveRideProps {
  rideId: string;
  onRideEnded: () => void;
}

interface Station {
  id: string;
  name: string;
}

export default function ActiveRide({ rideId, onRideEnded }: ActiveRideProps) {
  const [cycleCode, setCycleCode] = useState<string>('');
  const [startStation, setStartStation] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [endStation, setEndStation] = useState<string>('');
  const [stations, setStations] = useState<Station[]>([]);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [ending, setEnding] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 1. Fetch Active Ride details & available drop-off stations
  useEffect(() => {
    const fetchRideDetails = async () => {
      const { data: ride, error: rideErr } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (ride && !rideErr) {
        setCycleCode(ride.cycle_code);
        setStartStation(ride.start_station);
        setStartTime(ride.start_time);
      }

      const { data: stationList } = await supabase
        .from('stations')
        .select('id, name')
        .order('name');

      if (stationList) {
        setStations(stationList);
        if (stationList.length > 0) {
          setEndStation(stationList[0].name);
        }
      }
    };

    fetchRideDetails();
  }, [rideId]);

  // 2. Active Timer Counter
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000);
      setElapsedSeconds(seconds > 0 ? seconds : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // 3. Continuous Mobile GPS Tracking (Pings every 10s)
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const updateLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setGpsActive(true);

      supabase
        .from('rides')
        .update({
          current_lat: latitude,
          current_lng: longitude,
          last_location_time: new Date().toISOString(),
        })
        .eq('id', rideId)
        .then();
    };

    const handleGpsError = (err: GeolocationPositionError) => {
      setGpsActive(false);
      setError('GPS signal low or permission denied. Please enable location.');
    };

    // Watch position in real time
    const watchId = navigator.geolocation.watchPosition(updateLocation, handleGpsError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [rideId]);

  // 4. Handle End Ride Action
  const handleEndRide = async () => {
    if (!endStation) {
      setError('Please select a destination drop-off station.');
      return;
    }

    setEnding(true);
    setError('');

    try {
      const durationMinutes = Math.ceil(elapsedSeconds / 60);

      // Complete the ride in Supabase
      const { error: endError } = await supabase
        .from('rides')
        .update({
          status: 'completed',
          end_station: endStation,
          end_time: new Date().toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', rideId);

      if (endError) throw endError;

      onRideEnded();
    } catch (err: any) {
      setError(err.message || 'Failed to end ride. Please try again.');
      setEnding(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Status Header */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <Bike className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Campus Ride</h2>
            <p className="text-[11px] font-mono text-emerald-600 font-semibold">{cycleCode || 'Loading...'}</p>
          </div>
        </div>

        {/* GPS Active Badge */}
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
            gpsActive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50'
          }`}
        >
          <Navigation className={`w-3 h-3 ${gpsActive ? 'animate-spin' : ''}`} />
          <span>{gpsActive ? 'GPS Live' : 'Locating...'}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Timer & Details */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-center space-y-2 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" /> Ride Duration
        </div>
        <div className="text-4xl font-black font-mono text-slate-900 dark:text-white tracking-wider">
          {formatTime(elapsedSeconds)}
        </div>
        <p className="text-[11px] text-slate-500">Started from: <span className="font-semibold text-slate-700 dark:text-slate-300">{startStation}</span></p>
      </div>

      {/* Drop-Off Station Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Select Drop-Off Hub
        </label>
        <select
          value={endStation}
          onChange={(e) => setEndStation(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {stations.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* End Ride Button */}
      <button
        onClick={handleEndRide}
        disabled={ending}
        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <Square className="w-4 h-4 fill-current" />
        {ending ? 'Locking Cycle...' : 'End Ride & Lock Cycle'}
      </button>
    </div>
  );
}