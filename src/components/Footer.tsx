import React from 'react';
import { Boxes, ArrowUpRight, Heart, ShieldCheck } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenVercelModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenVercelModal }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-12 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-bold text-white font-mono">
                NEXUS<span className="text-cyan-400">.API</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation unified developer API gateway for AI inference, threat intelligence, forex data, and high-speed edge utilities.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 font-mono">
              <li>
                <button onClick={() => setActiveTab('docs')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  API Reference & Docs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('playground')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Interactive Console Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('keys')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Manage API Keys
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Telemetry & Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Hosting & Deployment */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Deployment</h4>
            <ul className="space-y-1.5 font-mono">
              <li>
                <button onClick={onOpenVercelModal} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer">
                  <span>Host on Vercel Guide</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <a href="https://vercel.com/docs" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                  <span>Vercel Documentation</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <button onClick={() => setActiveTab('pricing')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Pricing & Rate Limits
                </button>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Edge Status</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>All Systems Operational</span>
              </div>
              <p className="text-[11px] text-slate-400">28 edge nodes responding at 14.2ms avg latency.</p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Nexus API Gateway. Ready for Vercel Deployment.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Security Audit</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
