import React, { useState, useEffect } from 'react';
import { PlatformRule } from '../types';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Info,
  Lock,
  UserCheck
} from 'lucide-react';

interface SiteRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAppeal?: () => void;
}

export const SiteRulesModal: React.FC<SiteRulesModalProps> = ({
  isOpen,
  onClose,
  onOpenAppeal
}) => {
  const [rules, setRules] = useState<PlatformRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/moderation/rules')
        .then(res => res.json())
        .then(data => {
          if (data.rules) setRules(data.rules);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow Header Accent */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-mono tracking-tight">
                APINexus Platform Rules & Guidelines
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Enforced by Nexus AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Community standards and security protocols monitored 24/7 by Nexus AI Engine.
            </p>
          </div>
        </div>

        {/* Rules List Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
              Loading platform rules...
            </div>
          ) : (
            rules.map((rule, idx) => (
              <div 
                key={rule.id || idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 font-mono">
                    {rule.penalty}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-8">
                  {rule.description}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Violations result in instant ban by Nexus AI.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAppeal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAppeal();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all"
              >
                Need to Appeal a Ban?
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer transition-all shadow-md shadow-cyan-500/20"
            >
              I Understand & Agree
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
