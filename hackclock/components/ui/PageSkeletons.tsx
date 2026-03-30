import { Clock, LayoutGrid, Network } from "lucide-react";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.06] ${className}`}>
      <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />
      <div className="skeleton-highlight absolute inset-y-0 -left-1/2 w-1/2" />
    </div>
  );
}

export function StandbyPageSkeleton({ icon = Clock }: { icon?: typeof Clock }) {
  const Icon = icon;

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-slate-200">
      <div className="hidden lg:block w-72 shrink-0 border-r border-white/5 bg-[#0A0A0B]/80 backdrop-blur-2xl p-6">
        <SkeletonBlock className="h-12 w-36 rounded-xl" />
        <SkeletonBlock className="mt-8 h-24 w-full" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="glass relative z-10 w-full max-w-xl rounded-[3rem] border border-white/5 p-8 md:p-16 text-center shadow-[0_64px_128px_rgba(0,0,0,0.6)]">
          <div className="mb-10 inline-flex rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
            <Icon size={40} className="text-blue-400/80" />
          </div>
          <SkeletonBlock className="mx-auto h-12 w-2/3" />
          <SkeletonBlock className="mx-auto mt-6 h-5 w-5/6" />
          <SkeletonBlock className="mx-auto mt-3 h-5 w-3/4" />
          <div className="mt-10 space-y-4">
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <SkeletonBlock className="h-14 flex-1" />
            <SkeletonBlock className="h-14 flex-1" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3]">
      <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col border-r border-[#30363D] bg-[#0A0A0B]/80 p-6 backdrop-blur-2xl">
        <SkeletonBlock className="h-12 w-36 rounded-xl" />
        <SkeletonBlock className="mt-8 h-24 w-full" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="hidden h-16 items-center justify-between border-b border-[#30363D] px-8 lg:flex">
          <SkeletonBlock className="h-8 w-28" />
          <SkeletonBlock className="h-10 w-40 rounded-full" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-12 w-64" />
                <SkeletonBlock className="h-4 w-80" />
              </div>
              <SkeletonBlock className="h-12 w-36 rounded-full" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SkeletonBlock className="h-56 w-full rounded-[2rem]" />
              <SkeletonBlock className="h-56 w-full rounded-[2rem]" />
            </div>

            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
              </div>
              <SkeletonBlock className="mt-8 h-14 w-full" />
              <SkeletonBlock className="mt-4 h-40 w-full rounded-[2rem]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function RoomClockSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0B] text-slate-200">
      <aside className="hidden lg:flex h-full w-72 shrink-0 flex-col border-r border-white/5 bg-[#0A0A0B]/80 p-6 backdrop-blur-2xl">
        <SkeletonBlock className="h-12 w-36 rounded-xl" />
        <SkeletonBlock className="mt-8 h-24 w-full" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-white/5 bg-black/20 px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-12 w-80" />
            <SkeletonBlock className="h-10 w-24 rounded-2xl" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-12 p-6 md:p-12">
          <div className="rounded-[3rem] border border-white/5 bg-white/[0.03] p-10 md:p-20">
            <SkeletonBlock className="mx-auto h-8 w-28 rounded-full" />
            <SkeletonBlock className="mx-auto mt-10 h-28 w-full max-w-3xl rounded-[2rem]" />
            <SkeletonBlock className="mx-auto mt-8 h-6 w-64" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <ActivityPill icon={Network} />
              <SkeletonBlock className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonBlock className="h-48 w-full rounded-[2rem]" />
              <SkeletonBlock className="h-48 w-full rounded-[2rem]" />
              <SkeletonBlock className="h-48 w-full rounded-[2rem]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function StageScreenSkeleton() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0D1117] text-[#E6EDF3]">
      <header className="flex h-20 items-center justify-between border-b border-[#30363D]/50 px-6 md:h-24 md:px-12">
        <div className="flex items-center gap-4 md:gap-6">
          <SkeletonBlock className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
        </div>
        <SkeletonBlock className="h-10 w-24" />
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center p-6">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="mt-8 h-32 w-full max-w-5xl rounded-[2rem]" />
        <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <SkeletonBlock className="h-40 w-full rounded-[2rem]" />
          <SkeletonBlock className="h-40 w-full rounded-[2rem]" />
        </div>
        <SkeletonBlock className="mt-10 h-28 w-full max-w-xl rounded-[2rem]" />
      </main>

      <footer className="flex h-16 items-stretch justify-between border-t border-[#30363D]/50 bg-[#0D1117] md:h-20">
        <SkeletonBlock className="h-full w-40 md:w-80 rounded-none" />
        <div className="flex flex-1 items-center justify-center">
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>
      </footer>
    </div>
  );
}

function ActivityPill({ icon: Icon }: { icon: typeof LayoutGrid }) {
  return (
    <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
      <Icon size={18} />
    </div>
  );
}
