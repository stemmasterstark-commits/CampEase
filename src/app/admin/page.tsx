'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bike, AlertTriangle, Activity, CheckCircle, RefreshCw, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFleetData = async () => {
    setLoading(true);
    // Fetch all cycles
    const { data: cyclesData } = await supabase
      .from('cycles')
      .select('*')
      .order('cycle_number', { ascending: true });

    // Fetch active & recent rides
    const { data: ridesData } = await supabase
      .from('rides')
      .select('*, cycles(cycle_number)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (cyclesData) setCycles(cyclesData);
    if (ridesData) setRides(ridesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchFleetData();

    // Set up real-time listener for cycle status changes
    const channel = supabase
      .channel('cycles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cycles' }, () => {
        fetchFleetData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleMaintenance = async (cycleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'maintenance' ? 'available' : 'maintenance';
    await supabase.from('cycles').update({ status: newStatus }).eq('id', cycleId);
    fetchFleetData();
  };

  // Fleet Statistics Calculations
  const totalCycles = cycles.length;
  const availableCount = cycles.filter((c) => c.status === 'available').length;
  const inUseCount = cycles.filter((c) => c.status === 'in_use').length;
  const maintenanceCount = cycles.filter((c) => c.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" /> Administration Operations
            </div>
            <h1 className="text-2xl font-black tracking-tight">CampEase Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFleetData}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition text-slate-700 dark:text-slate-300"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to App
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">Total Fleet</p>
            <h3 className="text-3xl font-bold mt-1">{totalCycles}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-medium text-emerald-600 uppercase flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Available
            </p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-600">{availableCount}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-medium text-blue-600 uppercase flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Active Rides
            </p>
            <h3 className="text-3xl font-bold mt-1 text-blue-600">{inUseCount}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-medium text-amber-600 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Under Repair
            </p>
            <h3 className="text-3xl font-bold mt-1 text-amber-600">{maintenanceCount}</h3>
          </div>
        </div>

        {/* Fleet Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bike className="w-5 h-5 text-emerald-600" /> Fleet Overview & Controls
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="p-3 rounded-l-lg">Cycle Number</th>
                  <th className="p-3">Station</th>
                  <th className="p-3">QR Identifier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cycles.map((cycle) => (
                  <tr key={cycle.id}>
                    <td className="p-3 font-semibold">{cycle.cycle_number}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{cycle.current_station}</td>
                    <td className="p-3 font-mono text-xs text-slate-500">{cycle.qr_code_str}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cycle.status === 'available'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : cycle.status === 'in_use'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {cycle.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleMaintenance(cycle.id, cycle.status)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                          cycle.status === 'maintenance'
                            ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                            : 'border-amber-500 text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        {cycle.status === 'maintenance' ? 'Mark Available' : 'Flag Maintenance'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}