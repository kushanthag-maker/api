import React, { useState } from 'react';
import { ApiKey } from '../types';
import { maskEmail, maskApiKey } from '../lib/security';
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
  Sparkles,
  Gift,
  Search,
  RefreshCw,
  CheckCircle2,
  BarChart3,
  HardDrive
} from 'lucide-react';

interface KeyManagerProps {
  keys: ApiKey[];
  onCreateKey: (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsed' | 'usageToday'>) => void;
  onRevokeKey: (keyId: string) => void;
  onDeleteKey: (keyId: string) => void;
  onGoToAdmin?: () => void;
}

export const KeyManager: React.FC<KeyManagerProps> = ({
  keys,
  onCreateKey,
  onRevokeKey,
  onDeleteKey,
  onGoToAdmin
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

  // Free Key State
  const [freeKeyName, setFreeKeyName] = useState('My Free Project');
  const [freeKeyEmail, setFreeKeyEmail] = useState('');
  const [freeKeyLoading, setFreeKeyLoading] = useState(false);
  const [freeKeySuccessMsg, setFreeKeySuccessMsg] = useState<string | null>(null);
  const [freeKeyErrorMsg, setFreeKeyErrorMsg] = useState<string | null>(null);
  const [isFreeKeyLocked, setIsFreeKeyLocked] = useState<boolean>(() => {
    return localStorage.getItem('nexus_free_key_claimed') === 'true';
  });

  // Sync / Search State
  const [searchQueryEmail, setSearchQueryEmail] = useState('');
  const [searchingKeys, setSearchingKeys] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'development' | 'production'>('production');
  const [permissions, setPermissions] = useState<('read' | 'write' | 'admin')[]>(['read', 'write']);
  const [usageLimit, setUsageLimit] = useState<number>(10);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Check initial server free status
  React.useEffect(() => {
    fetch('/api/v1/keys/free-status')
      .then(res => res.json())
      .then(data => {
        if (data && data.isLocked) {
          setIsFreeKeyLocked(true);
          localStorage.setItem('nexus_free_key_claimed', 'true');
        }
      })
      .catch(() => {});
  }, []);

  // Claim 10 Request Free API Key
  const handleGenerateFreeKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreeKeyLocked) {
      setFreeKeyErrorMsg('🔒 Free starter key has already been claimed for this account or network.');
      return;
    }

    setFreeKeyLoading(true);
    setFreeKeySuccessMsg(null);
    setFreeKeyErrorMsg(null);

    try {
      const res = await fetch('/api/v1/keys/generate-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: freeKeyName || 'Free User Key',
          email: freeKeyEmail || 'user@nexus.api'
        })
      });
      const data = await res.json();
      if (res.ok && data.status && data.apiKey) {
        const k = data.apiKey;
        onCreateKey({
          name: k.name,
          key: k.key,
          prefix: 'nx_free_',
          status: 'active',
          environment: 'production',
          permissions: ['read', 'write'],
          usageLimit: k.usageLimit || 10
        });
        setIsFreeKeyLocked(true);
        localStorage.setItem('nexus_free_key_claimed', 'true');
        setFreeKeySuccessMsg(`🎁 Free API Key '${k.key}' (10 requests) issued successfully! Free claims for this account are now permanently locked.`);
      } else {
        setIsFreeKeyLocked(true);
        localStorage.setItem('nexus_free_key_claimed', 'true');
        setFreeKeyErrorMsg(data.message || '🔒 Free trial key has already been claimed and is permanently locked.');
      }
    } catch (err) {
      setFreeKeyErrorMsg('Error communicating with API key server.');
    } finally {
      setFreeKeyLoading(false);
    }
  };

  // Sync / Import Admin-Issued Key by Email or String
  const handleSyncUserKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQueryEmail.trim()) return;
    setSearchingKeys(true);
    setSyncStatusMsg(null);

    try {
      const res = await fetch(`/api/v1/keys/user-keys?email=${encodeURIComponent(searchQueryEmail.trim())}`);
      const data = await res.json();
      if (data.status && Array.isArray(data.keys) && data.keys.length > 0) {
        let importedCount = 0;
        data.keys.forEach((serverKey: any) => {
          const exists = keys.some(existing => existing.key === serverKey.key);
          if (!exists) {
            onCreateKey({
              name: serverKey.name || 'Admin Issued Key',
              key: serverKey.key,
              prefix: serverKey.key.substring(0, 8),
              status: serverKey.status || 'active',
              environment: serverKey.environment || 'production',
              permissions: ['read', 'write'],
              usageLimit: serverKey.usageLimit || 10000
            });
            importedCount++;
          }
        });
        setSyncStatusMsg(`Found ${data.keys.length} key(s) on server! (${importedCount} new key imported).`);
      } else {
        setSyncStatusMsg(`No registered key found on server for '${searchQueryEmail}'.`);
      }
    } catch (err) {
      setSyncStatusMsg('Error connecting to key lookup service.');
    } finally {
      setSearchingKeys(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdminError(null);

    if (usageLimit > 10) {
      // High limit key requires Admin Password verification via server endpoint
      if (!adminPassInput) {
        setAdminError('Master Admin Password required for keys with limit > 10 requests.');
        return;
      }

      try {
        const res = await fetch('/api/v1/admin/create-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: adminPassInput,
            name,
            environment,
            usageLimit
          })
        });
        const data = await res.json();
        if (data.status) {
          onCreateKey({
            name,
            key: data.apiKey,
            prefix: environment === 'production' ? 'nx_live_' : 'nx_test_',
            status: 'active',
            environment,
            permissions,
            usageLimit
          });
          setName('');
          setAdminPassInput('');
          setIsModalOpen(false);
        } else {
          setAdminError(data.message || 'Invalid Master Admin Password.');
        }
      } catch (err) {
        setAdminError('Failed to verify admin authorization.');
      }
    } else {
      // Free key creation (10 requests)
      const prefix = environment === 'production' ? 'nx_live_' : 'nx_test_';
      const randomHash = Math.random().toString(36).substring(2, 12);
      const fullKey = `nx_free_${randomHash}`;

      onCreateKey({
        name,
        key: fullKey,
        prefix: 'nx_free_',
        status: 'active',
        environment,
        permissions,
        usageLimit: 10
      });

      setName('');
      setIsModalOpen(false);
    }
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

      {/* User API Request Volume & Persistence Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Total API Requests Used</div>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {keys.reduce((sum, k) => sum + (k.usageToday || 0), 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">reqs</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Active User Keys</div>
            <div className="text-xl font-bold text-indigo-300 font-mono">
              {keys.filter(k => k.status === 'active').length} / {keys.length} <span className="text-xs text-slate-400 font-normal">keys</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Request Counter Storage</div>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saved & Persistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free 10-Request Key CTA & Admin Key Import Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Instant Free API Key Generator (10 Requests, 1-Time Permanent Lock) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
              <Gift className="w-5 h-5 text-cyan-400 animate-bounce" />
              <span>Free Starter API Key (10 Requests)</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isFreeKeyLocked ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {isFreeKeyLocked ? '🔒 Claimed & Locked' : 'One-Time Offer'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Generate an instant free API key with a 10 request limit. <span className="text-amber-300 font-semibold">Strictly 1-time claim per account/device!</span>
          </p>

          {isFreeKeyLocked ? (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>🔒 Free Trial Key Already Claimed (Locked Permanently)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                You have already claimed your 1-time free starter API key. Re-claiming a free key is permanently locked for this device/account.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-cyan-300 font-mono font-bold">
                <span>💡 Need higher quota? Your key limit can be adjusted by the Admin in the Admin Panel.</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerateFreeKey} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Project Name (e.g. My Free App)"
                  value={freeKeyName}
                  onChange={(e) => setFreeKeyName(e.target.value)}
                  className="bg-slate-950/80 text-white text-xs font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email (e.g. user@gmail.com)"
                  value={freeKeyEmail}
                  onChange={(e) => setFreeKeyEmail(e.target.value)}
                  className="bg-slate-950/80 text-white text-xs font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={freeKeyLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {freeKeyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>Generate Free Key (1-Time Claim)</span>
              </button>
            </form>
          )}

          {freeKeyErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{freeKeyErrorMsg}</span>
            </div>
          )}

          {freeKeySuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{freeKeySuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Sync / Import Keys Issued by Admin */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
              <Search className="w-5 h-5 text-indigo-400" />
              <span>Import Keys Issued by Admin</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Account Sync
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Did the Admin issue a custom API key for your email? Type your email or key string below to fetch and display it in your key list.
          </p>

          <form onSubmit={handleSyncUserKeys} className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Email or API Key (e.g. kushanthag@gmail.com)"
                value={searchQueryEmail}
                onChange={(e) => setSearchQueryEmail(e.target.value)}
                className="flex-1 bg-slate-950 text-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={searchingKeys}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {searchingKeys ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Fetch Keys</span>
              </button>
            </div>
          </form>

          {syncStatusMsg && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono">
              {syncStatusMsg}
            </div>
          )}
        </div>

      </div>

      {/* Keys List Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Active Managed Keys ({keys.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time quota monitoring</span>
        </div>
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
              
              {/* Admin Protection Notice */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Protection Required</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  To prevent unauthorized key creation, API keys can only be issued using the Master Admin Password.
                </p>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                  {adminError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">Master Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter Master Admin Password..."
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-rose-500/40 focus:outline-none focus:border-rose-400"
                />
              </div>

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
