'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import ActiveRide from '@/components/ActiveRide';
import Auth from '@/components/Auth';
import StationList from '@/components/StationList';
import RideHistory from '@/components/RideHistory';
import { supabase } from '@/lib/supabaseClient';
import { Bike, Shield, MapPin, CheckCircle2, LogOut, History, QrCode } from 'lucide-react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [completedRide, setCompletedRide] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  
  // Navigation Tabs: 'dashboard' | 'history'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkActiveRide(session.user.id);
      }
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkActiveRide(session.user.id);
      } else {
        setActiveRideId(null);
      }
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkActiveRide = async (userId: string) => {
    const { data } = await supabase
      .from('rides')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      setActiveRideId(data.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 text-sm font-semibold">
        Authenticating NITC session...
      </div>
    );
  }

  // Mandatory Login View when unauthenticated
  if (!session || !session.user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12">
        <Auth />
      </main>
    );
  }

  // Safely extract logged-in user ID
  const userId = session.user.id;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24">
      {/* App Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl text-emerald-600 tracking-tight">
            <Bike className="w-7 h-7" /> CampEase
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Admin
            </Link>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-red-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Primary Dashboard Container */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 max-w-md mx-auto w-full">
        {completedRide ? (
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-lg my-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h2 className="text-xl font-bold mb-1">Ride Completed!</h2>
            <p className="text-xs text-slate-500 mb-6">Cycle locked & returned safely to rack.</p>
            <button
              onClick={() => {
                setCompletedRide(false);
                setShowScanner(false);
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition"
            >
              Return to Dashboard
            </button>
          </div>
        ) : activeRideId ? (
          <ActiveRide
            rideId={activeRideId}
            onRideEnded={() => {
              setActiveRideId(null);
              setCompletedRide(true);
            }}
          />
        ) : showScanner ? (
          <div className="w-full space-y-3">
            <button
              onClick={() => setShowScanner(false)}
              className="text-xs text-slate-500 font-semibold underline mb-2"
            >
              ← Back to Station Dashboard
            </button>
            <QRScanner
              userId={userId}
              onRideStarted={(rideId: string) => {
                setShowScanner(false);
                setActiveRideId(rideId);
              }}
            />
          </div>
        ) : activeTab === 'history' ? (
          <RideHistory userId={userId} />
        ) : (
          <div className="w-full space-y-4">
            {/* Quick QR Unlock Banner */}
            <div className="bg-emerald-600 text-white p-4 rounded-3xl flex justify-between items-center shadow-lg">
              <div>
                <h3 className="font-bold text-sm">Ready to ride?</h3>
                <p className="text-[11px] text-emerald-100">Scan any cycle QR at a rack to unlock.</p>
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-white text-emerald-700 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <QrCode className="w-4 h-4" /> Scan QR
              </button>
            </div>

            {/* Real-time Stations List */}
            <StationList onSelectScan={() => setShowScanner(true)} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {!activeRideId && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 z-20">
          <div className="max-w-md mx-auto flex justify-around items-center">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setShowScanner(false);
              }}
              className={`flex flex-col items-center text-xs font-semibold transition ${
                activeTab === 'dashboard' && !showScanner ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MapPin className="w-5 h-5 mb-0.5" /> Dashboard
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="flex flex-col items-center text-emerald-600 text-xs font-bold"
            >
              <div className="bg-emerald-600 text-white p-2.5 rounded-full -mt-6 shadow-md border-4 border-slate-50 dark:border-slate-950">
                <QrCode className="w-5 h-5" />
              </div>
              Scan
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setShowScanner(false);
              }}
              className={`flex flex-col items-center text-xs font-semibold transition ${
                activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" /> My Rides
            </button>
          </div>
        </nav>
      )}
    </main>
  );
}