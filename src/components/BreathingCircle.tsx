'use client';

export function BreathingCircle() {
  return (
    <div className="relative w-64 h-64">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Breathing circle animation */}
        <div className="absolute w-32 h-32 bg-white/5 rounded-full animate-ping" />
        <div className="absolute w-32 h-32 bg-white/10 rounded-full animate-pulse" />
        <p className="text-white/70 text-sm z-10">Breathe with the circle</p>
      </div>
    </div>
  );
} 