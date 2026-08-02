import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Search, 
  Flame, 
  Trophy, 
  Globe, 
  TrendingUp, 
  Tv, 
  RefreshCw, 
  ExternalLink, 
  Code, 
  Copy, 
  Check, 
  X,
  FileText,
  Clock,
  Coins
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  time: string;
  image: string | null;
  url: string;
  category: string;
}

export const NewsExplorer: React.FC = () => {
  const [category, setCategory] = useState<string>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Article Detail Modal state
  const [selectedNewsUrl, setSelectedNewsUrl] = useState<string | null>(null);
  const [articleLoading, setArticleLoading] = useState<boolean>(false);
  const [articleData, setArticleData] = useState<any>(null);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const categories = [
    { id: 'latest', label: 'Latest News', icon: Newspaper },
    { id: 'hot', label: 'Hot / Top News', icon: Flame },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'world', label: 'World News', icon: Globe },
    { id: 'business', label: 'Business', icon: TrendingUp },
    { id: 'entertainment', label: 'Entertainment', icon: Tv },
  ];

  const fetchNews = async (cat: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = query && query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
      const response = await fetch(`/api/v1/news/latest?category=${cat}${queryParam}`);
      const data = await response.json();
      
      if (data.status && Array.isArray(data.results)) {
        setNewsList(data.results);
      } else {
        setError(data.message || 'Failed to fetch news updates.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(category, searchQuery);
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(category, searchQuery);
  };

  const openArticleModal = async (url: string) => {
    setSelectedNewsUrl(url);
    setArticleLoading(true);
    setArticleData(null);
    setArticleError(null);

    try {
      const response = await fetch('/api/v1/news/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();

      if (data.status) {
        setArticleData(data);
      } else {
        setArticleError(data.message || 'Failed to load article detail.');
      }
    } catch (err: any) {
      setArticleError(err?.message || 'Failed to connect to news detail API.');
    } finally {
      setArticleLoading(false);
    }
  };

  const currentApiUrl = `${window.location.origin}/api/v1/news/latest?category=${category}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Ada Derana Live Scraper API</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ada Derana News & Category Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Real-time automated scraping & structured JSON REST endpoint for Ada Derana News in Sri Lanka.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0 text-xs font-mono">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Cost: <strong className="text-amber-300">2 Coins</strong> / Request</span>
          </div>
        </div>

        {/* API Endpoint Preview Box */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto text-slate-300">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
            <span className="text-cyan-300 truncate">{currentApiUrl}</span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(currentApiUrl);
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer text-xs"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied' : 'Copy Endpoint'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Sinhala or English news keywords..."
            className="w-full pl-10 pr-24 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* News Items Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Scraping Ada Derana Live Feed ({category.toUpperCase()})...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
          <p className="text-sm font-bold text-rose-300">{error}</p>
          <button
            onClick={() => fetchNews(category, searchQuery)}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry News Scraper</span>
          </button>
        </div>
      ) : newsList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">
          No news updates found for query "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            >
              <div className="space-y-3">
                {/* News Image Header */}
                {news.image ? (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-cyan-400 font-mono">
                      {news.category}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl bg-slate-950 flex items-center justify-center text-slate-700">
                    <Newspaper className="w-8 h-8" />
                  </div>
                )}

                {/* News Title & Time */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{news.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-3 group-hover:text-cyan-300 transition-colors">
                    {news.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => openArticleModal(news.url)}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read Article JSON</span>
                </button>

                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Open Original Ada Derana Webpage"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedNewsUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold">
                  <Code className="w-3 h-3" />
                  <span>Ada Derana Full Article Scraper Endpoint</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  News Article Details
                </h3>
              </div>

              <button
                onClick={() => setSelectedNewsUrl(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {articleLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Scraping full article contents from Ada Derana...</p>
              </div>
            ) : articleError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {articleError}
              </div>
            ) : articleData ? (
              <div className="space-y-6">
                
                {/* Article Header Card */}
                <div className="space-y-3">
                  {articleData.image && (
                    <img
                      src={articleData.image}
                      alt={articleData.title}
                      className="w-full max-h-64 object-cover rounded-xl border border-slate-800"
                    />
                  )}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400">{articleData.timestamp}</span>
                    <h2 className="text-xl font-extrabold text-white leading-snug">{articleData.title}</h2>
                  </div>
                </div>

                {/* News Article Description */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {articleData.full_news}
                </div>

                {/* JSON Endpoint Output Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">REST API JSON Output</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(articleData, null, 2));
                        setCopiedJson(true);
                        setTimeout(() => setCopiedJson(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                    {JSON.stringify(articleData, null, 2)}
                  </pre>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
};
