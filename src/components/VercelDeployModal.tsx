import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ArrowUpRight, 
  CheckCircle2, 
  Globe, 
  Terminal, 
  Key, 
  Zap, 
  Code2,
  Sparkles
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);
  const [copiedCliCmd, setCopiedCliCmd] = useState(false);

  if (!isOpen) return null;

  const vercelJsonContent = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const cliCommand = `npm install -g vercel
vercel login
vercel --prod`;

  const copyVercelJson = () => {
    navigator.clipboard.writeText(vercelJsonContent);
    setCopiedVercelJson(true);
    setTimeout(() => setCopiedVercelJson(false), 2000);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCliCmd(true);
    setTimeout(() => setCopiedCliCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M24 22.5D12 0 0 22.5h24z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Deploy Nexus API Site to Vercel</h3>
              <p className="text-xs text-slate-400">Complete setup guide and configuration for zero-config Vercel hosting.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deploy Callout Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vercel Deploy Ready</span>
            </span>
            <p className="text-xs text-slate-300">
              This repository is pre-configured with Vite static output and single-page routing rewrite rules.
            </p>
          </div>

          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
              <path d="M24 22.5D12 0 0 22.5h24z" />
            </svg>
            <span>Deploy on Vercel Now</span>
            <ArrowUpRight className="w-4 h-4 text-slate-900" />
          </a>
        </div>

        {/* Step-by-Step Deployment Instructions */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Step-by-Step Hosting Guide
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Push or Export Code</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Export or push your project files to your GitHub / GitLab repository, or download the ZIP from AI Studio.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Import on Vercel</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                In Vercel Dashboard, click <b>Add New Project</b>, select your repository, and choose <b>Vite</b> framework preset.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Set Environment Vars</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Add optional secrets like <code className="text-cyan-300">NEXUS_API_KEY</code> in Vercel Project Settings → Environment Variables.
              </p>
            </div>
          </div>
        </div>

        {/* vercel.json File Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Project vercel.json Configuration</span>
            </h4>
            <button
              onClick={copyVercelJson}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
            >
              {copiedVercelJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied vercel.json</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
          </div>

          <CodeBlock code={vercelJsonContent} language="json" title="vercel.json" />
        </div>

        {/* Deploy via Vercel CLI Option */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Option: Deploy via Vercel CLI</span>
            </h4>
            <button
              onClick={copyCliCommand}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
            >
              {copiedCliCmd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied Commands</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy CLI Commands</span>
                </>
              )}
            </button>
          </div>

          <CodeBlock code={cliCommand} language="bash" title="terminal" />
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
