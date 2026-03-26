import Link from 'next/link';
import { LayoutDashboard, Clock, Layers, MonitorPlay } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#161B22] border-r border-[#30363D] flex flex-col">
      {/* Logo & Event Name */}
      <div className="p-6 border-b border-[#30363D]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#3FB950]"></div>
          <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Phase: Hacking</span>
        </div>
        <h1 className="text-xl font-bold text-white">GitCity Hack</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-6 py-3 bg-[#1F2937] text-[#4493F8] border-l-2 border-[#4493F8]">
          <LayoutDashboard size={18} />
          <span className="text-sm font-semibold">DASHBOARD</span>
        </Link>
        <Link href="/flow" className="flex items-center gap-3 px-6 py-3 text-[#8B949E] hover:text-white transition-colors">
          <Clock size={18} />
          <span className="text-sm font-medium">CLOCK VIEW</span>
        </Link>
        <Link href="/flow" className="flex items-center gap-3 px-6 py-3 text-[#8B949E] hover:text-white transition-colors">
          <Layers size={18} />
          <span className="text-sm font-medium">FLOW CREATION</span>
        </Link>
        <Link href="/stage" className="flex items-center gap-3 px-6 py-3 text-[#8B949E] hover:text-white transition-colors">
          <MonitorPlay size={18} />
          <span className="text-sm font-medium">STAGE MODE</span>
        </Link>
      </nav>

      {/* Bottom Action */}
      <div className="p-6">
        <button className="w-full py-2 bg-[#1B2E24] text-[#3FB950] border border-[#2EA043] rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#233D30] transition-colors">
          Deploy Phase
        </button>
      </div>
    </div>
  );
}