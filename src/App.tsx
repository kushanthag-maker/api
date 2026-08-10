import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ApiExplorer } from './components/ApiExplorer';
import { Playground } from './components/Playground';
import { KeyManager } from './components/KeyManager';
import { AnalyticsView } from './components/AnalyticsView';
import { PricingTiers } from './components/PricingTiers';
import { VercelDeployModal } from './components/VercelDeployModal';
import { LoginModal } from './components/LoginModal';
import { SiteRulesModal } from './components/SiteRulesModal';
import { AdminPanel } from './components/AdminPanel';
import { NewsExplorer } from './components/NewsExplorer';
import { InstagramExplorer } from './components/InstagramExplorer';
import { ReportIssueModal } from './components/ReportIssueModal';
import { IntroAnimation } from './components/IntroAnimation';
import { Footer } from './components/Footer';
import { ApiKey, UserProfile } from './types';
import { secureGetStorage, secureSetStorage } from './lib/security';
import { 
  Zap, 
  Terminal, 
  ArrowRight
} from 'lucide-react';

const INITIAL_KEYS: ApiKey[] = [];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [vercelModalOpen, setVercelModalOpen] = useState<boolean>(false);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return !sessionStorage.getItem('nexus_intro_shown');
  });

  // Obfuscated & Persistent API Keys Storage
  const [keys, setKeys] = useState<ApiKey[]>(() => {
    return secureGetStorage<ApiKey[]>('nexus_api_keys', INITIAL_KEYS);
  });

  // Sync keys to backend & obfuscated local storage on change
  useEffect(() => {
    try {
      secureSetStorage('nexus_api_keys', keys);
      keys.forEach(k => {
        if (k.status === 'active') {
          fetch('/api/v1/keys/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: k.key,
              name: k.name,
              usageLimit: k.usageLimit,
              environment: k.environment
            })
          }).catch(() => {});
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, [keys]);

  // Real-Time Quota & Usage Counter Synchronization Effect (Polls server every 3s)
  useEffect(() => {
    if (keys.length === 0) return;

    const pollKeyUsage = async () => {
      try {
        const keyStrings = keys.map(k => k.key);
        const res = await fetch('/api/v1/keys/batch-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys: keyStrings })
        });
        const data = await res.json();
        if (data.status && data.keysStatus) {
          setKeys(prevKeys => {
            let hasChanged = false;
            const updated = prevKeys.map(k => {
              const liveData = data.keysStatus[k.key];
              if (liveData) {
                const newUsage = Math.max(k.usageToday || 0, liveData.usageToday ?? 0);
                const newLimit = liveData.usageLimit ?? k.usageLimit;
                const newStatus = liveData.status === 'revoked' ? 'revoked' : k.status;

                if (newUsage !== k.usageToday || newLimit !== k.usageLimit || newStatus !== k.status) {
                  hasChanged = true;
                  return {
                    ...k,
                    usageToday: newUsage,
                    usageLimit: newLimit,
                    status: newStatus
                  };
                }
              }
              return k;
            });
            return hasChanged ? updated : prevKeys;
          });
        }
      } catch (err) {
        // silent sync retry
      }
    };

    pollKeyUsage();
    const interval = setInterval(pollKeyUsage, 3000);
    return () => clearInterval(interval);
  }, [keys.length]);

  const handleCreateKey = (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsed' | 'usageToday'>) => {
    const newKeyItem: ApiKey = {
      ...keyData,
      id: `key_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      usageToday: 0
    };

    // Register key on server using public sync
    fetch('/api/v1/keys/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: newKeyItem.key,
        name: newKeyItem.name,
        usageLimit: newKeyItem.usageLimit,
        environment: newKeyItem.environment
      })
    }).catch(err => console.error('Key sync failed', err));

    setKeys(prev => [newKeyItem, ...prev]);
  };

  const handleRevokeKey = (keyId: string) => {
    setKeys(prev =>
      prev.map(k => (k.id === keyId ? { ...k, status: k.status === 'active' ? 'revoked' : 'active' } : k))
    );
  };

  const handleDeleteKey = (keyId: string) => {
    setKeys(prev => prev.filter(k => k.id !== keyId));
  };

  const activeKeys = keys.filter(k => k.status === 'active');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col overflow-x-hidden max-w-full w-full">
      
      {/* High-Tech Entrance Animation */}
      {showIntro && (
        <IntroAnimation
          onComplete={() => {
            setShowIntro(false);
            sessionStorage.setItem('nexus_intro_shown', 'true');
          }}
        />
      )}

      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVercelModal={() => setVercelModalOpen(true)}
        onOpenKeysModal={() => setActiveTab('keys')}
        keyCount={activeKeys.length}
        onOpenRulesModal={() => setRulesModalOpen(true)}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <Hero
              onExploreDocs={() => setActiveTab('docs')}
              onOpenSandbox={() => setActiveTab('playground')}
              onOpenVercelModal={() => setVercelModalOpen(true)}
            />

            {/* Core Features Showcase Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Why Developers Choose <span className="text-cyan-400">Nexus News API</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Engineered from the ground up for real-time news intelligence, high performance, and direct API key authentication.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl hover:border-cyan-500/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Sub-20ms News Gateway</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Direct scraping from Ada Derana with instant title, paragraph, timestamp, and image extraction.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl hover:border-indigo-500/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">API Key Authentication</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Secure API key verification without complex coin management or credit deductions.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl hover:border-emerald-500/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 22.5D12 0 0 22.5h24z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Zero-Config Vercel Hosting</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pre-configured with <code className="text-cyan-300 font-mono">vercel.json</code> rewrite rules for one-click Vercel deployment.
                  </p>
                </div>

              </div>

              {/* Quick Start Teaser CTA */}
              <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Ready to test News API in your app?</h3>
                  <p className="text-xs text-slate-300">
                    Explore the live interactive documentation and send test requests in under 30 seconds.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('docs')}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Open API Explorer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </section>
          </div>
        )}

        {activeTab === 'docs' && (
          <ApiExplorer
            activeKeys={activeKeys}
            onOpenKeysModal={() => setActiveTab('keys')}
          />
        )}

        {activeTab === 'news' && <NewsExplorer />}

        {activeTab === 'instagram' && <InstagramExplorer />}

        {activeTab === 'playground' && (
          <Playground activeKeys={activeKeys} />
        )}

        {activeTab === 'keys' && (
          <KeyManager
            keys={keys}
            onCreateKey={handleCreateKey}
            onRevokeKey={handleRevokeKey}
            onDeleteKey={handleDeleteKey}
            onGoToAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'pricing' && (
          <PricingTiers onSelectPlan={() => setActiveTab('keys')} />
        )}

        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenVercelModal={() => setVercelModalOpen(true)}
      />

      {/* Vercel Hosting Modal */}
      <VercelDeployModal
        isOpen={vercelModalOpen}
        onClose={() => setVercelModalOpen(false)}
      />

      {/* Platform Rules Modal */}
      <SiteRulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />

      {/* Bug & Issue Reporting Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentUser={null}
      />

    </div>
  );
}
