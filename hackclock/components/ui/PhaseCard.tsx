"use client";

interface PhaseCardProps {
  index: number;
  name: string;
  durationMinutes: number;
  isActive?: boolean;
}

export default function PhaseCard({ index, name, durationMinutes, isActive = false }: PhaseCardProps) {
  return (
    <div
      className={`border p-6 transition-all ${isActive ? "border-[#FF2E9A] bg-[#5D00FF]" : "border-[#30363D] bg-[#1C1C1C]"}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-tight text-[#A0A0A0]">
          Phase {String(index + 1).padStart(2, "0")}
        </span>
        {isActive && (
          <span className="border border-[#FF2E9A] bg-[#FF2E9A]/15 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-[#FF2E9A]">
            Active
          </span>
        )}
      </div>

      <h4 className="text-lg font-bold uppercase tracking-tight text-white">{name}</h4>
      <p className="mt-3 text-xs uppercase tracking-tight text-[#A0A0A0]">{durationMinutes} Minutes</p>
      <div className="mt-5 flex h-2 overflow-hidden border border-[#30363D] bg-[#232323]">
        <div className={`h-full ${isActive ? "w-2/3 bg-[#FF2E9A]" : "w-1/3 bg-[#CFFF04]"}`} />
      </div>
    </div>
  );
}
