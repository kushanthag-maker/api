import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Mail, 
  Lock, 
  HelpCircle,
  ArrowRight,
  User,
  ExternalLink
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenAppeal: (email: string, reason?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenAppeal
}) => {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBannedUser, setIsBannedUser] = useState(false);
  const [banReason, setBanReason] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsBannedUser(false);

    if (!googleEmail || !googleEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google Account email (e.g. user@gmail.com).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/google-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: googleName.trim() || googleEmail.split('@')[0],
          googleId: `goog_${Date.now()}`
        })
      });

      const data = await res.json();

      if (res.status === 403) {
        if (data.status === 'banned') {
          setIsBannedUser(true);
          setBanReason(data.reason || 'Account banned for platform rule violation.');
          setErrorMsg(data.message);
        } else if (data.is_disposable) {
          setErrorMsg('Fake or disposable email domain detected! APINexus strictly enforces authentic Google & Gmail accounts. Fake email addresses are blocked.');
        } else {
          setErrorMsg(data.message || 'Access denied.');
        }
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Successful Google Sign-In
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSignIn = (email: string, name: string) => {
    setGoogleEmail(email);
    setGoogleName(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-mono">
            Sign In with Google Account
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            APINexus strictly validates authentic Google accounts. Disposable & fake emails are rejected by Nexus AI Security.
          </p>
        </div>

        {/* Error / Ban Alert Banner */}
        {errorMsg && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            isBannedUser
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                {isBannedUser && (
                  <p className="text-[11px] text-rose-300">
                    Reason: <span className="font-mono">{banReason}</span>
                  </p>
                )}
              </div>
            </div>

            {isBannedUser && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAppeal(googleEmail, banReason);
                }}
                className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mt-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Unban Appeal to Nexus AI</span>
              </button>
            )}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleGoogleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Email Address</span>
            </label>
            <input
              type="email"
              required
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              placeholder="e.g. alex.dev@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Display Name (Optional)</span>
            </label>
            <input
              type="text"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              placeholder="e.g. Alex Developer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick Test Google Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSignIn('kushanthag@gmail.com', 'Kushantha G')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all text-left truncate cursor-pointer"
              >
                kushanthag@gmail.com
              </button>
              <button
                type="button"
                onClick={() => handlePresetSignIn('spammer@tempmail.com', 'Fake Spammer')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-rose-400 hover:text-rose-300 hover:border-rose-500/50 transition-all text-left truncate cursor-pointer"
              >
                spammer@tempmail (Banned Test)
              </button>
            </div>
          </div>

          {/* Google Button Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating Google Account...</span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.5 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.8 6.3C.7 8.5 0 10.2 0 12s.7 3.5 1.8 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.2-6.5-5.2L1.8 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span>Continue with Google Sign-In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice Footer */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Lock className="w-3 h-3" />
            <span>Nexus AI Identity Guard</span>
          </div>
          <p className="leading-normal">
            By signing in, you agree to follow APINexus community rules. Rule violators will be banned automatically by Nexus AI.
          </p>
        </div>

      </div>
    </div>
  );
};
