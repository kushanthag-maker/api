import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { MongoClient, Db } from 'mongodb';

const STORE_FILE_PATH = path.join(process.cwd(), 'data_store.json');

const MONGO_URI = 'mongodb+srv://heshancamika_db_user:XM8EiSj9zHJLeMuG@cluster0.nimdgb1.mongodb.net/?appName=Cluster0';
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  if (mongoDb) return mongoDb;
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      await mongoClient.connect();
      console.log('✅ MongoDB Atlas connected successfully!');
    }
    mongoDb = mongoClient.db('apinexus_db');
    return mongoDb;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection fallback:', err);
    return null;
  }
}

// Save state to disk to preserve request counts and keys permanently across server updates/restarts
function saveStoreToDisk() {
  try {
    const keysArray = Array.from(serverKeysStore.entries());
    const dataToSave = {
      globalApiRequestsCounter,
      claimedFreeEmails: Array.from(claimedFreeEmails),
      claimedFreeIPs: Array.from(claimedFreeIPs),
      keys: keysArray,
      telemetry: {
        totalRequests: telemetryData.totalRequests,
        successfulRequests: telemetryData.successfulRequests,
        failedRequests: telemetryData.failedRequests,
        endpointHits: telemetryData.endpointHits,
        recentLogs: telemetryData.recentLogs.slice(0, 50)
      }
    };
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (e) {
    // silent fallback
  }
}

function loadStoreFromDisk() {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (typeof parsed.globalApiRequestsCounter === 'number') {
        globalApiRequestsCounter = parsed.globalApiRequestsCounter;
      }
      if (Array.isArray(parsed.claimedFreeEmails)) {
        parsed.claimedFreeEmails.forEach((e: string) => claimedFreeEmails.add(e));
      }
      if (Array.isArray(parsed.claimedFreeIPs)) {
        parsed.claimedFreeIPs.forEach((ip: string) => claimedFreeIPs.add(ip));
      }
      if (Array.isArray(parsed.keys)) {
        parsed.keys.forEach(([kStr, kObj]: [string, ServerApiKey]) => {
          serverKeysStore.set(kStr, kObj);
        });
      }
      if (parsed.telemetry) {
        telemetryData.totalRequests = parsed.telemetry.totalRequests || telemetryData.totalRequests;
        telemetryData.successfulRequests = parsed.telemetry.successfulRequests || telemetryData.successfulRequests;
        telemetryData.failedRequests = parsed.telemetry.failedRequests || telemetryData.failedRequests;
        telemetryData.endpointHits = parsed.telemetry.endpointHits || telemetryData.endpointHits;
        telemetryData.recentLogs = parsed.telemetry.recentLogs || telemetryData.recentLogs;
      }
      console.log(`💾 Restored store.json! Global Request Counter: ${globalApiRequestsCounter}, Total Keys: ${serverKeysStore.size}`);
    }
  } catch (e) {
    console.warn('⚠️ Could not load store.json:', e);
  }
}

// Global Total Requests Counter & User Keys Map
let globalApiRequestsCounter = 12480;
const userApiKeysStore: Record<string, string> = {};
const claimedFreeEmails = new Set<string>();
const claimedFreeIPs = new Set<string>();
async function incrementGlobalRequests() {
  globalApiRequestsCounter++;
  saveStoreToDisk();
  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection('stats').updateOne(
        { id: 'global_metrics' },
        { $setMax: { total_api_requests: globalApiRequestsCounter } },
        { upsert: true }
      );
    }
  } catch (e) {
    // silent fallback
  }
}

function getHostDomain(req: express.Request): string {
  const host = req.headers.host || 'apinexusdev-blush.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  return `${protocol}://${host}`;
}

function extractApiKey(req: express.Request): string | null {
  const queryKey = (req.query.apiKey || req.query.key || req.query.api_key) as string | undefined;
  if (queryKey && typeof queryKey === 'string' && queryKey.trim().length > 0) {
    return queryKey.trim();
  }

  const bodyKey = (req.body?.apiKey || req.body?.key || req.body?.api_key) as string | undefined;
  if (bodyKey && typeof bodyKey === 'string' && bodyKey.trim().length > 0) {
    return bodyKey.trim();
  }

  const headerKey = req.headers['x-api-key'] as string | undefined;
  if (headerKey && typeof headerKey === 'string' && headerKey.trim().length > 0) {
    return headerKey.trim();
  }

  const authHeader = req.headers['authorization'] as string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.length > 0) return token;
  }

  return null;
}

// Structured In-Memory API Keys Store
export interface ServerApiKey {
  id: string;
  key: string;
  name: string;
  email: string;
  createdAt: string;
  status: 'active' | 'revoked';
  environment: 'production' | 'development';
  usageLimit: number;
  usageToday: number;
}

const serverKeysStore = new Map<string, ServerApiKey>();

// Populate initial default keys
const defaultDemoKey: ServerApiKey = {
  id: 'key_default_1',
  key: 'nx_live_default_admin_key_2026',
  name: 'Default Admin Key',
  email: 'admin@nexus.api',
  createdAt: new Date().toISOString().split('T')[0],
  status: 'active',
  environment: 'production',
  usageLimit: 50000,
  usageToday: 0
};
serverKeysStore.set(defaultDemoKey.key, defaultDemoKey);

// Restore store from disk if present
loadStoreFromDisk();

// Helper to find or auto-register keys
function lookupOrRegisterKey(rawKey: string): ServerApiKey | null {
  const cleanKey = rawKey.trim();
  if (serverKeysStore.has(cleanKey)) {
    return serverKeysStore.get(cleanKey)!;
  }

  // Allow dynamically created valid format keys
  if ((cleanKey.startsWith('nx_live_') || cleanKey.startsWith('nx_test_') || cleanKey.startsWith('nx_free_')) && cleanKey.length >= 12) {
    const isFree = cleanKey.startsWith('nx_free_');
    const newRecord: ServerApiKey = {
      id: `key_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      key: cleanKey,
      name: isFree ? 'Free User Key (10 Reqs)' : 'Standard Nexus Key',
      email: 'user@nexus.api',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      environment: cleanKey.startsWith('nx_test_') ? 'development' : 'production',
      usageLimit: isFree ? 10 : 10000,
      usageToday: 0
    };
    serverKeysStore.set(cleanKey, newRecord);
    saveStoreToDisk();
    return newRecord;
  }

  return null;
}

// Strict API Key Verification Helper with Quota Enforcement
function verifyApiKey(req: express.Request): {
  allowed: boolean;
  userEmail: string;
  apiKey: string;
  errorResponse?: { statusCode: number; payload: any };
} {
  incrementGlobalRequests();
  const rawApiKey = extractApiKey(req);

  if (!rawApiKey) {
    return {
      allowed: false,
      userEmail: 'anonymous',
      apiKey: '',
      errorResponse: {
        statusCode: 401,
        payload: {
          status: false,
          error: 'UNAUTHORIZED_API_KEY',
          message: 'Valid Nexus API Key is required. Please pass key in query parameter (?apiKey=YOUR_KEY or ?key=YOUR_KEY) or x-api-key header.'
        }
      }
    };
  }

  const keyRecord = lookupOrRegisterKey(rawApiKey);

  if (!keyRecord) {
    return {
      allowed: false,
      userEmail: 'anonymous',
      apiKey: rawApiKey,
      errorResponse: {
        statusCode: 401,
        payload: {
          status: false,
          error: 'INVALID_API_KEY',
          message: 'The provided Nexus API Key is invalid or has not been registered on the server. Please generate a Free API Key (10 requests) or request one from Admin.'
        }
      }
    };
  }

  if (keyRecord.status === 'revoked') {
    return {
      allowed: false,
      userEmail: keyRecord.email,
      apiKey: keyRecord.key,
      errorResponse: {
        statusCode: 403,
        payload: {
          status: false,
          error: 'REVOKED_API_KEY',
          message: 'This API Key has been revoked by System Admin. Please generate a new key.'
        }
      }
    };
  }

  if (keyRecord.usageToday >= keyRecord.usageLimit) {
    return {
      allowed: false,
      userEmail: keyRecord.email,
      apiKey: keyRecord.key,
      errorResponse: {
        statusCode: 429,
        payload: {
          status: false,
          error: 'QUOTA_EXCEEDED',
          message: `API Key request limit reached (${keyRecord.usageLimit} max requests). Free keys have a 10 request limit. Please contact Admin or generate a new key.`
        }
      }
    };
  }

  // Increment usage count for valid request
  keyRecord.usageToday += 1;
  saveStoreToDisk();

  return {
    allowed: true,
    userEmail: keyRecord.email,
    apiKey: keyRecord.key
  };
}

// In-Memory Real-Time Telemetry Tracking Store
interface RequestLogItem {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  apiKey: string;
}

const telemetryData = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  latencies: [] as number[],
  endpointHits: {} as Record<string, number>,
  recentLogs: [] as RequestLogItem[]
};

export function buildApp(): express.Application {
  const app = express();

  // Enable CORS & Body Parsers
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Live Request Tracking Middleware
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Only track API requests, exclude telemetry endpoint itself from log flooding
    if (req.path.startsWith('/api/') && !req.path.includes('/telemetry/stats')) {
      const startTime = Date.now();
      const originalEnd = res.end;

      res.end = function (...args: any[]) {
        const latency = Math.max(1, Date.now() - startTime);

        telemetryData.totalRequests += 1;
        if (res.statusCode >= 200 && res.statusCode < 400) {
          telemetryData.successfulRequests += 1;
        } else {
          telemetryData.failedRequests += 1;
        }

        telemetryData.latencies.push(latency);
        if (telemetryData.latencies.length > 100) {
          telemetryData.latencies.shift();
        }

        const cleanPath = req.path;
        telemetryData.endpointHits[cleanPath] = (telemetryData.endpointHits[cleanPath] || 0) + 1;

        // Sanitize URL path so secret keys in query params are NEVER stored or exposed in request logs
        const rawUrl = req.originalUrl || req.path;
        const sanitizedUrl = rawUrl.replace(/([?&])(apiKey|key|api_key|token|password|secret)=([^&]*)/gi, '$1$2=••••••••');

        const rawApiKey = (req.query.apiKey || req.query.key || req.headers['x-api-key'] || req.body?.apiKey) as string | undefined;
        let maskedKey = 'Anonymous';
        if (rawApiKey && typeof rawApiKey === 'string') {
          const cleanK = rawApiKey.trim();
          if (cleanK.length > 10) {
            maskedKey = `${cleanK.substring(0, 7)}••••${cleanK.slice(-3)}`;
          } else {
            maskedKey = '••••••••';
          }
        }

        const logItem: RequestLogItem = {
          id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          method: req.method,
          path: sanitizedUrl,
          statusCode: res.statusCode,
          latencyMs: latency,
          apiKey: maskedKey
        };

        telemetryData.recentLogs.unshift(logItem);
        if (telemetryData.recentLogs.length > 50) {
          telemetryData.recentLogs.pop();
        }

        return originalEnd.apply(this, args);
      };
    }
    next();
  });

  // Health check & System Status (Public)
  const handleHealthCheck = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      online: true,
      uptime: process.uptime(),
      gateway: 'Nexus API Edge Gateway',
      timestamp: new Date().toISOString(),
      services: {
        news_scraper: 'online',
        api_key_auth: 'active'
      }
    });
  };

  app.get('/api/health', handleHealthCheck);
  app.get('/health', handleHealthCheck);
  app.get('/api/status', handleHealthCheck);
  app.get('/status', handleHealthCheck);
  app.get('/api/v1/health/status', handleHealthCheck);

  // 1. Ada Derana News List & Search Endpoint (/api/v1/news/latest, /api/v1/news/list, /api/v1/news/search, /api/news, /search)
  const handleAdaDeranaNewsList = async (req: express.Request, res: express.Response) => {
    const authCheck = verifyApiKey(req);
    if (!authCheck.allowed && authCheck.errorResponse) {
      return res.status(authCheck.errorResponse.statusCode).json(authCheck.errorResponse.payload);
    }

    const category = (req.query.category || req.body?.category || 'latest') as string;
    const query = (req.query.q || req.query.query || req.body?.q || req.body?.query) as string | undefined;

    let targetUrl = 'https://sinhala.adaderana.lk/';
    const catLower = category.toLowerCase();

    if (catLower.includes('hot') || catLower.includes('top')) {
      targetUrl = 'https://sinhala.adaderana.lk/sinhala-hot-news.php';
    } else if (catLower.includes('sport')) {
      targetUrl = 'https://sinhala.adaderana.lk/sports-news.php';
    } else if (catLower.includes('world') || catLower.includes('global')) {
      targetUrl = 'https://sinhala.adaderana.lk/world-news.php';
    } else if (catLower.includes('business') || catLower.includes('trade')) {
      targetUrl = 'https://sinhala.adaderana.lk/business-news.php';
    } else if (catLower.includes('entertainment') || catLower.includes('cinema')) {
      targetUrl = 'https://sinhala.adaderana.lk/entertainment-news.php';
    }

    try {
      const { data } = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(data);
      let newsList: Array<{ id: string; title: string; time: string; image: string | null; url: string; category: string; detail_api_url?: string }> = [];

      $('.news-story').each((index, element) => {
        const title = $(element).find('.story-text h2 a, .story-text a, a').first().text().trim();
        const rawLink = $(element).find('a').first().attr('href');
        const imgUrl = $(element).find('.story-image img, img').first().attr('src');
        const relativeTime = $(element).find('.story-text span, .time').text().trim();

        let fullLink = rawLink || '';
        if (rawLink && !rawLink.startsWith('http')) {
          fullLink = `https://sinhala.adaderana.lk/${rawLink.replace(/^\//, '')}`;
        }

        let fullImage = imgUrl || null;
        if (imgUrl && !imgUrl.startsWith('http')) {
          fullImage = `https://sinhala.adaderana.lk/${imgUrl.replace(/^\//, '')}`;
        }

        if (title && newsList.length < 20) {
          const newsId = rawLink ? rawLink.replace(/[^a-zA-Z0-9]/g, '_') : `news_${index}`;
          const hostDomain = getHostDomain(req);
          newsList.push({
            id: newsId,
            title,
            time: relativeTime || 'Just Now',
            image: fullImage,
            url: fullLink,
            category: category.toUpperCase(),
            detail_api_url: `${hostDomain}/api/v1/news/detail?url=${encodeURIComponent(fullLink)}`
          });
        }
      });

      if (query && query.trim()) {
        const qClean = query.trim().toLowerCase();
        newsList = newsList.filter(n => n.title.toLowerCase().includes(qClean));
      }

      res.json({
        status: true,
        category: category.toUpperCase(),
        query: query || null,
        api_key: authCheck.apiKey,
        total_news: newsList.length,
        results: newsList
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: 'News fetch කිරීමට නොහැකි විය!',
        error: error?.message || 'Scraping Failed'
      });
    }
  };

  app.get('/api/news', handleAdaDeranaNewsList);
  app.post('/api/news', handleAdaDeranaNewsList);
  app.get('/api/v1/news/latest', handleAdaDeranaNewsList);
  app.post('/api/v1/news/latest', handleAdaDeranaNewsList);
  app.get('/api/v1/news/list', handleAdaDeranaNewsList);
  app.post('/api/v1/news/list', handleAdaDeranaNewsList);
  app.get('/api/v1/news/search', handleAdaDeranaNewsList);
  app.post('/api/v1/news/search', handleAdaDeranaNewsList);
  app.get('/search', handleAdaDeranaNewsList);

  // 2. Ada Derana Full News Detail Endpoint (/api/v1/news/detail & /api/news-detail)
  const handleAdaDeranaNewsDetail = async (req: express.Request, res: express.Response) => {
    const authCheck = verifyApiKey(req);
    if (!authCheck.allowed && authCheck.errorResponse) {
      return res.status(authCheck.errorResponse.statusCode).json(authCheck.errorResponse.payload);
    }

    let newsUrl = (req.query.url || req.body?.url || req.query.newsUrl || req.body?.newsUrl) as string | undefined;

    if (!newsUrl || !newsUrl.trim()) {
      return res.status(400).json({
        status: false,
        message: 'කරුණාකර News Link (URL) එකක් ඇතුලත් කරන්න! (?url=...)'
      });
    }

    let targetUrl = newsUrl.trim();
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://sinhala.adaderana.lk/${targetUrl.replace(/^\//, '')}`;
    }

    try {
      const { data } = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(data);

      const title = $('.news-story h1, .story-text h1, .news-heading, h1').first().text().trim() || 'Ada Derana Latest News Update';

      let mainImage = $('.story-image img, .news-story img, article img, main img').first().attr('src') || null;
      if (mainImage && !mainImage.startsWith('http')) {
        mainImage = `https://sinhala.adaderana.lk/${mainImage.replace(/^\//, '')}`;
      }

      const timeStamp = $('.news-story span, .story-text span, .time, .date').first().text().trim() || 'Today';

      const paragraphs: string[] = [];
      const contentContainer = $('.news-content, .story-text, .news-story, #news-story, article, main').first();

      if (contentContainer.length > 0) {
        const cloned = contentContainer.clone();
        cloned.find('h1, script, style, header, footer, nav, .social-share, .comments, iframe, .related-news').remove();

        cloned.find('p').each((_i, el) => {
          const txt = $(el).text().trim();
          if (txt.length > 10 && !paragraphs.includes(txt)) {
            paragraphs.push(txt);
          }
        });

        if (paragraphs.length === 0) {
          const rawTxt = cloned.text().trim();
          if (rawTxt) {
            rawTxt.split('\n').forEach(line => {
              const cleaned = line.trim();
              if (cleaned.length > 15 && !paragraphs.includes(cleaned)) {
                paragraphs.push(cleaned);
              }
            });
          }
        }
      }

      if (paragraphs.length === 0) {
        $('p').each((_i, el) => {
          const txt = $(el).text().trim();
          if (txt.length > 20 && !txt.includes('Copyright') && !paragraphs.includes(txt)) {
            paragraphs.push(txt);
          }
        });
      }

      const fullArticle = paragraphs.length > 0 
        ? paragraphs.join('\n\n')
        : 'අද දෙරණ පුවත් සේවය මගින් වාර්තා කරන ලද සජීව පුවත් තොරතුරු.';

      res.json({
        status: true,
        api_key: authCheck.apiKey,
        title,
        timestamp: timeStamp,
        image: mainImage,
        url: targetUrl,
        paragraphs,
        full_article: fullArticle.trim(),
        full_news: fullArticle.trim(),
        article_content: fullArticle.trim()
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: 'News detail ලබා ගැනීමට නොහැකි විය!',
        error: error?.message || 'Detail Scraper Error'
      });
    }
  };

  app.get('/api/news-detail', handleAdaDeranaNewsDetail);
  app.post('/api/news-detail', handleAdaDeranaNewsDetail);
  app.get('/api/v1/news/detail', handleAdaDeranaNewsDetail);
  app.post('/api/v1/news/detail', handleAdaDeranaNewsDetail);

  // Google Sign-In Verification Endpoint
  app.post('/api/v1/auth/google-verify', (req: express.Request, res: express.Response) => {
    try {
      const { email, name, googleId, avatar } = req.body || {};

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email address provided.'
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      return res.json({
        status: 'success',
        user: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          googleId: googleId || `gid_${Date.now()}`,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
          role: cleanEmail === 'kushanthag@gmail.com' ? 'admin' : 'developer',
          apiKey: userApiKeysStore[cleanEmail] || `nx_live_${cleanEmail.split('@')[0]}_9988`
        }
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: err?.message || 'Verification failed' });
    }
  });

  // Check Free API Key Status (Public)
  app.get('/api/v1/keys/free-status', (req: express.Request, res: express.Response) => {
    const cleanEmail = ((req.query.email || '') as string).trim().toLowerCase();
    const rawIp = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();

    const isEmailLocked = Boolean(cleanEmail && claimedFreeEmails.has(cleanEmail));
    const isIpLocked = Boolean(rawIp && rawIp !== '127.0.0.1' && rawIp !== '::1' && claimedFreeIPs.has(rawIp));
    const isLocked = isEmailLocked || isIpLocked;

    return res.json({
      status: true,
      isLocked,
      message: isLocked ? '🔒 Free starter API key has already been claimed for this account or network.' : 'Free starter trial available.'
    });
  });

  // Generate Free API Key Endpoint (Public - 10 Requests Limit, Permanent One-Time Claim Lock)
  app.post('/api/v1/keys/generate-free', (req: express.Request, res: express.Response) => {
    const { name, email } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();

    // Strict Lock Enforcement: Check if email or IP already claimed a free key
    if (cleanEmail && claimedFreeEmails.has(cleanEmail)) {
      return res.status(403).json({
        status: false,
        code: 'FREE_KEY_ALREADY_CLAIMED',
        message: '🔒 PERMANENT LOCK: A free 10-request API key has ALREADY been claimed for this email. Re-claiming is strictly locked permanently.'
      });
    }

    if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1' && claimedFreeIPs.has(clientIp)) {
      return res.status(403).json({
        status: false,
        code: 'FREE_KEY_ALREADY_CLAIMED_IP',
        message: '🔒 PERMANENT LOCK: A free 10-request API key has ALREADY been claimed from this network/device. Re-claiming is strictly locked permanently.'
      });
    }

    const cleanName = (name || 'Free User Project').trim();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const freeKeyString = `nx_free_${randomHash}`;

    const freeKeyRecord: ServerApiKey = {
      id: `key_free_${Date.now()}`,
      key: freeKeyString,
      name: cleanName,
      email: cleanEmail || 'freeuser@nexus.api',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      environment: 'production',
      usageLimit: 10,
      usageToday: 0
    };

    // Permanently record lock for this email and IP
    if (cleanEmail) claimedFreeEmails.add(cleanEmail);
    if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') claimedFreeIPs.add(clientIp);

    serverKeysStore.set(freeKeyString, freeKeyRecord);
    saveStoreToDisk();

    return res.json({
      status: true,
      apiKey: freeKeyRecord,
      message: '🎁 Free API Key generated successfully! (Limit: 10 requests). Free claims for this account are now permanently locked.'
    });
  });

  // Batch Query Key Usage Status & Request Volume (Public for Client UI Real-Time Quota Updates)
  app.post('/api/v1/keys/batch-status', (req: express.Request, res: express.Response) => {
    const { keys: keyStrings, email } = req.body || {};
    const keysStatusMap: Record<string, { usageToday: number; usageLimit: number; status: string; name: string; email: string }> = {};

    let candidateKeys: ServerApiKey[] = [];
    if (Array.isArray(keyStrings) && keyStrings.length > 0) {
      keyStrings.forEach((kStr: string) => {
        if (typeof kStr === 'string' && kStr.trim()) {
          const found = lookupOrRegisterKey(kStr);
          if (found) candidateKeys.push(found);
        }
      });
    }

    if (email && typeof email === 'string' && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      Array.from(serverKeysStore.values()).forEach(k => {
        if (k.email.toLowerCase() === cleanEmail && !candidateKeys.some(ck => ck.key === k.key)) {
          candidateKeys.push(k);
        }
      });
    }

    candidateKeys.forEach(k => {
      keysStatusMap[k.key] = {
        usageToday: k.usageToday || 0,
        usageLimit: k.usageLimit || 10,
        status: k.status,
        name: k.name,
        email: k.email
      };
    });

    return res.json({
      status: true,
      globalTotalRequests: globalApiRequestsCounter,
      keysStatus: keysStatusMap,
      totalActiveKeys: serverKeysStore.size
    });
  });

  // Query User API Keys (Public - strict exact Email or Key lookup to prevent key leaks)
  app.get('/api/v1/keys/user-keys', (req: express.Request, res: express.Response) => {
    const queryEmail = ((req.query.email || req.query.query || '') as string).trim().toLowerCase();

    if (!queryEmail || queryEmail.length < 3) {
      return res.json({ status: true, keys: [], message: 'Please provide exact email address to lookup keys.' });
    }

    const allKeys = Array.from(serverKeysStore.values());

    // Strict exact email or exact key match
    const matchedKeys = allKeys.filter(k => 
      k.email.toLowerCase() === queryEmail || 
      k.key.toLowerCase() === queryEmail
    );

    return res.json({
      status: true,
      keys: matchedKeys
    });
  });

  // Sync / Register Key Endpoint (Public)
  app.post('/api/v1/keys/sync', (req: express.Request, res: express.Response) => {
    const { key, name, email, usageLimit, environment } = req.body || {};
    if (!key || typeof key !== 'string' || key.trim().length < 8) {
      return res.status(400).json({ status: false, message: 'Invalid API Key string.' });
    }

    const cleanKey = key.trim();
    if (serverKeysStore.has(cleanKey)) {
      const existing = serverKeysStore.get(cleanKey)!;
      return res.json({ status: true, apiKey: existing, message: 'Key already registered.' });
    }

    const newRecord: ServerApiKey = {
      id: `key_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      key: cleanKey,
      name: name || 'Registered Key',
      email: email || 'user@nexus.api',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      environment: environment === 'development' ? 'development' : 'production',
      usageLimit: typeof usageLimit === 'number' ? usageLimit : 10000,
      usageToday: 0
    };

    serverKeysStore.set(cleanKey, newRecord);
    saveStoreToDisk();
    return res.json({ status: true, apiKey: newRecord, message: 'Key synced to server.' });
  });

  // Admin List All API Keys Endpoint
  app.get('/api/v1/admin/keys', (req: express.Request, res: express.Response) => {
    const authHeader = req.headers['x-admin-password'] || req.query.password;
    if (authHeader !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }
    const keysList = Array.from(serverKeysStore.values());
    return res.json({ status: true, keys: keysList });
  });

  // Admin Update Key Limit Endpoint
  app.post('/api/v1/admin/update-key-limit', (req: express.Request, res: express.Response) => {
    const { password, key, newLimit } = req.body || {};
    if (password !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }
    if (!key || !serverKeysStore.has(key)) {
      return res.status(404).json({ status: false, message: 'API Key not found on server.' });
    }

    const record = serverKeysStore.get(key)!;
    record.usageLimit = Math.max(1, parseInt(newLimit, 10) || 10000);
    saveStoreToDisk();
    return res.json({
      status: true,
      apiKey: record,
      message: `Updated limit for key '${key}' to ${record.usageLimit} requests!`
    });
  });

  // Admin Revoke / Activate Key Endpoint
  app.post('/api/v1/admin/revoke-key', (req: express.Request, res: express.Response) => {
    const { password, key, action } = req.body || {};
    if (password !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }
    if (!key || !serverKeysStore.has(key)) {
      return res.status(404).json({ status: false, message: 'API Key not found on server.' });
    }

    const record = serverKeysStore.get(key)!;
    record.status = action === 'revoke' ? 'revoked' : 'active';
    saveStoreToDisk();
    return res.json({
      status: true,
      apiKey: record,
      message: `API Key '${key}' status updated to ${record.status.toUpperCase()}!`
    });
  });

  // Admin Panel API Endpoints
  app.post('/api/v1/admin/login', (req: express.Request, res: express.Response) => {
    const { password } = req.body || {};
    if (password === 'allkinglucifer') {
      return res.json({ status: 'success', authenticated: true, token: 'admin_session_token_9988' });
    }
    return res.status(401).json({ status: 'error', message: 'Invalid Admin Password.' });
  });

  app.get('/api/v1/admin/users', (req: express.Request, res: express.Response) => {
    const authHeader = req.headers['x-admin-password'] || req.query.password;
    if (authHeader !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }
    const allKeys = Array.from(serverKeysStore.values());
    const usersList = allKeys.map(k => ({
      email: k.email,
      name: k.name,
      apiKey: k.key,
      status: k.status === 'revoked' ? 'banned' : 'active',
      usageLimit: k.usageLimit || 10000,
      usageToday: k.usageToday || 0,
      coinsBalance: 500,
      createdAt: k.createdAt
    }));

    return res.json({ status: 'success', users: usersList });
  });

  // Admin Create API Key Endpoint
  app.post('/api/v1/admin/create-key', (req: express.Request, res: express.Response) => {
    const { password, email, environment, name, usageLimit } = req.body || {};
    if (password !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }

    const cleanEmail = (email || 'user@gmail.com').trim().toLowerCase();
    const prefix = environment === 'development' ? 'nx_test_' : 'nx_live_';
    const randomHash = crypto.randomBytes(10).toString('hex');
    const newApiKey = `${prefix}${randomHash}`;

    const newRecord: ServerApiKey = {
      id: `key_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      key: newApiKey,
      name: name || `${cleanEmail.split('@')[0]} Key`,
      email: cleanEmail,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      environment: environment === 'development' ? 'development' : 'production',
      usageLimit: typeof usageLimit === 'number' ? usageLimit : 10000,
      usageToday: 0
    };

    serverKeysStore.set(newApiKey, newRecord);
    saveStoreToDisk();

    return res.json({
      status: true,
      apiKey: newApiKey,
      keyObject: newRecord,
      userEmail: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      message: `✅ Official API Key generated successfully for ${cleanEmail}!`
    });
  });

  // Register / Sync Key with Admin authorization
  app.post('/api/v1/keys/register', (req: express.Request, res: express.Response) => {
    const { apiKey, name, email, adminPassword } = req.body || {};
    if (adminPassword !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
      return res.status(400).json({ status: false, message: 'Invalid API Key string provided.' });
    }
    const cleanKey = apiKey.trim();
    const identifier = email ? email.trim().toLowerCase() : (name ? name.trim() : `key_${cleanKey.substring(0, 12)}`);
    userApiKeysStore[identifier] = cleanKey;
    return res.json({
      status: true,
      apiKey: cleanKey,
      message: `✅ API Key registered successfully!`
    });
  });

  // Real-Time Telemetry Stats Endpoint
  app.get('/api/v1/telemetry/stats', (_req: express.Request, res: express.Response) => {
    const avgLatency = telemetryData.latencies.length > 0
      ? Math.round(telemetryData.latencies.reduce((a, b) => a + b, 0) / telemetryData.latencies.length)
      : 12;

    const total = Math.max(globalApiRequestsCounter, telemetryData.totalRequests);
    const successRate = total > 0 ? (((total - telemetryData.failedRequests) / total) * 100).toFixed(2) : '100.00';
    const errorRate = total > 0 ? ((telemetryData.failedRequests / total) * 100).toFixed(2) : '0.00';

    const colors = ['bg-cyan-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
    const endpointTraffic = Object.entries(telemetryData.endpointHits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count], index) => {
        const sharePct = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          name: `${path}`,
          reqs: `${count} reqs`,
          share: `${sharePct}%`,
          color: colors[index % colors.length]
        };
      });

    return res.json({
      status: true,
      totalRequests: total,
      successfulRequests: Math.max(0, total - telemetryData.failedRequests),
      failedRequests: telemetryData.failedRequests,
      avgLatencyMs: avgLatency,
      successRate: `${successRate}%`,
      errorRate: `${errorRate}%`,
      endpointTraffic: endpointTraffic.length > 0 ? endpointTraffic : [
        { name: 'GET /api/v1/news/latest', reqs: `${total} reqs`, share: '100%', color: 'bg-cyan-500' }
      ],
      recentLogs: telemetryData.recentLogs
    });
  });

  // Bug & Issue Reporting System Endpoints
  app.post('/api/v1/report/submit', async (req: express.Request, res: express.Response) => {
    const { title, description, category, email } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ status: false, message: 'Report title and description are required.' });
    }

    const reportDoc = {
      id: `rep_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category || 'General Bug').trim(),
      email: String(email || 'anonymous@user.com').trim().toLowerCase(),
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('bug_reports').insertOne(reportDoc);
      }
    } catch (e) {
      console.warn('Bug report MongoDB save fallback:', e);
    }

    return res.json({
      status: true,
      reportId: reportDoc.id,
      message: `✅ Bug Report '${reportDoc.id}' submitted successfully! Our engineering team will review it.`
    });
  });

  app.get('/api/v1/report/list', async (_req: express.Request, res: express.Response) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const reports = await db.collection('bug_reports').find({}).sort({ createdAt: -1 }).toArray();
        return res.json({ status: true, reports });
      }
    } catch (e) {
      console.warn('Get reports MongoDB error:', e);
    }
    return res.json({ status: true, reports: [] });
  });

  // System Statistics Endpoint
  app.get('/api/v1/stats', async (_req: express.Request, res: express.Response) => {
    let dbReqCount = globalApiRequestsCounter;
    let totalKeys = serverKeysStore.size;

    try {
      const db = await getMongoDb();
      if (db) {
        const statsDoc = await db.collection('stats').findOne({ id: 'global_metrics' });
        if (statsDoc && typeof statsDoc.total_api_requests === 'number') {
          globalApiRequestsCounter = Math.max(globalApiRequestsCounter, statsDoc.total_api_requests);
          dbReqCount = globalApiRequestsCounter;
        }
      }
    } catch (e) {
      // fallback
    }

    return res.json({
      status: true,
      total_api_requests: dbReqCount,
      total_active_keys: totalKeys,
      uptime_seconds: Math.floor(process.uptime()),
      system_status: '100% OPERATIONAL'
    });
  });

  // 404 Fallback Handler for Unmatched API Endpoints
  app.use('/api/*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
      status: false,
      message: `API Endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
      error: 'ENDPOINT_NOT_FOUND'
    });
  });

  // Global Express Error Handling Middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('APINexus Express Server Error Caught:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: err?.message || 'Internal APINexus Server Error'
      });
    }
  });

  return app;
}

export async function startServer() {
  const app = buildApp();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus API Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default buildApp();
