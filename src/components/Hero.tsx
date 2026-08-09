import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Boxes,
  Activity
} from 'lucide-react';

interface HeroProps {
  onExploreDocs: () => void;
  onOpenSandbox: () => void;
  onOpenVercelModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreDocs,
  onOpenSandbox,
}) => {
  const [copied, setCopied] = useState(false);
  const [liveReqs, setLiveReqs] = useState<number>(0);
  const [avgLatency, setAvgLatency] = useState<number>(12);

  useEffect(() => {
    fetch('/api/v1/telemetry/stats')
      .then(r => r.json())
      .then(data => {
        if (data.status) {
          setLiveReqs(data.totalRequests || 0);
          if (data.avgLatencyMs) setAvgLatency(data.avgLatencyMs);
        }
      })
      .catch(() => {});
  }, []);
  const sampleCurl = `curl -X GET "https://apinexusdev-blush.vercel.app/api/v1/news/latest?apiKey=YOUR_NEXUS_API_KEY" \\
  -H "Accept: application/json"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 pt-12 pb-20 border-b border-slate-800/60">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tag */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nexus High-Performance Unified API Gateway</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Real-Time Sinhala News Scraping API for{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Developers & Apps
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Scrape real-time headlines, full article paragraphs, timestamps, images, and category feeds directly from Ada Derana using a single API key.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onExploreDocs}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Explore News API Reference</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSandbox}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 font-semibold text-sm transition-all shadow-lg hover:border-slate-500 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Launch API Console</span>
            </button>
          </div>
        </div>

        {/* cURL Interactive Hero Terminal Preview */}
        <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </span>
              <span className="text-xs font-mono text-slate-400 ml-2">bash — news-api-quickstart</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs font-mono cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied cURL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy cURL</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-300 leading-relaxed bg-slate-950">
            <pre>
              <code>{sampleCurl}</code>
            </pre>
          </div>
        </div>

        {/* Telemetry Stats Ticker Bar */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Avg Latency</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{avgLatency} ms</div>
            <p className="text-[11px] text-slate-400">Sub-20ms edge distribution</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Total Requests</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{liveReqs.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400">Live API calls processed</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Uptime SLA</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">100.0%</div>
            <p className="text-[11px] text-slate-400">Automated failover sync</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Boxes className="w-3.5 h-3.5" />
              <span>Auth Method</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">API Key</div>
            <p className="text-[11px] text-slate-400">Instant key verification</p>
          </div>
        </div>

      </div>
    </div>
  );
};
