import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  Send, 
  RefreshCw, 
  HelpCircle,
  ArrowRight,
  Bot
} from 'lucide-react';

interface BanAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultReason?: string;
  onUnbanSuccess?: (email: string) => void;
}

export const BanAppealModal: React.FC<BanAppealModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  defaultReason = 'Account suspended due to platform rule violation.',
  onUnbanSuccess
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [appealText, setAppealText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    decision: 'UNBANNED' | 'REJECTED';
    unbanned: boolean;
    decision_reason: string;
    message_from_nexus_ai: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (appealText.trim().length < 10) {
      setErrorMsg('Please provide a detailed appeal explanation (at least 10 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/moderation/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          appealText: appealText.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit appeal to Nexus AI.');
      }

      setResult({
        decision: data.decision,
        unbanned: data.unbanned,
        decision_reason: data.decision_reason,
        message_from_nexus_ai: data.message_from_nexus_ai
      });

      if (data.unbanned && onUnbanSuccess) {
        onUnbanSuccess(email.trim());
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing appeal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-cyan-500 p-[1px] shadow-lg shadow-rose-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">
                Nexus AI Unban Portal
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Autonomous Review
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Nexus AI evaluates ban appeals, checks sincerity, and restores account access in real-time.
            </p>
          </div>
        </div>

        {/* Ban Details Callout */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
          <div className="text-rose-400 font-semibold flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Ban Status Active</span>
          </div>
          <p className="text-slate-300">
            {defaultReason}
          </p>
        </div>

        {/* Result Feedback Banner */}
        {result && (
          <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
            result.unbanned
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-start gap-2">
              {result.unbanned ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>Decision: {result.decision}</span>
                  {result.unbanned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                      UNBANNED BY NEXUS AI
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-xs">
                  {result.message_from_nexus_ai || result.decision_reason}
                </p>
              </div>
            </div>

            {result.unbanned && (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>Return to Platform & Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Appeal Form */}
        {!result?.unbanned && (
          <form onSubmit={handleSubmitAppeal} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Banned Google Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Appeal Reason & Statement to Nexus AI</span>
                <span className="text-[10px] text-slate-500">Explain why you should be unbanned</span>
              </label>
              <textarea
                required
                rows={4}
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                placeholder="Describe why you broke the rule or why this ban was a mistake, and pledge to follow platform rules..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Nexus AI Evaluating Appeal...</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Appeal to Nexus AI</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
