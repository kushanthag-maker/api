import React, { useEffect, useState } from 'react';
import { Boxes, Sparkles, CheckCircle2 } from 'lucide-react';

export const IntroAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Sequence steps
    const timer1 = setTimeout(() => setStep(1), 600);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => setStep(3), 2200);
    const timer4 = setTimeout(() => setFade(true), 2800);
    const timer5 = setTimeout(() => onComplete(), 3300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-opacity duration-500 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-6 max-w-sm mx-auto px-6">
        
        {/* Animated Brand Logo Ring */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 animate-spin blur-md opacity-70" />
          <div className="relative w-full h-full rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl">
            <Boxes className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-wider text-white font-mono">
            NEXUS<span className="text-cyan-400">.API</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">High-Capacity Microservice & Scraper Gateway</p>
        </div>

        {/* Sequence Progress Indicators */}
        <div className="space-y-2 text-[11px] font-mono text-left bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className={`flex items-center justify-between transition-colors ${step >= 1 ? 'text-cyan-300' : 'text-slate-600'}`}>
            <span>Initializing APINexus Engine v1.4</span>
            {step >= 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-slate-700 animate-ping" />}
          </div>

          <div className={`flex items-center justify-between transition-colors ${step >= 2 ? 'text-cyan-300' : 'text-slate-600'}`}>
            <span>Connecting MongoDB Atlas Cluster</span>
            {step >= 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : step >= 1 ? <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> : null}
          </div>

          <div className={`flex items-center justify-between transition-colors ${step >= 3 ? 'text-cyan-300' : 'text-slate-600'}`}>
            <span>Loading Ada Derana & Microservices</span>
            {step >= 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : step >= 2 ? <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> : null}
          </div>
        </div>

        {/* Bottom Skip Action */}
        <button
          onClick={onComplete}
          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          Click to enter dashboard →
        </button>

      </div>
    </div>
  );
};
