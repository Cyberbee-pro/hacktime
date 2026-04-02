import { Clock, LayoutGrid, Network } from "lucide-react";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[20px] ${className}`} style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
      <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
      <div className="skeleton-highlight absolute inset-y-0 -left-1/2 w-1/2" />
    </div>
  );
}

export function StandbyPageSkeleton({ icon = Clock }: { icon?: typeof Clock }) {
  const Icon = icon;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F0F10', color: '#E6E6E6' }}>
      <div className="hidden lg:block w-72 shrink-0 p-6" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(15,15,16,0.8)' }}>
        <SkeletonBlock className="h-12 w-36 rounded-xl" />
        <SkeletonBlock className="mt-8 h-24 w-full" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(93,0,255,0.08) 0%, transparent 70%)' }} />
        <div className="glass relative z-10 w-full max-w-xl rounded-[20px] p-8 md:p-16 text-center shadow-[0_64px_128px_rgba(0,0,0,0.6)]" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mb-10 inline-flex rounded-[20px] p-5" style={{ backgroundColor: 'rgba(255,46,154,0.06)', border: '1px solid rgba(255,46,154,0.15)' }}>
            <Icon size={40} style={{ color: 'rgba(255,46,154,0.6)' }} />
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0F0F10', color: '#E6E6E6' }}>
      <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col p-6 backdrop-blur-2xl" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(15,15,16,0.8)' }}>
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
        <header className="hidden h-16 items-center justify-between px-8 lg:flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
              <SkeletonBlock className="h-56 w-full rounded-[20px]" />
              <SkeletonBlock className="h-56 w-full rounded-[20px]" />
            </div>

            <div className="rounded-[20px] p-8" style={{ border: '1px solid rgba(255,255,255,0.04)', backgroundColor: 'rgba(28,28,28,0.4)' }}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
              </div>
              <SkeletonBlock className="mt-8 h-14 w-full" />
              <SkeletonBlock className="mt-4 h-40 w-full rounded-[20px]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function RoomClockSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0F0F10', color: '#E6E6E6' }}>
      <aside className="hidden lg:flex h-full w-72 shrink-0 flex-col p-6 backdrop-blur-2xl" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(15,15,16,0.8)' }}>
        <SkeletonBlock className="h-12 w-36 rounded-xl" />
        <SkeletonBlock className="mt-8 h-24 w-full" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', backgroundColor: 'rgba(15,15,16,0.8)' }}>
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-12 w-80" />
            <SkeletonBlock className="h-10 w-24 rounded-[20px]" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-12 p-6 md:p-12">
          <div className="rounded-[20px] p-10 md:p-20" style={{ background: 'linear-gradient(135deg, rgba(93,0,255,0.08) 0%, rgba(255,46,154,0.05) 100%)', border: '1px solid rgba(255,46,154,0.08)' }}>
            <SkeletonBlock className="mx-auto h-8 w-28 rounded-full" />
            <SkeletonBlock className="mx-auto mt-10 h-28 w-full max-w-3xl rounded-[20px]" />
            <SkeletonBlock className="mx-auto mt-8 h-6 w-64" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <ActivityPill icon={Network} />
              <SkeletonBlock className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonBlock className="h-48 w-full rounded-[20px]" />
              <SkeletonBlock className="h-48 w-full rounded-[20px]" />
              <SkeletonBlock className="h-48 w-full rounded-[20px]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function StageScreenSkeleton() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ backgroundColor: '#0F0F10', color: '#E6E6E6' }}>
      <header className="flex h-20 items-center justify-between px-6 md:h-24 md:px-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
        <SkeletonBlock className="mt-8 h-32 w-full max-w-5xl rounded-[20px]" />
        <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <SkeletonBlock className="h-40 w-full rounded-[20px]" />
          <SkeletonBlock className="h-40 w-full rounded-[20px]" />
        </div>
        <SkeletonBlock className="mt-10 h-28 w-full max-w-xl rounded-[20px]" />
      </main>

      <footer className="flex h-16 items-stretch justify-between md:h-20 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', backgroundColor: '#0F0F10' }}>
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
    <div className="rounded-xl p-2" style={{ backgroundColor: 'rgba(255,46,154,0.06)', color: '#FF2E9A' }}>
      <Icon size={18} />
    </div>
  );
}
