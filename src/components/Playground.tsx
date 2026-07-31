import React, { useState } from 'react';
import { 
  HttpMethod, 
  ApiKey, 
  ApiResponseResult 
} from '../types';
import { CodeBlock } from './CodeBlock';
import { 
  Play, 
  Plus, 
  Trash2, 
  Clock, 
  History, 
  Layers, 
  Check, 
  Copy, 
  Terminal, 
  Send,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface PlaygroundProps {
  activeKeys: ApiKey[];
}

interface HeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  durationMs: number;
  timestamp: string;
  body?: string;
}

export const Playground: React.FC<PlaygroundProps> = ({ activeKeys }) => {
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [url, setUrl] = useState<string>('https://api.nexus.dev/v1/ai/generate');
  const [selectedKey, setSelectedKey] = useState<string>(
    activeKeys.length > 0 ? activeKeys[0].key : 'nx_live_demo_982a3'
  );

  // Headers table
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: 'Accept', value: 'application/json', enabled: true },
    { id: '3', key: 'Authorization', value: `Bearer ${selectedKey}`, enabled: true },
  ]);

  // Request Body
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(
      {
        prompt: 'Generate 3 key benefits of edge API gateways',
        temperature: 0.7,
        format: 'json'
      },
      null,
      2
    )
  );

  // Active Tab in Editor (Body | Headers | Query)
  const [activeEditorTab, setActiveEditorTab] = useState<'body' | 'headers'>('body');

  // Execution state
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState<ApiResponseResult | null>({
    status: 200,
    statusText: 'OK',
    durationMs: 16,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-nexus-gateway': 'edge-router-v1',
      'x-nexus-rate-remaining': '999'
    },
    data: {
      id: 'nx_resp_92a3f10e',
      model: 'nexus-ai-flash-v2',
      benefits: [
        'Sub-20ms ultra-low global latency',
        'Automatic edge failover and TLS encryption',
        'Seamless integration with modern Vercel serverless apps'
      ],
      created: 1785462100
    },
    timestamp: new Date().toLocaleTimeString()
  });

  // Request history log
  const [history, setHistory] = useState<RequestHistoryItem[]>([
    {
      id: 'h1',
      method: 'POST',
      url: 'https://api.nexus.dev/v1/ai/generate',
      status: 200,
      durationMs: 16,
      timestamp: '10:42 AM'
    },
    {
      id: 'h2',
      method: 'GET',
      url: 'https://api.nexus.dev/v1/data/fx?base=USD',
      status: 200,
      durationMs: 12,
      timestamp: '10:38 AM'
    }
  ]);

  const addHeaderRow = () => {
    setHeaders(prev => [
      ...prev,
      { id: Date.now().toString(), key: '', value: '', enabled: true }
    ]);
  };

  const removeHeaderRow = (id: string) => {
    setHeaders(prev => prev.filter(h => h.id !== id));
  };

  const updateHeaderRow = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    setHeaders(prev =>
      prev.map(h => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleSendRequest = async () => {
    setIsSending(true);
    const startTime = performance.now();

    try {
      let parsedBody = {};
      try {
        if (requestBody.trim()) {
          parsedBody = JSON.parse(requestBody);
        }
      } catch (e) {
        // Invalid JSON body fallback
      }

      // Execute request or simulated proxy
      await new Promise(r => setTimeout(r, 220 + Math.random() * 150));
      const duration = Math.round(performance.now() - startTime);

      const newResp: ApiResponseResult = {
        status: 200,
        statusText: 'OK',
        durationMs: duration,
        headers: {
          'content-type': 'application/json',
          'x-nexus-request-id': `req_${Math.random().toString(36).substring(2, 9)}`,
          'x-nexus-region': 'us-east-1-edge'
        },
        data: {
          success: true,
          method,
          url,
          timestamp: new Date().toISOString(),
          request_payload: parsedBody,
          response: {
            message: 'Nexus API execution succeeded.',
            status: 'operational',
            echo_key: selectedKey.substring(0, 10) + '...'
          }
        },
        timestamp: new Date().toLocaleTimeString()
      };

      setResponse(newResp);

      // Add to history
      setHistory(prev => [
        {
          id: Date.now().toString(),
          method,
          url,
          status: 200,
          durationMs: duration,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>Interactive API Console Sandbox</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compose custom HTTP requests, set custom headers, inspect raw responses, and test live server endpoints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Request Form Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Method + URL Input Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="bg-slate-950 text-cyan-400 font-mono font-bold text-xs px-3 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-slate-950 text-white font-mono text-xs px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                placeholder="https://api.nexus.dev/v1/..."
              />

              <button
                onClick={handleSendRequest}
                disabled={isSending}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 fill-current" />
                )}
                <span>Send</span>
              </button>
            </div>

            {/* Editor Selector Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-800 pt-2 text-xs font-mono">
              <button
                onClick={() => setActiveEditorTab('body')}
                className={`pb-2 font-bold transition-all border-b-2 cursor-pointer ${
                  activeEditorTab === 'body'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON Body Payload
              </button>

              <button
                onClick={() => setActiveEditorTab('headers')}
                className={`pb-2 font-bold transition-all border-b-2 cursor-pointer ${
                  activeEditorTab === 'headers'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Headers ({headers.filter(h => h.enabled).length})
              </button>
            </div>

            {/* JSON Body Editor */}
            {activeEditorTab === 'body' && (
              <div className="space-y-2">
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed selection:bg-cyan-500/30"
                  placeholder="Insert valid JSON payload..."
                />
              </div>
            )}

            {/* Headers Editor Table */}
            {activeEditorTab === 'headers' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {headers.map((h) => (
                    <div key={h.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => updateHeaderRow(h.id, 'enabled', e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                      />
                      <input
                        type="text"
                        placeholder="Header Key (e.g. Authorization)"
                        value={h.key}
                        onChange={(e) => updateHeaderRow(h.id, 'key', e.target.value)}
                        className="flex-1 bg-slate-950 text-xs font-mono text-cyan-300 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Header Value"
                        value={h.value}
                        onChange={(e) => updateHeaderRow(h.id, 'value', e.target.value)}
                        className="flex-1 bg-slate-950 text-xs font-mono text-slate-300 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => removeHeaderRow(h.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addHeaderRow}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Header</span>
                </button>
              </div>
            )}
          </div>

          {/* Response Viewer Panel */}
          {response && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Response Output</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {response.status} {response.statusText}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{response.durationMs} ms</span>
                  </span>
                </div>

                <span className="text-xs font-mono text-slate-500">{response.timestamp}</span>
              </div>

              <CodeBlock
                code={JSON.stringify(response.data, null, 2)}
                language="json"
                title="Response Payload"
              />
            </div>
          )}

        </div>

        {/* Request History Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Console History</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{history.length} runs</span>
            </div>

            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setUrl(item.url)}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                      {item.method}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 truncate">{item.url}</div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400">HTTP {item.status}</span>
                    <span>•</span>
                    <span>{item.durationMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
