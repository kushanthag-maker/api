import React, { useState } from 'react';
import { ApiKey } from '../types';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  Lock, 
  Eye, 
  EyeOff,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';

interface KeyManagerProps {
  keys: ApiKey[];
  onCreateKey: (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsed' | 'usageToday'>) => void;
  onRevokeKey: (keyId: string) => void;
  onDeleteKey: (keyId: string) => void;
}

export const KeyManager: React.FC<KeyManagerProps> = ({
  keys,
  onCreateKey,
  onRevokeKey,
  onDeleteKey,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'development' | 'production'>('production');
  const [permissions, setPermissions] = useState<('read' | 'write' | 'admin')[]>(['read', 'write']);
  const [usageLimit, setUsageLimit] = useState<number>(10000);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prefix = environment === 'production' ? 'nx_live_' : 'nx_test_';
    const randomHash = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const fullKey = `${prefix}${randomHash}`;

    onCreateKey({
      name,
      key: fullKey,
      prefix,
      status: 'active',
      environment,
      permissions,
      usageLimit
    });

    setName('');
    setIsModalOpen(false);
  };

  const togglePermission = (perm: 'read' | 'write' | 'admin') => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Title & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Key className="w-6 h-6 text-cyan-400" />
            <span>API Key Management</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Create, authenticate, and manage access credentials for your applications calling Nexus API.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New API Key</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {keys.map((item) => {
          const isCopied = copiedId === item.id;
          const isVisible = visibleKeyId === item.id;
          const usagePercent = Math.min(100, Math.round((item.usageToday / item.usageLimit) * 100));

          return (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">{item.name}</h3>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      item.environment === 'production'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.environment}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      item.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Created: {item.createdAt}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Last Used: {item.lastUsed}</span>
                    </span>
                  </div>
                </div>

                {/* Right Permissions & Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    {item.permissions.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-300 border border-slate-800 uppercase">
                        {p}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onRevokeKey(item.id)}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors text-xs font-medium cursor-pointer"
                    title="Toggle Status"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteKey(item.id)}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors text-xs font-medium cursor-pointer"
                    title="Delete Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Secret Key Display Bar */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                <div className="flex items-center gap-2 truncate">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    {isVisible
                      ? item.key
                      : `${item.prefix}${'•'.repeat(24)}${item.key.slice(-4)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setVisibleKeyId(isVisible ? null : item.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Toggle visibility"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleCopy(item.id, item.key)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Usage Quota Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Daily Quota Usage</span>
                  </span>
                  <span>
                    {item.usageToday.toLocaleString()} / {item.usageLimit.toLocaleString()} requests ({usagePercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}

        {keys.length === 0 && (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <Key className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No API Keys Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You currently have no active API keys. Generate one now to start sending authenticated requests to Nexus API.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition-all cursor-pointer"
            >
              Generate First API Key
            </button>
          </div>
        )}
      </div>

      {/* Modal for Creating New Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <span>Create New API Key</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">Key Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vercel Production WebApp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEnvironment('production')}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                      environment === 'production'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Production (nx_live_)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvironment('development')}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                      environment === 'development'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Development (nx_test_)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">Permissions</label>
                <div className="flex gap-2">
                  {(['read', 'write', 'admin'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePermission(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all ${
                        permissions.includes(p)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">Daily Request Limit</label>
                <select
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 text-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value={10000}>10,000 req / day (Developer)</option>
                  <option value={100000}>100,000 req / day (Pro)</option>
                  <option value={1000000}>1,000,000 req / day (Enterprise)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  Generate Secret Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
