import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { MongoClient, Db } from 'mongodb';

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

// Global Total Requests Counter
let globalApiRequestsCounter = 12480;
async function incrementGlobalRequests() {
  globalApiRequestsCounter++;
  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection('stats').updateOne(
        { id: 'global_metrics' },
        { $inc: { total_api_requests: 1 } },
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

// In-Memory API Keys Store
const userApiKeysStore: Record<string, string> = {
  'kushanthag@gmail.com': 'nx_live_9a8f23c10b48e71d932e',
  'dev.user@gmail.com': 'nx_test_3b2c19a84d77e11f0293',
  'default': 'nx_live_9a8f23c10b48e71d932e'
};

// Strict API Key Verification Helper (No coins deducted)
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

  const key = rawApiKey.trim();
  let userEmail = 'kushanthag@gmail.com';
  let found = false;

  for (const [email, userKey] of Object.entries(userApiKeysStore)) {
    if (userKey === key) {
      userEmail = email;
      found = true;
      break;
    }
  }

  // Allow dynamically created keys if they follow the official nx_live_ or nx_test_ format with sufficient length
  if (!found && (key.startsWith('nx_live_') || key.startsWith('nx_test_')) && key.length >= 15) {
    userEmail = 'kushanthag@gmail.com';
    userApiKeysStore[userEmail] = key;
    found = true;
  }

  if (!found) {
    return {
      allowed: false,
      userEmail: 'anonymous',
      apiKey: key,
      errorResponse: {
        statusCode: 401,
        payload: {
          status: false,
          error: 'INVALID_API_KEY',
          message: 'The provided Nexus API Key is invalid or has been revoked. Please provide a valid Nexus API Key.'
        }
      }
    };
  }

  return {
    allowed: true,
    userEmail,
    apiKey: key
  };
}

export function buildApp(): express.Application {
  const app = express();

  // Enable CORS & Body Parsers
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // Admin Panel API Endpoints
  app.post('/api/v1/admin/login', (req: express.Request, res: express.Response) => {
    const { password } = req.body || {};
    if (password === 'allkinglucifer') {
      return res.json({ status: 'success', authenticated: true, token: 'admin_session_token_9988' });
    }
    return res.status(401).json({ status: 'error', message: 'Invalid Admin Password.' });
  });

  app.get('/api/v1/admin/users', (_req: express.Request, res: express.Response) => {
    const allEmails = Object.keys(userApiKeysStore).filter(e => e !== 'default');

    const usersList = allEmails.map(email => ({
      email,
      name: email.split('@')[0],
      apiKey: userApiKeysStore[email] || `nx_live_${email.split('@')[0]}_9988`,
      status: 'active'
    }));

    return res.json({ status: 'success', users: usersList });
  });

  // Admin Create API Key Endpoint
  app.post('/api/v1/admin/create-key', (req: express.Request, res: express.Response) => {
    const { password, email, environment, name } = req.body || {};
    if (password !== 'allkinglucifer') {
      return res.status(401).json({ status: false, message: 'Invalid Admin Password.' });
    }

    const cleanEmail = (email || 'user@gmail.com').trim().toLowerCase();
    const prefix = environment === 'development' ? 'nx_test_' : 'nx_live_';
    const randomHash = crypto.randomBytes(10).toString('hex');
    const newApiKey = `${prefix}${randomHash}`;

    userApiKeysStore[cleanEmail] = newApiKey;

    return res.json({
      status: true,
      apiKey: newApiKey,
      userEmail: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      message: `✅ Official API Key generated successfully for ${cleanEmail}!`
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
    let totalKeys = Object.keys(userApiKeysStore).length;

    try {
      const db = await getMongoDb();
      if (db) {
        const statsDoc = await db.collection('stats').findOne({ id: 'global_metrics' });
        if (statsDoc && statsDoc.total_api_requests) {
          dbReqCount = statsDoc.total_api_requests;
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
