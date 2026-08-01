import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  Coins, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Send, 
  RefreshCw, 
  AlertTriangle,
  BarChart3,
  Users,
  Database,
  Sparkles,
  Zap,
  LogOut,
  ShieldCheck,
  Ban,
  FileText
} from 'lucide-react';

interface AdminUserRecord {
  email: string;
  name: string;
  apiKey: string;
  coinsBalance: number;
  status: 'active' | 'banned' | 'permanent_banned';
  banReason?: string;
  createdAt: string;
}

interface AdminPanelProps {
  onCoinsUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onCoinsUpdated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('nexus_admin_authed') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Data State
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Send Coins Modal / Inline State
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [coinsToSend, setCoinsToSend] = useState<number>(500);

  // Ban Modal State
  const [banUserEmail, setBanUserEmail] = useState<string | null>(null);
  const [banReasonInput, setBanReasonInput] = useState<string>('Platform rule violation.');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setIsAuthenticated(true);
        sessionStorage.setItem('nexus_admin_authed', 'true');
        fetchAdminData();
      } else {
        setAuthError(data.message || 'Invalid Master Admin Password.');
      }
    } catch (err: any) {
      setAuthError('Error verifying admin credentials.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/users?password=' + encodeURIComponent(sessionStorage.getItem('nexus_admin_token') || 'NexusAdmin#2026!SecureKey'));
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.users || []);
        setAppeals(data.appeals || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCoins = async (targetEmail: string, amount: number) => {
    try {
      const res = await fetch('/api/v1/admin/send-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: 'NexusAdmin#2026!SecureKey',
          targetEmail,
          amount
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionSuccessMsg(`Added +${amount} Nexus Coins to ${targetEmail}!`);
        setSelectedUserEmail(null);
        fetchAdminData();
        if (onCoinsUpdated) onCoinsUpdated();
      }
    } catch (err) {
      alert('Failed to send coins.');
    }
  };

  const handleToggleBan = async (targetEmail: string, banAction: 'ban' | 'unban', reason?: string) => {
    try {
      const res = await fetch('/api/v1/admin/ban-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: 'NexusAdmin#2026!SecureKey',
          targetEmail,
          banAction,
          reason
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionSuccessMsg(`User ${targetEmail} status updated to ${banAction.toUpperCase()}!`);
        setBanUserEmail(null);
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to update ban status.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.apiKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Password Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white font-mono">
            Admin Master Portal
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restricted System Control & User Operations. Enter master admin key to authenticate.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter Master Admin Password..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticate Admin Access</span>
          </button>
        </form>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500">
          Default Master Key: <code className="text-cyan-400 font-mono font-bold">NexusAdmin#2026!SecureKey</code>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">
                APINexus Site Admin Control Panel
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                MASTER ROOT ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage user accounts, send coins, ban/unban violators, and monitor platform security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('nexus_admin_authed');
              setIsAuthenticated(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {users.length}
          </div>
          <p className="text-[10px] text-slate-500">Google Verified Accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Coins Circulating</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {users.reduce((acc, u) => acc + (u.coinsBalance || 0), 0)} 🪙
          </div>
          <p className="text-[10px] text-slate-500">User Wallet Balances</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Banned Violators</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {users.filter(u => u.status === 'banned' || u.status === 'permanent_banned').length}
          </div>
          <p className="text-[10px] text-slate-500">Blocked Accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active API Keys</span>
            <Key className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono">
            {users.filter(u => u.apiKey).length}
          </div>
          <p className="text-[10px] text-slate-500">Auto-Generated Keys</p>
        </div>

      </div>

      {/* Users Search and Directory */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>User Account Directory & Coin Operations</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any user to send coins, manage API keys, or toggle ban status.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email, name, API key..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Google User Email</th>
                <th className="p-3.5">Assigned API Key</th>
                <th className="p-3.5">Coin Balance 🪙</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                    No users matching search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-800/40 transition-colors">
                    
                    <td className="p-3.5 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-mono text-cyan-300">{user.email}</div>
                          <div className="text-[10px] text-slate-400">{user.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-300">
                      <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
                        {user.apiKey}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-amber-400 font-mono">
                      {user.coinsBalance} Coins
                    </td>

                    <td className="p-3.5">
                      {user.status === 'banned' || user.status === 'permanent_banned' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          BANNED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      
                      {/* Send Coins Button */}
                      <button
                        onClick={() => setSelectedUserEmail(user.email)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all text-[11px] cursor-pointer"
                      >
                        + Send Coins
                      </button>

                      {/* Ban/Unban Toggle Button */}
                      {user.status === 'banned' || user.status === 'permanent_banned' ? (
                        <button
                          onClick={() => handleToggleBan(user.email, 'unban')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold transition-all text-[11px] cursor-pointer"
                        >
                          Unban User
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanUserEmail(user.email)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold transition-all text-[11px] cursor-pointer"
                        >
                          Ban User
                        </button>
                      )}

                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Send Coins To User */}
      {selectedUserEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>Send Coins to User</span>
            </h3>
            <p className="text-xs text-slate-400">
              Recipient: <code className="text-cyan-300 font-mono font-bold">{selectedUserEmail}</code>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Amount to Credit (Coins):</label>
              <input
                type="number"
                value={coinsToSend}
                onChange={(e) => setCoinsToSend(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCoinsToSend(amt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-amber-400 cursor-pointer font-mono"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedUserEmail(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendCoins(selectedUserEmail, coinsToSend)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer font-mono"
              >
                Confirm Send Coins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ban User */}
      {banUserEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-300 font-mono flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-400" />
              <span>Ban Account</span>
            </h3>
            <p className="text-xs text-slate-400">
              Target Email: <code className="text-rose-300 font-mono font-bold">{banUserEmail}</code>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Reason for Ban:</label>
              <textarea
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setBanUserEmail(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleBan(banUserEmail, 'ban', banReasonInput)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 cursor-pointer font-mono"
              >
                Confirm Ban User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
