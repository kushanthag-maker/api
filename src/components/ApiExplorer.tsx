import React, { useState } from 'react';
import { 
  NEXUS_ENDPOINTS, 
  CODE_SNIPPETS 
} from '../data/endpointsData';
import { 
  ApiEndpoint, 
  CodeLanguage, 
  ApiResponseResult, 
  ApiKey 
} from '../types';
import { CodeBlock } from './CodeBlock';
import { 
  Search, 
  Play, 
  Zap, 
  Shield, 
  Database, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  AlertCircle,
  Terminal,
  RefreshCw,
  Sparkles,
  Download,
  Film,
  ExternalLink,
  Music
} from 'lucide-react';

interface ApiExplorerProps {
  activeKeys: ApiKey[];
  onOpenKeysModal: () => void;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({ activeKeys, onOpenKeysModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(NEXUS_ENDPOINTS[0]);
  const [activeCodeLang, setActiveCodeLang] = useState<CodeLanguage>('javascript');
  
  // Parameter State for the selected endpoint
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (NEXUS_ENDPOINTS[0].sampleRequestBody) {
      Object.assign(initial, NEXUS_ENDPOINTS[0].sampleRequestBody);
    }
    NEXUS_ENDPOINTS[0].params.forEach(p => {
      if (p.default !== undefined && !(p.name in initial)) {
        initial[p.name] = p.default;
      }
    });
    return initial;
  });

  const [selectedApiKey, setSelectedApiKey] = useState<string>(
    activeKeys.length > 0 ? activeKeys[0].key : 'nx_live_demo_982a3'
  );

  // Response execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ApiResponseResult | null>({
    status: 200,
    statusText: 'OK',
    durationMs: 18,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-nexus-rate-limit-remaining': '998',
      'x-nexus-region': 'us-east-1-edge',
      'cache-control': 'public, max-age=60'
    },
    data: NEXUS_ENDPOINTS[0].sampleResponseBody,
    timestamp: new Date().toLocaleTimeString()
  });

  // Filter endpoints
  const filteredEndpoints = NEXUS_ENDPOINTS.filter(ep => {
    const matchesCategory = selectedCategory === 'all' || ep.category === selectedCategory;
    const matchesSearch = 
      ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    const initial: Record<string, any> = {};
    if (ep.sampleRequestBody) {
      Object.assign(initial, ep.sampleRequestBody);
    }
    ep.params.forEach(p => {
      if (p.default !== undefined && !(p.name in initial)) {
        initial[p.name] = p.default;
      }
    });
    setParamValues(initial);
    setExecutionResult({
      status: 200,
      statusText: 'OK',
      durationMs: 14 + Math.floor(Math.random() * 12),
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-nexus-rate-limit-remaining': '995',
        'x-nexus-region': 'us-east-1-edge'
      },
      data: ep.sampleResponseBody,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleParamChange = (name: string, value: any) => {
    setParamValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const executeLiveRequest = async () => {
    setIsExecuting(true);
    const startTime = performance.now();

    try {
      let responseData: any = selectedEndpoint.sampleResponseBody;
      let status = 200;
      let statusText = 'OK';

      if (selectedEndpoint.method === 'POST') {
        const payload = {
          apiKey: selectedApiKey,
          ...paramValues
        };
        const res = await fetch(selectedEndpoint.path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': selectedApiKey,
            'Authorization': `Bearer ${selectedApiKey}`
          },
          body: JSON.stringify(payload)
        });
        
        responseData = await res.json();
        status = res.status;
        statusText = res.statusText;
      } else if (selectedEndpoint.method === 'GET') {
        const paramsToSend = {
          apiKey: selectedApiKey,
          ...paramValues
        };
        const queryParams = new URLSearchParams(paramsToSend).toString();
        const url = queryParams ? `${selectedEndpoint.path}?${queryParams}` : selectedEndpoint.path;
        const res = await fetch(url, {
          headers: {
            'x-api-key': selectedApiKey,
            'Authorization': `Bearer ${selectedApiKey}`
          }
        });
        
        responseData = await res.json();
        status = res.status;
        statusText = res.statusText;
      }

      const duration = Math.round(performance.now() - startTime);

      setExecutionResult({
        status,
        statusText,
        durationMs: duration > 0 ? duration : 18,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-nexus-request-id': `req_${Math.random().toString(36).substring(2, 10)}`,
          'x-nexus-region': 'us-east-1-edge'
        },
        data: responseData,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setExecutionResult({
        status: 400,
        statusText: 'Bad Request',
        durationMs: duration + 10,
        headers: {
          'content-type': 'application/json'
        },
        data: {
          status: 'error',
          message: (err as Error).message || 'Failed to execute API request'
        },
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const [copiedUrl, setCopiedUrl] = useState(false);
  const hostBase = typeof window !== 'undefined' ? window.location.origin : 'https://apinexusdev-blush.vercel.app';
  
  const buildFullQueryUrl = (endpoint: typeof selectedEndpoint, base: string, values: Record<string, string>) => {
    let urlPath = `${base}${endpoint.path}`;
    
    // Replace path parameters like :alias or :videoId
    endpoint.params.forEach(p => {
      if (p.location === 'path') {
        const val = values[p.name] || p.default || '';
        urlPath = urlPath.replace(`:${p.name}`, encodeURIComponent(val));
      }
    });

    const queryParts: string[] = [];
    endpoint.params.forEach(p => {
      if (p.location !== 'path') {
        const val = values[p.name] !== undefined ? values[p.name] : (p.default || '');
        if (val) {
          queryParts.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val)}`);
        }
      }
    });

    if (queryParts.length > 0) {
      return `${urlPath}?${queryParts.join('&')}`;
    }
    return urlPath;
  };

  const fullEndpointUrl = buildFullQueryUrl(selectedEndpoint, hostBase, paramValues);

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Generate current code snippet string
  const currentSnippetCode = CODE_SNIPPETS[activeCodeLang](
    selectedEndpoint,
    hostBase,
    selectedApiKey,
    paramValues
  );

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'ai': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'auth': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'data': return <Database className="w-4 h-4 text-indigo-400" />;
      case 'utility': return <Wrench className="w-4 h-4 text-amber-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">API Reference & Live Console</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Browse endpoints, customize payload parameters, copy SDK snippets, and test responses in real time.
          </p>
        </div>

        {/* API Key Selector */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 pl-2">Active Key:</span>
          <select
            value={selectedApiKey}
            onChange={(e) => setSelectedApiKey(e.target.value)}
            className="bg-slate-950 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            <option value="nx_live_demo_982a3">nx_live_demo_982a3 (Demo)</option>
            {activeKeys.map((k) => (
              <option key={k.id} value={k.key}>
                {k.name} ({k.key.substring(0, 12)}...)
              </option>
            ))}
          </select>
          <button
            onClick={onOpenKeysModal}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors cursor-pointer"
          >
            Manage Keys
          </button>
        </div>
      </div>

      {/* Main Grid: Left Catalog Sidebar, Right Endpoint Detail & Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search endpoints or paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'ai', label: 'AI' },
              { id: 'auth', label: 'Auth' },
              { id: 'data', label: 'Data' },
              { id: 'utility', label: 'Utility' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredEndpoints.map(ep => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${getMethodBadgeClass(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 truncate">{ep.path}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getCategoryIcon(ep.category)}
                    <h3 className="text-xs font-semibold text-white truncate">{ep.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{ep.summary}</p>
                </div>
              );
            })}

            {filteredEndpoints.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No endpoints found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Detail Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Selected Endpoint Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            
            {/* Title & Path */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg border ${getMethodBadgeClass(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{selectedEndpoint.name}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-2">
                    <span className="break-all">{fullEndpointUrl}</span>
                    <button
                      onClick={() => handleCopyUrl(fullEndpointUrl)}
                      className="text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer flex-shrink-0"
                      title="Copy Full Endpoint URL"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                  <span className="text-slate-500">|</span>
                  <span>Rate Limit: {selectedEndpoint.rateLimit}</span>
                </div>
              </div>

              {/* Live Test Trigger Button */}
              <button
                onClick={executeLiveRequest}
                disabled={isExecuting}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Test Endpoint Live</span>
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {/* Parameters Form Editor */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Request Parameters & Body</span>
              </h4>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                {selectedEndpoint.params.map((param) => (
                  <div key={param.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 last:border-none last:pb-0">
                    <div className="space-y-0.5 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-200">{param.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">({param.type})</span>
                        {param.required ? (
                          <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded">Required</span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500">Optional</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{param.description}</p>
                    </div>

                    <div className="sm:w-64">
                      <input
                        type="text"
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder={`e.g. ${param.default || ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippet Multi-Language Selector & Renderer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Generated Code Snippet</span>
                </h4>

                {/* SDK Language Tabs */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  {(['curl', 'javascript', 'python', 'go', 'rust', 'php'] as CodeLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveCodeLang(lang)}
                      className={`px-2.5 py-1 rounded font-mono capitalize transition-all cursor-pointer ${
                        activeCodeLang === lang
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Syntax Highlighted Code Block */}
              <CodeBlock code={currentSnippetCode} language={activeCodeLang} title={`${selectedEndpoint.id}.${activeCodeLang}`} />
            </div>

            {/* Execution Response Inspector */}
            {executionResult && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Response Inspector</span>
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      HTTP {executionResult.status} {executionResult.statusText}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{executionResult.durationMs} ms</span>
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">{executionResult.timestamp}</span>
                </div>

                <CodeBlock
                  code={JSON.stringify(executionResult.data, null, 2)}
                  language="json"
                  title="Response Body (application/json)"
                />

                {/* Interactive Download Streams Panel if response has download_streams */}
                {executionResult.data?.download_streams && Array.isArray(executionResult.data.download_streams) && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 space-y-4 shadow-2xl mt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        {executionResult.data.thumbnail && (
                          <div className="relative rounded-lg overflow-hidden w-20 h-12 bg-slate-950 flex-shrink-0 border border-slate-800">
                            <img src={executionResult.data.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-cyan-300 px-1 rounded">
                              {executionResult.data.duration}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{executionResult.data.title || 'Extracted YouTube Stream'}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{executionResult.data.channel}</span>
                            {executionResult.data.view_count && <span>• {executionResult.data.view_count} views</span>}
                          </p>
                        </div>
                      </div>

                      {executionResult.data.youtube_watch_url && (
                        <a
                          href={executionResult.data.youtube_watch_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Watch Original</span>
                        </a>
                      )}
                    </div>

                    {/* Stream Links List */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Direct Download Stream Links</span>
                        <span className="text-[10px] text-cyan-400">High Speed CDN Stream</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {executionResult.data.download_streams.map((stream: any, idx: number) => {
                          const isAudio = stream.format === 'mp3' || (stream.quality && stream.quality.includes('Audio'));
                          const targetStreamUrl = stream.download_url || stream.direct_media_url;

                          return (
                            <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 hover:border-cyan-500/40 transition-all">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-2 rounded-lg ${isAudio ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                  {isAudio ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-200">{stream.quality}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                                      {stream.format}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                                    <span>{stream.resolution}</span>
                                    <span>•</span>
                                    <span>{stream.file_size}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <a
                                  href={targetStreamUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
