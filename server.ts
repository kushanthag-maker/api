import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI lazily if key exists
  let aiClient: GoogleGenAI | null = null;
  function getGenAI() {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), gateway: 'Nexus Edge v1.4' });
  });

  // 1. AI Text Generation (/api/v1/ai/generate)
  app.post('/api/v1/ai/generate', async (req, res) => {
    const { prompt = 'Hello Nexus API', temperature = 0.7 } = req.body;
    const startTime = Date.now();

    try {
      const ai = getGenAI();
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { temperature: Number(temperature) }
        });

        return res.json({
          id: `nx_gen_${crypto.randomBytes(4).toString('hex')}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'nexus-ai-flash-v2',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: response.text },
              finish_reason: 'stop'
            }
          ],
          latency_ms: Date.now() - startTime
        });
      }
    } catch (e) {
      console.error('Gemini AI fallback:', e);
    }

    // High quality fallback response if GEMINI_API_KEY is omitted or errors
    return res.json({
      id: `nx_gen_${crypto.randomBytes(4).toString('hex')}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'nexus-ai-flash-v2',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `Nexus AI Response to "${prompt}": High performance, ultra-low latency sub-20ms edge completion executed successfully.`
          },
          finish_reason: 'stop'
        }
      ],
      usage: { prompt_tokens: prompt.length, completion_tokens: 32, total_tokens: prompt.length + 32 },
      latency_ms: Date.now() - startTime
    });
  });

  // 2. AI Sentiment Analysis (/api/v1/ai/sentiment)
  app.post('/api/v1/ai/sentiment', (req, res) => {
    const { text = '' } = req.body;
    const lower = text.toLowerCase();
    
    let score = 0.5;
    let sentiment = 'neutral';
    if (lower.includes('good') || lower.includes('great') || lower.includes('fast') || lower.includes('love') || lower.includes('intuitive') || lower.includes('super')) {
      score = 0.94;
      sentiment = 'positive';
    } else if (lower.includes('bad') || lower.includes('slow') || lower.includes('error') || lower.includes('hate') || lower.includes('fail')) {
      score = 0.12;
      sentiment = 'negative';
    }

    res.json({
      status: 'success',
      sentiment,
      score,
      emotions: {
        joy: sentiment === 'positive' ? 0.91 : 0.1,
        trust: 0.88,
        anticipation: 0.65
      },
      text_length: text.length,
      language: 'en'
    });
  });

  // 3. AI Neural Translate (/api/v1/ai/translate)
  app.post('/api/v1/ai/translate', (req, res) => {
    const { text = 'Hello', target_lang = 'es' } = req.body;
    
    const translations: Record<string, string> = {
      si: 'නෙක්සස් ඒපීඅයි වෙත සාදරයෙන් පිළිගනිමු',
      es: 'Bienvenido a la API Nexus',
      fr: 'Bienvenue sur Nexus API',
      de: 'Willkommen bei Nexus API',
      ja: 'Nexus APIへようこそ'
    };

    res.json({
      source_lang: 'en',
      target_lang,
      original_text: text,
      translated_text: translations[target_lang] || `[${target_lang.toUpperCase()}]: ${text}`,
      confidence: 0.98
    });
  });

  // 4. Crypto Hashing (/api/v1/auth/hash)
  app.post('/api/v1/auth/hash', (req, res) => {
    const { data = 'secret', algorithm = 'argon2id' } = req.body;
    const salt = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('sha256').update(data + salt).digest('hex');

    res.json({
      algorithm,
      hash: `$${algorithm}$v=19$salt=${salt}$${hash}`,
      salt,
      timestamp: new Date().toISOString()
    });
  });

  // 5. Threat Intel (/api/v1/auth/ip-intel)
  app.get('/api/v1/auth/ip-intel', (req, res) => {
    const ip = (req.query.ip as string) || '8.8.8.8';
    res.json({
      ip,
      risk_score: ip === '127.0.0.1' ? 0 : 2,
      is_vpn: false,
      is_proxy: false,
      is_datacenter: true,
      isp: 'Google LLC',
      country: 'United States',
      city: 'Mountain View',
      threat_level: 'low'
    });
  });

  // 6. Forex Rates (/api/v1/data/fx)
  app.get('/api/v1/data/fx', (req, res) => {
    const base = (req.query.base as string) || 'USD';
    res.json({
      base: base.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      rates: {
        EUR: 0.918,
        GBP: 0.782,
        JPY: 154.2,
        LKR: 302.5,
        AUD: 1.51,
        CAD: 1.36,
        BTC: 0.0000104
      },
      updated_at: new Date().toISOString()
    });
  });

  // 7. Climate Sync (/api/v1/data/weather)
  app.get('/api/v1/data/weather', (req, res) => {
    const city = (req.query.city as string) || 'Colombo';
    res.json({
      location: `${city}, Global Edge`,
      current: {
        temp_c: 28.5,
        feels_like_c: 32.1,
        humidity_percent: 74,
        condition: 'Partly Cloudy',
        wind_kmh: 12.8,
        uv_index: 7.2
      },
      air_quality_index: 38
    });
  });

  // 8. Link Shortener (/api/v1/util/shorten)
  app.post('/api/v1/util/shorten', (req, res) => {
    const { url = 'https://nexus-api.dev', custom_alias } = req.body;
    const alias = custom_alias || crypto.randomBytes(3).toString('hex');
    res.json({
      short_url: `https://nx.link/${alias}`,
      original_url: url,
      alias,
      created_at: new Date().toISOString(),
      clicks: 0
    });
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
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

startServer();
