import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Key, 
  Terminal, 
  BarChart2, 
  BookOpen, 
  Zap, 
  DollarSign, 
  Menu, 
  X, 
  CheckCircle2, 
  ArrowUpRight,
  Boxes,
  Cpu,
  ShieldAlert,
  User,
  LogOut,
  Sparkles,
  FileText,
  Coins,
  Newspaper,
  Bug
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVercelModal: () => void;
  onOpenKeysModal: () => void;
  keyCount: number;
  currentUser: UserProfile | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenNexusAiModal: () => void;
  onOpenRulesModal: () => void;
  onOpenCoinsModal: () => void;
  onOpenReportModal?: () => void;
  coinsBalance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenVercelModal,
  onOpenKeysModal,
  keyCount,
  currentUser,
  onOpenLoginModal,
  onLogout,
  onOpenNexusAiModal,
  onOpenRulesModal,
  onOpenCoinsModal,
  onOpenReportModal,
  coinsBalance = 250
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Zap },
    { id: 'docs', label: 'API Reference', icon: BookOpen },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'playground', label: 'Console Sandbox', icon: Terminal },
    { id: 'keys', label: 'API Keys', icon: Key, badge: keyCount > 0 ? keyCount : undefined },
    { id: 'analytics', label: 'Telemetry', icon: BarChart2 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'admin', label: 'Admin', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('overview')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Boxes className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  NEXUS<span className="text-cyan-400">.API</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  v1.4.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Unified Developer Gateway</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/30 text-cyan-300 font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs, Nexus Coins Vault, Nexus AI Engine & Google Login */}
          <div className="flex items-center gap-2">
            
            {/* Nexus Coins & Data Cards Vault Trigger */}
            <button
              onClick={onOpenCoinsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-md shadow-amber-500/5 cursor-pointer"
              title="Nexus Coins & Data Card Vault"
            >
              <Coins className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-extrabold">{coinsBalance}</span>
              <span className="hidden sm:inline text-[10px] uppercase font-semibold text-amber-300">Coins</span>
            </button>

            {/* Rules & Report Bug Buttons */}
            <button
              onClick={onOpenRulesModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all cursor-pointer"
              title="Platform Rules & Standards"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Rules</span>
            </button>

            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Report Bug / Technical Issue"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Report Bug</span>
              </button>
            )}

            {/* Google Authentication Button / Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover"
                />
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono truncate max-w-[110px]">
                    {currentUser.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sign Out Google Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.5 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.8 6.3C.7 8.5 0 10.2 0 12s.7 3.5 1.8 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.2-6.5-5.2L1.8 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span className="hidden sm:inline">Google Sign-In</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}


            {/* Mobile menu trigger */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/30 text-cyan-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenRulesModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-xs font-bold"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Platform Rules & Guidelines</span>
            </button>
            <button
              onClick={() => {
                onOpenNexusAiModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              <Cpu className="w-4 h-4" />
              <span>Nexus AI Engine Control</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

