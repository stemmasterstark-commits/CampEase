'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, QrCode, Bike } from 'lucide-react'; // Or your icon set

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center py-2 z-50">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-xs ${
          pathname === '/' ? 'text-emerald-400' : 'text-slate-400'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>

      <Link
        href="/scan"
        className={`flex flex-col items-center gap-1 text-xs ${
          pathname === '/scan' ? 'text-emerald-400' : 'text-slate-400'
        }`}
      >
        <div className="bg-emerald-500 text-slate-950 p-3 rounded-full -mt-5 border-4 border-slate-950 shadow-lg">
          <QrCode className="w-6 h-6" />
        </div>
        <span className="mt-1">Scan</span>
      </Link>

      <Link
        href="/my-rides"
        className={`flex flex-col items-center gap-1 text-xs ${
          pathname === '/my-rides' ? 'text-emerald-400' : 'text-slate-400'
        }`}
      >
        <Bike className="w-5 h-5" />
        <span>My Rides</span>
      </Link>
    </nav>
  );
}