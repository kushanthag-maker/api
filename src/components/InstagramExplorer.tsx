import React, { useState, useEffect } from 'react';
import { secureGetStorage, secureSetStorage } from '../lib/security';
import { 
  Instagram, 
  Search, 
  Download, 
  User, 
  Users, 
  Film, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Key, 
  RefreshCw, 
  Sparkles,
  ShieldCheck,
  Video
} from 'lucide-react';

export const InstagramExplorer: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    const savedKey = secureGetStorage<string>('nexus_ig_api_key', '');
    if (savedKey) return savedKey;
    try {
      const keysList = secureGetStorage<any[]>('nexus_api_keys', []);
      if (Array.isArray(keysList) && keysList.length > 0) {
        const active = keysList.find((k: any) => k.status === 'active');
        if (active) return active.key;
      }
    } catch (e) {}
    return '';
  });

  const [activeSubTab, setActiveSubTab] = useState<'stalk' | 'download'>('stalk');

  // Stalker State
  const [usernameInput, setUsernameInput] = useState<string>('cristiano');
  const [stalkLoading, setStalkLoading] = useState<boolean>(false);
  const [stalkResult, setStalkResult] = useState<any>(null);
  const [stalkError, setStalkError] = useState<string | null>(null);

  // Downloader State
  const [downloadUrlInput, setDownloadUrlInput] = useState<string>('');
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [downloadResult, setDownloadResult] = useState<any>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  useEffect(() => {
    if (apiKey) {
      secureSetStorage('nexus_ig_api_key', apiKey.trim());
    }
  }, [apiKey]);

  const handleStalkSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activeKey = apiKey.trim();
    if (!activeKey) {
      setStalkError('Please enter a valid Nexus API key.');
      return;
    }
    if (!usernameInput.trim()) {
      setStalkError('Please enter an Instagram username or profile URL.');
      return;
    }

    setStalkLoading(true);
    setStalkError(null);
    setStalkResult(null);

    try {
      const res = await fetch(`/api/v1/instagram/stalk?username=${encodeURIComponent(usernameInput.trim())}&apiKey=${encodeURIComponent(activeKey)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setStalkResult(data);
      } else {
        setStalkError(data.message || 'Failed to fetch Instagram profile data.');
      }
    } catch (err: any) {
      setStalkError(err?.message || 'Network error fetching profile.');
    } finally {
      setStalkLoading(false);
    }
  };

  const handleDownloadSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activeKey = apiKey.trim();
    if (!activeKey) {
      setDownloadError('Please enter a valid Nexus API key.');
      return;
    }
    if (!downloadUrlInput.trim()) {
      setDownloadError('Please enter an Instagram Post or Reel URL.');
      return;
    }

    setDownloadLoading(true);
    setDownloadError(null);
    setDownloadResult(null);

    try {
      const res = await fetch(`/api/v1/instagram/download?url=${encodeURIComponent(downloadUrlInput.trim())}&apiKey=${encodeURIComponent(activeKey)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setDownloadResult(data);
      } else {
        setDownloadError(data.message || 'Failed to parse Instagram media link.');
      }
    } catch (err: any) {
      setDownloadError(err?.message || 'Network error parsing Instagram link.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const currentStalkCurl = `curl -X GET "${window.location.origin}/api/v1/instagram/stalk?username=${encodeURIComponent(usernameInput.trim() || 'cristiano')}&apiKey=${apiKey.trim() || 'YOUR_NEXUS_API_KEY'}"`;
  const currentDownloadCurl = `curl -X GET "${window.location.origin}/api/v1/instagram/download?url=${encodeURIComponent(downloadUrlInput.trim() || 'https://www.instagram.com/reel/C3x9L9vI1AB/')}&apiKey=${apiKey.trim() || 'YOUR_NEXUS_API_KEY'}"`;

  const copyToClipboard = (text: string, type: 'url' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-900/40 via-purple-950/60 to-slate-900 border border-pink-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono font-medium">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>INSTAGRAM SUITE API v2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-3">
              Instagram Stalker & Media Downloader API
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Instantly stalk Instagram profiles, inspect follower stats, biographies, and extract high-speed video/photo direct download CDN URLs for posts and Reels.
            </p>
          </div>

          {/* API Key Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 min-w-[280px]">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-pink-400" /> API Authentication</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Nexus API Key..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-pink-300 focus:outline-none focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-3 mt-6 border-t border-slate-800/80 pt-6">
          <button
            onClick={() => setActiveSubTab('stalk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeSubTab === 'stalk'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Stalker / Search API</span>
          </button>

          <button
            onClick={() => setActiveSubTab('download')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeSubTab === 'download'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Reels & Photo Downloader API</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STALKER / PROFILE SEARCH */}
      {activeSubTab === 'stalk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form & Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 text-pink-400 font-mono text-sm font-bold">
                <Search className="w-4 h-4" />
                <span>Stalk Instagram Profile</span>
              </div>

              <form onSubmit={handleStalkSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-mono mb-1.5">Instagram Username or Profile URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. cristiano or instagram"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-pink-500 transition-all"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={stalkLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {stalkLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching Instagram Profile...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Stalk Profile Now</span>
                    </>
                  )}
                </button>
              </form>

              {stalkError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{stalkError}</span>
                </div>
              )}

              {/* cURL Request Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5 text-pink-400" /> API Request Endpoint</span>
                  <button
                    onClick={() => copyToClipboard(currentStalkCurl, 'url')}
                    className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                  {currentStalkCurl}
                </pre>
              </div>
            </div>
          </div>

          {/* Result Card & Response Viewer */}
          <div className="lg:col-span-7 space-y-6">
            {stalkResult ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
                
                {/* Profile Card Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-pink-500/30">
                  <div className="relative">
                    <img
                      src={stalkResult.profile_pic}
                      alt={stalkResult.username}
                      className="w-24 h-24 rounded-full object-cover border-2 border-pink-500/50 shadow-xl"
                      onError={(e: any) => {
                        e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${stalkResult.username}`;
                      }}
                    />
                    {stalkResult.is_verified && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 shadow-md">
                        <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-bold text-white font-mono">@{stalkResult.username}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                        {stalkResult.is_private ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 font-medium">{stalkResult.full_name}</p>

                    {stalkResult.biography && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        "{stalkResult.biography}"
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-4">
                      <a
                        href={stalkResult.profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View on Instagram</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Stats Counter */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-mono mb-1">Followers</div>
                    <div className="text-lg font-bold text-pink-400 font-mono">{stalkResult.followers}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-mono mb-1">Following</div>
                    <div className="text-lg font-bold text-purple-400 font-mono">{stalkResult.following}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-mono mb-1">Posts</div>
                    <div className="text-lg font-bold text-indigo-400 font-mono">{stalkResult.posts_count}</div>
                  </div>
                </div>

                {/* JSON Response Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-pink-400" /> Raw API Response JSON</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(stalkResult, null, 2), 'json')}
                      className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 max-h-64 overflow-y-auto">
                    {JSON.stringify(stalkResult, null, 2)}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto text-pink-400">
                  <Instagram className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-mono">Ready to Stalk Instagram Profiles</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                  Enter any username (e.g., <code className="text-pink-300">cristiano</code>) to inspect real-time follower stats, avatar photos, and biography content.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MEDIA & REELS DOWNLOADER */}
      {activeSubTab === 'download' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 text-pink-400 font-mono text-sm font-bold">
                <Download className="w-4 h-4" />
                <span>Instagram Media Downloader</span>
              </div>

              <form onSubmit={handleDownloadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-mono mb-1.5">Instagram Post, Reel or IGTV Link</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={downloadUrlInput}
                      onChange={(e) => setDownloadUrlInput(e.target.value)}
                      placeholder="e.g. https://www.instagram.com/reel/C3x9L9vI1AB/"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-pink-500 transition-all"
                    />
                    <Video className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={downloadLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloadLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting Download Links...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Extract Media Link</span>
                    </>
                  )}
                </button>
              </form>

              {downloadError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{downloadError}</span>
                </div>
              )}

              {/* cURL Request Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5 text-pink-400" /> API Downloader Endpoint</span>
                  <button
                    onClick={() => copyToClipboard(currentDownloadCurl, 'url')}
                    className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                  {currentDownloadCurl}
                </pre>
              </div>
            </div>
          </div>

          {/* Download Results */}
          <div className="lg:col-span-7 space-y-6">
            {downloadResult ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
                
                <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-slate-950 border border-pink-500/30 items-center">
                  <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                    <img
                      src={downloadResult.thumbnail || downloadResult.download_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-pink-300 border border-pink-500/30 uppercase font-mono">
                      {downloadResult.type}
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="text-xs text-slate-400 font-mono">Post Caption / Shortcode</div>
                      <p className="text-sm text-white font-medium line-clamp-3 mt-1">
                        {downloadResult.caption || `Shortcode: ${downloadResult.shortcode}`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <a
                        href={downloadResult.download_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download High-Quality {downloadResult.type === 'video' ? 'Reel Video' : 'Photo'}</span>
                      </a>

                      <a
                        href={downloadResult.original_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
                        <span>Open Original Post</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* JSON Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-pink-400" /> Extracted Media JSON Data</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(downloadResult, null, 2), 'json')}
                      className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 max-h-64 overflow-y-auto">
                    {JSON.stringify(downloadResult, null, 2)}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto text-pink-400">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-mono">Ready to Extract Reels & Media Links</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                  Paste any Instagram Post or Reel link above to parse high-speed video/photo direct download links instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
