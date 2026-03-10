"use client"
 
export function AuthAnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950" />
      <div className="absolute inset-0 opacity-70 dark:opacity-55 bg-[radial-gradient(circle_at_20%_12%,rgba(59,130,246,0.28),transparent_55%),radial-gradient(circle_at_82%_16%,rgba(168,85,247,0.24),transparent_56%),radial-gradient(circle_at_50%_86%,rgba(99,102,241,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px] animate-grid-pan" />
 
      <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-3xl animate-blob" />
      <div className="absolute -top-28 -right-28 h-[30rem] w-[30rem] rounded-full bg-purple-400/18 dark:bg-purple-600/14 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-indigo-400/18 dark:bg-indigo-500/14 blur-3xl animate-blob animation-delay-4000" />
 
      <div
        className="absolute left-[12%] top-[18%] h-40 w-40 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg dark:border-white/10 dark:bg-white/5 animate-float-slow"
        style={{ ['--float-rot' as any]: '12deg' }}
      />
      <div
        className="absolute right-[10%] bottom-[20%] h-32 w-32 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg dark:border-white/10 dark:bg-white/5 animate-float"
        style={{ ['--float-rot' as any]: '0deg' }}
      />
      <div
        className="absolute left-[65%] top-[60%] h-24 w-24 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg dark:border-white/10 dark:bg-white/5 animate-float-fast"
        style={{ ['--float-rot' as any]: '-6deg' }}
      />
 
      <div className="absolute inset-0 bg-noise opacity-[0.12] dark:opacity-[0.08] mix-blend-overlay" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/75 to-transparent" />
    </div>
  )
}
