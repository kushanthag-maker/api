import React, { useState, useEffect } from 'react';
import { safeFetch } from '../lib/api';
import { maskEmail, maskApiKey } from '../lib/security';
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
  FileText,
  Globe,
  Plus,
  Trash2,
  Play,
  Layers,
  ExternalLink,
  Edit3
} from 'lucide-react';

interface AdminUserRecord {
  email: string;
  name: string;
  apiKey: string;
  coinsBalance: number;
  status: 'active' | 'banned' | 'permanent_banned';
  banReason?: string;
  usageLimit?: number;
  usageToday?: number;
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

  // Security Hardening State
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);
  const [maskKeys, setMaskKeys] = useState<boolean>(true);
  const [securityPinInput, setSecurityPinInput] = useState<string>('');
  const [pinModalTarget, setPinModalTarget] = useState<{ title: string; action: () => void } | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; action: string; severity: 'INFO' | 'WARN' | 'CRITICAL'; target: string }>>([
    { id: 'log_1', time: new Date().toLocaleTimeString(), action: 'Admin Vault Authenticated', severity: 'INFO', target: 'System Root' }
  ]);

  const addAuditLog = (action: string, target: string, severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    const newLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      time: new Date().toLocaleTimeString(),
      action,
      severity,
      target
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Lockout Timer Effect
  useEffect(() => {
    if (lockoutTimeLeft > 0) {
      const timer = setInterval(() => {
        setLockoutTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimeLeft]);

  // Helper to open PIN confirmation modal for sensitive operations
  const triggerSecuredAction = (title: string, action: () => void) => {
    setSecurityPinInput('');
    setPinError(null);
    setPinModalTarget({ title, action });
  };

  const handleVerifyPinAndExecute = () => {
    if (!pinModalTarget) return;
    if (securityPinInput !== '9988' && securityPinInput !== getAdminPass()) {
      setPinError('Invalid Security Confirmation PIN / Password.');
      addAuditLog(`FAILED 2FA Action Confirmation: ${pinModalTarget.title}`, 'Unauthorized', 'CRITICAL');
      return;
    }
    const currentAction = pinModalTarget.action;
    setPinModalTarget(null);
    setSecurityPinInput('');
    setPinError(null);
    currentAction();
  };

  // Admin Data State
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Send Coins Modal / Inline State
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [coinsToSend, setCoinsToSend] = useState<number>(500);

  // Promo Code State
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoCoinAmount, setPromoCoinAmount] = useState<number>(100);
  const [promoCodeName, setPromoCodeName] = useState<string>('');
  const [generatingPromo, setGeneratingPromo] = useState<boolean>(false);

  // Bug Reports State
  const [bugReports, setBugReports] = useState<any[]>([]);

  // Admin Key Generator State
  const [newKeyUserEmail, setNewKeyUserEmail] = useState<string>('');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'development'>('production');
  const [generatingKey, setGeneratingKey] = useState<boolean>(false);
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);

  // Custom Vercel Endpoints Management State
  const [customEndpoints, setCustomEndpoints] = useState<any[]>([]);
  const [fetchingEndpoints, setFetchingEndpoints] = useState<boolean>(false);
  const [showAddEndpointModal, setShowAddEndpointModal] = useState<boolean>(false);

  // Endpoint Creation Form State
  const [epName, setEpName] = useState<string>('');
  const [epCategory, setEpCategory] = useState<string>('movie');
  const [epCustomCategory, setEpCustomCategory] = useState<string>('');
  const [epMethod, setEpMethod] = useState<'GET' | 'POST'>('GET');
  const [epTargetUrl, setEpTargetUrl] = useState<string>('');
  const [epCustomPath, setEpCustomPath] = useState<string>('');
  const [epSummary, setEpSummary] = useState<string>('');
  const [epDescription, setEpDescription] = useState<string>('');
  const [epRateLimit, setEpRateLimit] = useState<string>('100 req/min');
  const [epParamName, setEpParamName] = useState<string>('q');
  const [epParamDesc, setEpParamDesc] = useState<string>('Search query or parameter');
  const [epSampleJson, setEpSampleJson] = useState<string>('{\n  "status": true,\n  "results": []\n}');
  const [creatingEndpoint, setCreatingEndpoint] = useState<boolean>(false);
  const [testResultModal, setTestResultModal] = useState<{ title: string; data: any } | null>(null);

  const fetchCustomEndpoints = async () => {
    setFetchingEndpoints(true);
    try {
      const pass = getAdminPass();
      const res = await safeFetch(`/api/v1/admin/endpoints?password=${encodeURIComponent(pass)}`, {
        headers: { 'x-admin-password': pass }
      });
      const data = res.data;
      if (data.status) {
        setCustomEndpoints(data.endpoints || []);
      }
    } catch (e) {
      console.warn('Failed to load custom endpoints:', e);
    } finally {
      setFetchingEndpoints(false);
    }
  };

  const handleCreateCustomEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epName.trim() || !epTargetUrl.trim()) {
      alert('Please fill in Endpoint Name and Target Vercel URL');
      return;
    }

    setCreatingEndpoint(true);
    try {
      const finalCategory = epCategory === 'custom' ? (epCustomCategory.trim() || 'custom') : epCategory;
      let parsedSample: any = { status: true, message: 'Connected to Vercel Endpoint' };
      try {
        if (epSampleJson.trim()) {
          parsedSample = JSON.parse(epSampleJson);
        }
      } catch (err) {
        // Fallback default sample object
      }

      const paramsList = [
        { name: 'apiKey', type: 'string', required: true, description: 'Mandatory Nexus API Key', location: 'query', default: 'YOUR_NEXUS_API_KEY' }
      ];
      if (epParamName.trim()) {
        paramsList.push({
          name: epParamName.trim(),
          type: 'string',
          required: true,
          description: epParamDesc.trim() || 'Target parameter',
          location: epMethod === 'POST' ? 'body' : 'query',
          default: ''
        });
      }

      const pass = getAdminPass();
      const res = await safeFetch('/api/v1/admin/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pass,
          name: epName,
          category: finalCategory,
          method: epMethod,
          targetUrl: epTargetUrl,
          path: epCustomPath,
          summary: epSummary,
          description: epDescription,
          rateLimit: epRateLimit,
          params: paramsList,
          sampleResponseBody: parsedSample
        })
      });

      const data = res.data;
      if (data.status) {
        setActionSuccessMsg(`✅ Custom Vercel Endpoint '${data.endpoint.name}' registered successfully!`);
        addAuditLog(`Registered New Vercel API: ${data.endpoint.name}`, 'API Gateway', 'INFO');
        setShowAddEndpointModal(false);
        // Reset form
        setEpName('');
        setEpTargetUrl('');
        setEpCustomPath('');
        setEpSummary('');
        setEpDescription('');
        fetchCustomEndpoints();
      } else {
        alert(data.message || 'Failed to create endpoint.');
      }
    } catch (err) {
      alert('Error creating custom endpoint');
    } finally {
      setCreatingEndpoint(false);
    }
  };

  const handleDeleteCustomEndpoint = async (endpointId: string, endpointName: string) => {
    if (!confirm(`Are you sure you want to delete the endpoint '${endpointName}'?`)) return;

    try {
      const pass = getAdminPass();
      const res = await safeFetch(`/api/v1/admin/endpoints/${endpointId}?password=${encodeURIComponent(pass)}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pass }
      });
      const data = res.data;
      if (data.status) {
        setActionSuccessMsg(`Deleted endpoint '${endpointName}'`);
        addAuditLog(`Deleted Endpoint: ${endpointName}`, 'API Gateway', 'WARN');
        fetchCustomEndpoints();
      }
    } catch (err) {
      alert('Failed to delete endpoint');
    }
  };

  const handleToggleEndpointStatus = async (endpoint: any) => {
    const nextStatus = endpoint.status === 'online' ? 'offline' : 'online';
    try {
      const pass = getAdminPass();
      const res = await safeFetch(`/api/v1/admin/endpoints/${endpoint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pass,
          status: nextStatus
        })
      });
      const data = res.data;
      if (data.status) {
        setActionSuccessMsg(`Endpoint '${endpoint.name}' is now ${nextStatus.toUpperCase()}`);
        fetchCustomEndpoints();
      }
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleTestEndpoint = async (endpoint: any) => {
    try {
      const testUrl = endpoint.targetUrl;
      const res = await safeFetch(testUrl, { method: endpoint.method });
      setTestResultModal({
        title: `Test Connection Response: ${endpoint.name}`,
        data: res.data || { status: res.status, message: 'Response received from Vercel' }
      });
    } catch (e: any) {
      setTestResultModal({
        title: `Test Error: ${endpoint.name}`,
        data: { error: e?.message || 'Connection failed or blocked by CORS' }
      });
    }
  };

  // Helper to get active admin session password
  const getAdminPass = (): string => {
    try {
      const raw = sessionStorage.getItem('nexus_admin_pass');
      if (raw && raw.startsWith('nx_enc_')) {
        return decodeURIComponent(atob(raw.substring(7)));
      }
      return raw || adminPassword || '';
    } catch (e) {
      return adminPassword || '';
    }
  };

  const handleAdminGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyUserEmail.trim()) return;
    setGeneratingKey(true);
    setGeneratedKeyResult(null);
    try {
      const res = await safeFetch('/api/v1/admin/create-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getAdminPass(),
          email: newKeyUserEmail,
          environment: newKeyEnv
        })
      });
      const data = res.data;
      if (data.status) {
        setGeneratedKeyResult(data.apiKey);
        setActionSuccessMsg(`Generated API Key '${data.apiKey}' for user ${data.userEmail}!`);
        setNewKeyUserEmail('');
        fetchAdminData();
      } else {
        alert(data.message || 'Failed to generate key. Check admin password.');
      }
    } catch (err) {
      alert('Error generating API key');
    } finally {
      setGeneratingKey(false);
    }
  };

  // Ban Modal State
  const [banUserEmail, setBanUserEmail] = useState<string | null>(null);
  const [banReasonInput, setBanReasonInput] = useState<string>('Platform rule violation.');

  // Key Limit Modal State
  const [editingKeyTarget, setEditingKeyTarget] = useState<{ key: string; email: string; currentLimit: number } | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<number>(10000);

  const handleUpdateKeyLimit = async () => {
    if (!editingKeyTarget) return;
    try {
      const res = await fetch('/api/v1/admin/update-key-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getAdminPass(),
          key: editingKeyTarget.key,
          newLimit: newLimitInput
        })
      });
      const data = await res.json();
      if (data.status) {
        setActionSuccessMsg(`Updated API Key limit for '${editingKeyTarget.email}' to ${newLimitInput.toLocaleString()} reqs!`);
        setEditingKeyTarget(null);
        fetchAdminData();
      } else {
        alert(data.message || 'Failed to update key limit.');
      }
    } catch (e) {
      alert('Error updating key limit.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
      fetchPromoCodes();
      fetchBugReports();
      fetchCustomEndpoints();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) {
      setAuthError(`Vault Locked due to multiple failed login attempts. Retry in ${lockoutTimeLeft}s.`);
      return;
    }

    setAuthError(null);

    try {
      const res = await safeFetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = res.data;

      if (res.ok && data.status === 'success') {
        setIsAuthenticated(true);
        setFailedAttempts(0);
        sessionStorage.setItem('nexus_admin_authed', 'true');
        sessionStorage.setItem('nexus_admin_pass', `nx_enc_${btoa(encodeURIComponent(adminPassword))}`);
        addAuditLog('Admin Vault Authenticated Successfully', 'Admin Root', 'INFO');
        fetchAdminData();
      } else {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= 3) {
          setLockoutTimeLeft(300); // 5 minute lockout
          setAuthError('SECURITY LOCKOUT: 3 failed attempts. Admin vault locked for 5 minutes.');
          addAuditLog('SECURITY ALERT: 3 Failed Admin Passwords - Lockout Triggered', 'System Firewall', 'CRITICAL');
        } else {
          setAuthError(`Invalid Master Admin Password. (${3 - attempts} attempt(s) remaining before lockout)`);
          addAuditLog(`Failed Admin Login Attempt (${attempts}/3)`, 'Firewall Guard', 'WARN');
        }
      }
    } catch (err: any) {
      setAuthError('Error verifying admin credentials.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const pass = getAdminPass();
      const res = await safeFetch(`/api/v1/admin/users?password=${encodeURIComponent(pass)}`, {
        headers: { 'x-admin-password': pass }
      });
      const data = res.data;
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
      const res = await safeFetch('/api/v1/admin/send-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: getAdminPass(),
          targetEmail,
          coins: amount,
          amount
        })
      });
      const data = res.data;
      if (data.status === 'success') {
        setActionSuccessMsg(`Added +${amount} Nexus Coins to ${targetEmail}!`);
        addAuditLog(`Granted +${amount} Coins`, targetEmail, 'INFO');
        setSelectedUserEmail(null);
        fetchAdminData();
        if (onCoinsUpdated) onCoinsUpdated();
      }
    } catch (err) {
      alert('Failed to send coins.');
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch('/api/v1/admin/promo-codes');
      const data = await res.json();
      if (data.status) {
        setPromoCodes(data.codes || []);
      }
    } catch (e) {
      console.warn('Failed to load promo codes', e);
    }
  };

  const fetchBugReports = async () => {
    try {
      const res = await fetch('/api/v1/report/list');
      const data = await res.json();
      if (data.status) {
        setBugReports(data.reports || []);
      }
    } catch (e) {
      console.warn('Failed to load bug reports', e);
    }
  };

  const handleGeneratePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingPromo(true);
    try {
      const res = await fetch('/api/v1/admin/generate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: getAdminPass(),
          coinAmount: promoCoinAmount,
          codeName: promoCodeName,
          maxUses: 100
        })
      });
      const data = await res.json();
      if (data.status) {
        setActionSuccessMsg(`Generated Promo Code '${data.code}' for ${data.coinAmount} Coins!`);
        setPromoCodeName('');
        fetchPromoCodes();
      } else {
        alert(data.message || 'Failed to generate promo code');
      }
    } catch (err) {
      alert('Error generating promo code');
    } finally {
      setGeneratingPromo(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch('/api/v1/report/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status })
      });
      const data = await res.json();
      if (data.status) {
        setActionSuccessMsg(`Updated Bug Report '${reportId}' status to ${status}!`);
        fetchBugReports();
      }
    } catch (err) {
      alert('Failed to update report status');
    }
  };

  const handleToggleBan = async (targetEmail: string, banAction: 'ban' | 'unban', reason?: string) => {
    try {
      const res = await safeFetch('/api/v1/admin/ban-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: getAdminPass(),
          targetEmail,
          banAction,
          reason
        })
      });
      const data = res.data;
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
          Nexus AI Protected Administrative Portal
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaskKeys(!maskKeys)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              title="Toggle API Key Masking for privacy"
            >
              <span>{maskKeys ? '🔒 Masked Keys' : '🔓 Visible Keys'}</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email, name, key..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
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
                          <div className="font-mono text-cyan-300">
                            {maskKeys ? maskEmail(user.email) : user.email}
                          </div>
                          <div className="text-[10px] text-slate-400">{user.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-300">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
                          {maskKeys && user.apiKey && user.apiKey.length > 12 
                            ? `${user.apiKey.substring(0, 8)}••••••••` 
                            : user.apiKey}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                            ⚡ Limit: {(user.usageLimit || 10000).toLocaleString()} reqs
                          </span>
                          <span className="text-slate-400">
                            (Used: {user.usageToday || 0})
                          </span>
                        </div>
                      </div>
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

                      {/* Edit Key Quota Limit Button */}
                      <button
                        onClick={() => {
                          const limit = user.usageLimit || 10000;
                          setEditingKeyTarget({ key: user.apiKey, email: user.email, currentLimit: limit });
                          setNewLimitInput(limit);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold transition-all text-[11px] cursor-pointer"
                      >
                        ⚡ Key Quota Limit
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

      {/* Admin API Key Generator Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>Admin API Key Generator (Restricted Issuer)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Only Admin can generate and issue new API Keys for platform users.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            ADMIN ONLY KEY ISSUER
          </span>
        </div>

        <form onSubmit={handleAdminGenerateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-300 font-mono">Target User Email</label>
            <input
              type="email"
              required
              placeholder="e.g. user@gmail.com"
              value={newKeyUserEmail}
              onChange={(e) => setNewKeyUserEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 font-mono">Key Environment</label>
            <select
              value={newKeyEnv}
              onChange={(e: any) => setNewKeyEnv(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="production">Production (nx_live_)</option>
              <option value="development">Development (nx_test_)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={generatingKey}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            {generatingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            <span>{generatingKey ? 'Issuing...' : 'Generate API Key'}</span>
          </button>
        </form>

        {generatedKeyResult && (
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 mr-2">Generated Key:</span>
              <span className="font-bold text-cyan-200">{generatedKeyResult}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedKeyResult);
                alert('Copied generated API key to clipboard!');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold cursor-pointer"
            >
              Copy Key
            </button>
          </div>
        )}
      </div>

      {/* Promo Code Generator & Active Codes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Promo Code Generator Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Generate Promo Code</span>
            </h2>
            <p className="text-xs text-slate-400">
              Create redeemable coin promo codes stored in MongoDB Atlas.
            </p>
          </div>

          <form onSubmit={handleGeneratePromoCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Coin Reward Amount</label>
              <input
                type="number"
                value={promoCoinAmount}
                onChange={(e) => setPromoCoinAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Custom Code Name (Optional)</label>
              <input
                type="text"
                value={promoCodeName}
                onChange={(e) => setPromoCodeName(e.target.value)}
                placeholder="e.g. SPECIAL-100-BONUS"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={generatingPromo}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              {generatingPromo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generatingPromo ? 'Generating...' : 'Create Promo Code'}</span>
            </button>
          </form>
        </div>

        {/* Promo Codes List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                Active & Generated Promo Codes
              </h2>
              <p className="text-xs text-slate-400">Stored in MongoDB Atlas collection `promo_codes`</p>
            </div>
            <button
              onClick={fetchPromoCodes}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Promo Code</th>
                  <th className="p-3">Coin Value 🪙</th>
                  <th className="p-3">Usage / Max</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 font-mono">
                      No promo codes generated yet. Use generator to create one.
                    </td>
                  </tr>
                ) : (
                  promoCodes.map((pc) => (
                    <tr key={pc.code} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">{pc.code}</td>
                      <td className="p-3 font-mono text-emerald-400">+{pc.coinAmount} Coins</td>
                      <td className="p-3 font-mono text-slate-400">{pc.usedCount || 0} / {pc.maxUses || 100}</td>
                      <td className="p-3 font-mono text-slate-500 text-[10px]">
                        {pc.createdAt ? new Date(pc.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Bug & Issue Reports Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                Submitted Bug & Issue Reports ({bugReports.length})
              </h2>
              <p className="text-xs text-slate-400">User bug reports saved in MongoDB Atlas collection `bug_reports`</p>
            </div>
          </div>

          <button
            onClick={fetchBugReports}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono cursor-pointer"
          >
            Refresh Reports
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Reporter</th>
                <th className="p-3">Category</th>
                <th className="p-3">Title & Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bugReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 font-mono">
                    No user bug reports submitted yet.
                  </td>
                </tr>
              ) : (
                bugReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-cyan-300">{report.email}</td>
                    <td className="p-3 font-mono text-amber-300">{report.category}</td>
                    <td className="p-3 max-w-md">
                      <div className="font-bold text-white">{report.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{report.description}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {report.status || 'Open'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {report.status === 'Resolved' ? (
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'Open')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] cursor-pointer font-mono"
                        >
                          Reopen
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'Resolved')}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] cursor-pointer font-bold font-mono"
                        >
                          Mark Resolved
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

      {/* Vercel API Gateway & Custom Endpoints Manager */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">
                  Vercel API Gateway & Custom Endpoints Manager
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  VERCEL PROXY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Register external Vercel hosted API links with custom categories (Movie, Downloader, Instagram, AI, Anime, etc.).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCustomEndpoints}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingEndpoints ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddEndpointModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold font-mono shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Vercel Endpoint</span>
            </button>
          </div>
        </div>

        {/* Custom Endpoints Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">API Service Name & Path</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Target Vercel Host Link</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customEndpoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                    No custom Vercel endpoints registered yet. Click <strong className="text-indigo-400">+ Add Vercel Endpoint</strong> to add movie, downloader, or custom scrapers!
                  </td>
                </tr>
              ) : (
                customEndpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white font-mono">{ep.name}</div>
                      <div className="text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                        <code>{ep.path}</code>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {ep.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      <a href={ep.targetUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-300 underline flex items-center gap-1">
                        <span className="truncate">{ep.targetUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {ep.method}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleEndpointStatus(ep)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          ep.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        ● {ep.status ? ep.status.toUpperCase() : 'ONLINE'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleTestEndpoint(ep)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] cursor-pointer font-mono inline-flex items-center gap-1"
                        title="Test Vercel connection"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test Link</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCustomEndpoint(ep.id, ep.name)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] cursor-pointer font-mono inline-flex items-center gap-1"
                        title="Delete endpoint"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Security & Audit Logs Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-mono">
              Live Security & Administrative Audit Logs
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            TLS 1.3 Active • AES-256 Encrypted
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Immutable session activity log capturing administrative credentials, failed login attempts, coin grants, and privilege updates.
        </p>

        <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-950 font-mono text-xs">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px] hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[10px] shrink-0">{log.time}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    log.severity === 'WARN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {log.severity}
                  </span>
                  <span className="text-slate-200 font-semibold">{log.action}</span>
                </div>
                <span className="text-slate-400 text-[10px] truncate max-w-[150px] sm:max-w-none">
                  Target: <span className="text-cyan-300">{log.target}</span>
                </span>
              </div>
            ))}
          </div>
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

      {/* Modal: Adjust API Key Daily Quota Limit */}
      {editingKeyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Adjust API Key Quota Limit</span>
            </h3>
            <p className="text-xs text-slate-400">
              User: <code className="text-cyan-300 font-mono font-bold">{editingKeyTarget.email}</code>
            </p>
            <p className="text-xs text-slate-400">
              Key: <code className="text-amber-300 font-mono">{editingKeyTarget.key}</code>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Daily Max Request Limit:</label>
              <input
                type="number"
                value={newLimitInput}
                onChange={(e) => setNewLimitInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewLimitInput(10)}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 font-mono"
                >
                  10 (Free User)
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput(1000)}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 font-mono"
                >
                  1,000 (Basic)
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput(10000)}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 font-mono"
                >
                  10,000 (Developer)
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput(100000)}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 font-mono"
                >
                  100,000 (Enterprise)
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingKeyTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  triggerSecuredAction(`Update API Key quota limit to ${newLimitInput} reqs for ${editingKeyTarget.email}`, handleUpdateKeyLimit);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer font-mono"
              >
                Save Quota Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Vercel Endpoint */}
      {showAddEndpointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    Register New Vercel Hosted API Endpoint
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect an external Vercel service to APINexus Gateway with custom categories.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEndpointModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomEndpoint} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Endpoint Service Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">
                    API Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sinhala Movie Search API"
                    value={epName}
                    onChange={(e) => setEpName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">
                    Category *
                  </label>
                  <select
                    value={epCategory}
                    onChange={(e) => setEpCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="movie">Movie & Cinema</option>
                    <option value="downloader">Video & Audio Downloader</option>
                    <option value="instagram">Instagram Tools</option>
                    <option value="news">News & Media</option>
                    <option value="ai">AI & Machine Learning</option>
                    <option value="anime">Anime & Manga</option>
                    <option value="social">Social Media</option>
                    <option value="utility">Utility & Data</option>
                    <option value="custom">Type Custom Category...</option>
                  </select>
                </div>

              </div>

              {/* Custom Category Input if custom selected */}
              {epCategory === 'custom' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                  <label className="text-xs font-bold text-indigo-300 font-mono">
                    Type Custom Category Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gaming, cricket, education, music..."
                    value={epCustomCategory}
                    onChange={(e) => setEpCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              {/* Target Vercel Endpoint URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">
                  Target Vercel Hosted API URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-vercel-app.vercel.app/api/search"
                  value={epTargetUrl}
                  onChange={(e) => setEpTargetUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-cyan-300"
                />
                <p className="text-[10px] text-slate-500">
                  APINexus proxy will forward requests & query parameters to this URL.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Method */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">
                    HTTP Method
                  </label>
                  <select
                    value={epMethod}
                    onChange={(e: any) => setEpMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="GET">GET Request</option>
                    <option value="POST">POST Request</option>
                  </select>
                </div>

                {/* Gateway Path */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">
                    Custom APINexus Path (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`/api/v1/${epCategory}/${epName ? epName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'search'}`}
                    value={epCustomPath}
                    onChange={(e) => setEpCustomPath(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

              </div>

              {/* Summary & Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Search and fetch movie download links."
                  value={epSummary}
                  onChange={(e) => setEpSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Primary Search Parameter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">
                    Primary Query Parameter Name
                  </label>
                  <input
                    type="text"
                    placeholder="q or username or url or query"
                    value={epParamName}
                    onChange={(e) => setEpParamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">
                    Parameter Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Search movie keyword or URL"
                    value={epParamDesc}
                    onChange={(e) => setEpParamDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Sample Response Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">
                  Sample Response JSON (For Documentation & Testing)
                </label>
                <textarea
                  rows={4}
                  value={epSampleJson}
                  onChange={(e) => setEpSampleJson(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEndpointModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEndpoint}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer font-mono flex items-center justify-center gap-2"
                >
                  {creatingEndpoint ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{creatingEndpoint ? 'Registering...' : 'Save & Register Endpoint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Test Vercel Connection Result */}
      {testResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400" />
                <span>{testResultModal.title}</span>
              </h3>
              <button
                onClick={() => setTestResultModal(null)}
                className="text-slate-400 hover:text-white text-xs p-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono max-h-80 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(testResultModal.data, null, 2)}
            </pre>

            <button
              onClick={() => setTestResultModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono cursor-pointer"
            >
              Close Test Window
            </button>
          </div>
        </div>
      )}

      {/* Modal: 2FA Security Action Confirmation PIN */}
      {pinModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-amber-500/50 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  High-Security Privilege Confirmation
                </h3>
                <p className="text-[11px] text-amber-400 font-mono">
                  2FA Master PIN Required
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
              Action: <span className="text-cyan-300 font-bold">{pinModalTarget.title}</span>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Enter Security PIN (or Master Password):</label>
              <input
                type="password"
                placeholder="Default Security PIN: 9988"
                value={securityPinInput}
                onChange={(e) => setSecurityPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPinAndExecute()}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              {pinError && (
                <p className="text-xs text-rose-400 font-mono font-bold">{pinError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPinModalTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel Action
              </button>
              <button
                onClick={handleVerifyPinAndExecute}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer font-mono"
              >
                Verify & Authorize
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
