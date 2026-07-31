import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { PricingPlan } from '../types';

interface PricingTiersProps {
  onSelectPlan: (planName: string) => void;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [estMonthlyReqs, setEstMonthlyReqs] = useState<number>(250000);

  const plans: PricingPlan[] = [
    {
      id: 'developer',
      name: 'Developer Starter',
      price: 0,
      period: billingCycle,
      requestsPerMonth: '10,000 requests / month',
      rateLimit: '120 req / minute',
      features: [
        'Access to AI, Auth, Data & Utility APIs',
        'Interactive Developer Sandbox Console',
        'Up to 3 Active API Keys',
        '28 Global Edge Routing Locations',
        'Community Discord Support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Scale',
      price: billingCycle === 'month' ? 29 : 23,
      period: billingCycle,
      requestsPerMonth: '1,000,000 requests / month',
      rateLimit: '2,000 req / minute',
      features: [
        'Everything in Developer Starter',
        'Sub-15ms Priority Edge Processing',
        'Unlimited Active API Keys',
        'Real-time Telemetry Analytics & Logs',
        'Custom Webhooks & Vanity Domains',
        '99.99% Guaranteed SLA Uptime',
        '24/7 Priority Email & Chat Support'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Edge',
      price: billingCycle === 'month' ? 299 : 239,
      period: billingCycle,
      requestsPerMonth: '100,000,000+ requests / month',
      rateLimit: 'Custom SLA rate limits',
      features: [
        'Everything in Pro Scale',
        'Dedicated Private Edge Clusters',
        'Custom Fine-Tuned AI Models',
        'Zero-Data Retention Compliance (SOC2 / HIPAA)',
        'Custom SSO & SAML Authentication',
        'Dedicated Solutions Architect',
        '99.999% SLA & Custom Contract Billing'
      ]
    }
  ];

  // Calculate estimated tier cost based on slider
  const getRecommendedPlan = (reqs: number) => {
    if (reqs <= 10000) return 'Developer Starter (Free)';
    if (reqs <= 1000000) return 'Pro Scale ($29/mo)';
    return 'Enterprise Edge (Custom SLA)';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Transparent Developer Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Simple, Predictable API Pricing
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Start for free with 10k monthly requests, then scale seamlessly with high-speed global edge distribution.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <span className={`text-xs font-mono font-medium ${billingCycle === 'month' ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === 'month' ? 'year' : 'month')}
            className="relative w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-1 transition-colors cursor-pointer"
          >
            <div
              className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${
                billingCycle === 'year' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>

          <span className={`text-xs font-mono font-medium flex items-center gap-1.5 ${billingCycle === 'year' ? 'text-white' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 rounded-2xl bg-slate-900 border transition-all space-y-6 shadow-xl ${
              plan.popular
                ? 'border-cyan-500 shadow-cyan-500/10 ring-1 ring-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-extrabold text-[10px] font-mono tracking-wider uppercase shadow-md">
                ★ Most Popular for Scale
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-xs font-mono text-cyan-400">{plan.requestsPerMonth}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white font-mono">${plan.price}</span>
              <span className="text-xs font-mono text-slate-400">/{plan.period}</span>
            </div>

            <button
              onClick={() => onSelectPlan(plan.name)}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                plan.popular
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              }`}
            >
              Select {plan.name}
            </button>

            <div className="border-t border-slate-800/80 pt-6 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Included Capabilities
              </span>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ))}
      </div>

      {/* Interactive Usage Cost Calculator */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Interactive Request Volume Estimator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag the slider to estimate your monthly API request volume and see the recommended tier.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            Recommended Tier: <span className="font-bold text-emerald-400">{getRecommendedPlan(estMonthlyReqs)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-300">
            <span>Monthly API Calls:</span>
            <span className="text-lg font-bold text-cyan-400">{estMonthlyReqs.toLocaleString()} reqs/mo</span>
          </div>

          <input
            type="range"
            min={5000}
            max={5000000}
            step={25000}
            value={estMonthlyReqs}
            onChange={(e) => setEstMonthlyReqs(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>5,000 reqs</span>
            <span>1,000,000 reqs</span>
            <span>5,000,000+ reqs</span>
          </div>
        </div>
      </div>

    </div>
  );
};
