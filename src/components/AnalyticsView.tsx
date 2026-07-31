import React from 'react';
import { 
  BarChart2, 
  Globe, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Server, 
  TrendingUp, 
  Cpu 
} from 'lucide-react';
import { RegionLatency } from '../types';

export const AnalyticsView: React.FC = () => {
  const regions: RegionLatency[] = [
    { region: 'US East (N. Virginia)', code: 'us-east-1', latencyMs: 12, status: 'optimal' },
    { region: 'US West (Oregon)', code: 'us-west-2', latencyMs: 16, status: 'optimal' },
    { region: 'Europe (Frankfurt)', code: 'eu-central-1', latencyMs: 14, status: 'optimal' },
    { region: 'Asia Pacific (Singapore)', code: 'ap-southeast-1', latencyMs: 18, status: 'optimal' },
    { region: 'Asia Pacific (Tokyo)', code: 'ap-northeast-1', latencyMs: 21, status: 'optimal' },
    { region: 'South America (São Paulo)', code: 'sa-east-1', latencyMs: 28, status: 'optimal' },
  ];

  const endpointTraffic = [
    { name: 'POST /v1/ai/generate', share: '42%', reqs: '1.2M reqs', color: 'bg-cyan-500' },
    { name: 'GET /v1/data/fx', share: '24%', reqs: '680K reqs', color: 'bg-indigo-500' },
    { name: 'POST /v1/auth/hash', share: '18%', reqs: '510K reqs', color: 'bg-emerald-500' },
    { name: 'POST /v1/util/shorten', share: '16%', reqs: '450K reqs', color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-cyan-400" />
            <span>Nexus Edge Telemetry & Analytics</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time latency metrics, global edge node health, request volumes, and error rate telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live Stream: 2,410 req/sec</span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Requests (24h)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">2,840,192</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Global Edge Latency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">14.2 ms</div>
          <p className="text-xs text-slate-400">p99: 22ms across 28 edge locations</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>System Success SLA</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">99.998%</div>
          <p className="text-xs text-slate-400">0 downtime incidents reported</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Error Rate (4xx/5xx)</span>
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">0.002%</div>
          <p className="text-xs text-slate-400">Rate-limit throttles: 14 total</p>
        </div>

      </div>

      {/* Global Edge Heatmap & Traffic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Edge Region Status (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Global Edge Network Latency</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">28 Active Edge PoPs</span>
          </div>

          <div className="space-y-3">
            {regions.map((reg) => (
              <div key={reg.code} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-bold text-white">{reg.region}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{reg.code}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-300">{reg.latencyMs} ms</span>
                  <p className="text-[10px] font-mono text-slate-400">Optimal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Share Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Traffic Distribution by API</span>
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            {endpointTraffic.map((ep) => (
              <div key={ep.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200 font-bold">{ep.name}</span>
                  <span className="text-slate-400">{ep.reqs} ({ep.share})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full ${ep.color}`} style={{ width: ep.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
