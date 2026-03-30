"use client";

interface ClockFaceProps {
  hours: string;
  minutes: string;
  seconds: string;
  className?: string;
}

export default function ClockFace({ hours, minutes, seconds, className = "" }: ClockFaceProps) {
  return (
    <div
      className={`my-6 md:my-10 flex items-center justify-center gap-1 sm:gap-2 text-center font-mono font-bold leading-none text-[#CFFF04] select-none ${className}`}
      style={{ filter: "drop-shadow(0 0 18px rgba(207,255,4,0.35))" }}
    >
      <span className="text-[clamp(4rem,18vw,10rem)] tracking-[-0.08em]">{hours}</span>
      <span className="text-[clamp(2rem,10vw,6rem)] text-white/30">:</span>
      <span className="text-[clamp(4rem,18vw,10rem)] tracking-[-0.08em]">{minutes}</span>
      <span className="text-[clamp(2rem,10vw,6rem)] text-white/30">:</span>
      <span className="text-[clamp(4rem,18vw,10rem)] tracking-[-0.08em]">{seconds}</span>
    </div>
  );
}
