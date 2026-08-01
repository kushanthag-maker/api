import React, { useState, useEffect } from 'react';
import { safeFetch } from '../lib/api';
import { 
  X, 
  Sparkles, 
  Bot, 
  Send, 
  ShieldCheck, 
  Activity, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Coins,
  CreditCard,
  Wrench
} from 'lucide-react';
import { UserProfile } from '../types';

interface NexusAiControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAppeal: () => void;
  currentUser?: UserProfile | null;
  onOpenCoinsModal?: () => void;
  onUpdateUserCoins?: (newBalance: number) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'nexus';
  text: string;
  timestamp: string;
}

export const NexusAiControlModal: React.FC<NexusAiControlModalProps> = ({
  isOpen,
  onClose,
  onOpenAppeal,
  currentUser,
  onOpenCoinsModal,
  onUpdateUserCoins
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'nexus',
      text: 'Greetings! I am Nexus AI, the supreme site controller for APINexus. I have master control over API error auto-fixing, system diagnostics, Nexus Coins, Data Cards, Google security, and ban appeals. How may I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sysStats, setSysStats] = useState<any>(null);

  const email = currentUser?.email || 'kushanthag@gmail.com';

  useEffect(() => {
    if (isOpen) {
      safeFetch('/api/v1/ai/nexus-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_system_stats', email })
      })
        .then(res => setSysStats(res.data))
        .catch(console.error);
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string, actionName?: string) => {
    if (e) e.preventDefault();
    const userText = customPrompt || input.trim();
    if (!userText && !actionName) return;
    if (loading) return;

    if (!customPrompt) setInput('');

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText || `Action: ${actionName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/nexus-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          action: actionName,
          email
        })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        data = { reply: text || 'Nexus AI internal response error.' };
      }

      if (data.new_balance !== undefined && onUpdateUserCoins) {
        onUpdateUserCoins(data.new_balance);
      } else if (data.remaining_coins !== undefined && onUpdateUserCoins) {
        onUpdateUserCoins(data.remaining_coins);
      }

      const aiMsg: Message = {
        id: `n_${Date.now()}`,
        sender: 'nexus',
        text: data.reply || data.message || 'Nexus AI standing by.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          sender: 'nexus',
          text: 'Error communicating with Nexus AI engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[720px]">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                  Nexus AI Control Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  Site Controller v3.6
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous AI master controller managing API errors, coins, data cards, and site security.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Pill Strip */}
        {sysStats && (
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Health: <strong className="text-emerald-400">{sysStats.system_health}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Coins: <strong className="text-amber-400">{sysStats.coins_balance || 250}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cards: <strong className="text-cyan-400">{sysStats.active_data_cards || 0} Active</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Bans: <strong className="text-rose-400">{sysStats.total_banned_users || 0}</strong></span>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/10'
                }`}
              >
                {msg.sender === 'user' ? 'YOU' : <Bot className="w-4 h-4 text-cyan-400" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600/90 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-800/50 pb-1 mb-1 text-[10px] text-slate-400 font-mono">
                  <span>{msg.sender === 'user' ? 'User Developer' : 'Nexus AI Master Controller'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse p-2">
              <Bot className="w-4 h-4" />
              <span>Nexus AI is executing system commands...</span>
            </div>
          )}
        </div>

        {/* Quick Commands & Prompts */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] font-mono shrink-0">
          <span className="text-slate-500 text-[10px] whitespace-nowrap">AI Commands:</span>
          
          <button
            onClick={() => handleSendMessage(undefined, 'Fix all API errors and audit gateways', 'fix_api_errors')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shrink-0 cursor-pointer transition-all font-bold flex items-center gap-1"
          >
            <Wrench className="w-3 h-3 text-emerald-400" />
            Auto-Fix API Errors
          </button>

          <button
            onClick={() => handleSendMessage(undefined, 'Add 300 Nexus Coins to my balance', 'buy_coins')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 shrink-0 cursor-pointer transition-all font-bold flex items-center gap-1"
          >
            <Coins className="w-3 h-3 text-amber-400" />
            Add 300 Coins
          </button>

          <button
            onClick={() => handleSendMessage(undefined, 'Buy 15GB High Speed Data Pack with coins', 'buy_data_card')}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 shrink-0 cursor-pointer transition-all font-bold flex items-center gap-1"
          >
            <CreditCard className="w-3 h-3 text-cyan-400" />
            Buy 15GB Data Card
          </button>

          <button
            onClick={onOpenAppeal}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 shrink-0 cursor-pointer transition-all font-bold"
          >
            ✨ Unban Portal
          </button>
        </div>

        {/* Message Input Box */}
        <form onSubmit={(e) => handleSendMessage(e)} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nexus AI to fix API errors, add coins, purchase data cards, or unban accounts..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};

