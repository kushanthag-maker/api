import { ApiEndpoint } from '../types';

export const NEXUS_ENDPOINTS: ApiEndpoint[] = [
  // AI Category
  {
    id: 'ai-generate',
    name: 'Text Generation Engine',
    category: 'ai',
    method: 'POST',
    path: '/api/v1/ai/generate',
    summary: 'Generate high-quality text, creative copy, or structured JSON using Nexus AI.',
    description: 'Powers conversational agents, content creation, code synthesis, and structured JSON responses with low-latency edge inference.',
    rateLimit: '120 req/min',
    params: [
      { name: 'prompt', type: 'string', required: true, description: 'The context or instructions for generation.', location: 'body', default: 'Write a quick 2-line intro for Nexus API platform' },
      { name: 'temperature', type: 'number', required: false, description: 'Sampling creativity (0.0 to 1.0).', location: 'body', default: '0.7' },
      { name: 'max_tokens', type: 'integer', required: false, description: 'Maximum tokens to yield.', location: 'body', default: '256' },
      { name: 'format', type: 'string', required: false, description: 'Output mode: text or json.', location: 'body', default: 'json' }
    ],
    sampleRequestBody: {
      prompt: 'Write a quick 2-line intro for Nexus API platform',
      temperature: 0.7,
      max_tokens: 256,
      format: 'json'
    },
    sampleResponseBody: {
      id: 'nx_gen_88f12a3d',
      object: 'chat.completion',
      created: 1785462000,
      model: 'nexus-ai-flash-v2',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Nexus API is a unified developer gateway connecting high-performance AI, security, and realtime telemetry tools. Built for high scalability, sub-20ms latency, and global edge deployments.'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 14,
        completion_tokens: 38,
        total_tokens: 52
      },
      latency_ms: 18
    }
  },
  {
    id: 'ai-sentiment',
    name: 'Realtime Sentiment & Tone',
    category: 'ai',
    method: 'POST',
    path: '/api/v1/ai/sentiment',
    summary: 'Analyze text sentiment, emotional tone, and intent with confidence scores.',
    description: 'Extract positive/negative sentiment, toxicity indicators, customer satisfaction score, and key topics instantly.',
    rateLimit: '200 req/min',
    params: [
      { name: 'text', type: 'string', required: true, description: 'Input string to analyze.', location: 'body', default: 'Nexus API documentation is super intuitive and fast!' }
    ],
    sampleRequestBody: {
      text: 'Nexus API documentation is super intuitive and fast!'
    },
    sampleResponseBody: {
      status: 'success',
      sentiment: 'positive',
      score: 0.962,
      emotions: {
        joy: 0.91,
        trust: 0.88,
        anticipation: 0.65
      },
      topics: ['documentation', 'performance', 'developer experience'],
      language: 'en'
    }
  },
  {
    id: 'ai-translate',
    name: 'Neural Translation',
    category: 'ai',
    method: 'POST',
    path: '/api/v1/ai/translate',
    summary: 'High-accuracy neural translation supporting over 100 languages.',
    description: 'Translates sentences or documents with context preservation, auto-detecting the input language.',
    rateLimit: '150 req/min',
    params: [
      { name: 'text', type: 'string', required: true, description: 'Text to translate.', location: 'body', default: 'Welcome to Nexus API Developer Portal' },
      { name: 'target_lang', type: 'string', required: true, description: 'ISO language code (e.g., es, fr, de, si, ja, zh).', location: 'body', default: 'si' }
    ],
    sampleRequestBody: {
      text: 'Welcome to Nexus API Developer Portal',
      target_lang: 'si'
    },
    sampleResponseBody: {
      source_lang: 'en',
      target_lang: 'si',
      original_text: 'Welcome to Nexus API Developer Portal',
      translated_text: 'නෙක්සස් ඒපීඅයි සංවර්ධක ද්වාරය වෙත සාදරයෙන් පිළිගනිමු',
      confidence: 0.99
    }
  },

  // Auth Category
  {
    id: 'auth-hash',
    name: 'Argon2 / Crypto Hashing',
    category: 'auth',
    method: 'POST',
    path: '/api/v1/auth/hash',
    summary: 'Cryptographic hash generation for passwords, API secrets, and tokens.',
    description: 'Generates secure standard hashes using SHA-256, HMAC, or Argon2id with automatic salt generation.',
    rateLimit: '500 req/min',
    params: [
      { name: 'data', type: 'string', required: true, description: 'Raw payload or password.', location: 'body', default: 'MySuperSecretPass123!' },
      { name: 'algorithm', type: 'string', required: false, description: 'sha256, hmac, or argon2id.', location: 'body', default: 'argon2id' }
    ],
    sampleRequestBody: {
      data: 'MySuperSecretPass123!',
      algorithm: 'argon2id'
    },
    sampleResponseBody: {
      algorithm: 'argon2id',
      hash: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$Jk5s2X9pQz3xYw7v8u9t0s1r2q3p4o5n6m7l8k9j0i1',
      salt: 'c29tZXNhbHQ',
      timestamp: '2026-07-31T02:22:19Z'
    }
  },
  {
    id: 'auth-ip-intel',
    name: 'IP Threat Intelligence',
    category: 'auth',
    method: 'GET',
    path: '/api/v1/auth/ip-intel',
    summary: 'Evaluate IP reputation, proxy detection, VPN flags, and risk score.',
    description: 'Guards your applications against malicious bots, credential stuffing, and fraud with real-time IP threat scoring.',
    rateLimit: '300 req/min',
    params: [
      { name: 'ip', type: 'string', required: true, description: 'IPv4 or IPv6 address to lookup.', location: 'query', default: '8.8.8.8' }
    ],
    sampleResponseBody: {
      ip: '8.8.8.8',
      risk_score: 2,
      is_vpn: false,
      is_proxy: false,
      is_tor: false,
      is_datacenter: true,
      isp: 'Google LLC',
      country: 'United States',
      city: 'Mountain View',
      threat_level: 'low'
    }
  },

  // Data Category
  {
    id: 'data-fx',
    name: 'Forex Exchange Rates',
    category: 'data',
    method: 'GET',
    path: '/api/v1/data/fx',
    summary: 'Live FX currency exchange rates updated every 60 seconds.',
    description: 'Provides spot rates and historical currency trends for over 160 fiat currencies and top cryptocurrencies.',
    rateLimit: '600 req/min',
    params: [
      { name: 'base', type: 'string', required: false, description: 'Base currency symbol (e.g. USD, EUR, LKR, JPY).', location: 'query', default: 'USD' },
      { name: 'symbols', type: 'string', required: false, description: 'Comma separated list of target symbols.', location: 'query', default: 'EUR,GBP,JPY,LKR,BTC' }
    ],
    sampleResponseBody: {
      base: 'USD',
      date: '2026-07-31',
      rates: {
        EUR: 0.918,
        GBP: 0.782,
        JPY: 154.2,
        LKR: 302.5,
        BTC: 0.0000104
      },
      updated_at: '2026-07-31T02:20:00Z'
    }
  },
  {
    id: 'data-weather',
    name: 'Climate Sync Weather',
    category: 'data',
    method: 'GET',
    path: '/api/v1/data/weather',
    summary: 'Real-time weather observation, UV index, and 7-day micro-forecast.',
    description: 'Hyper-local weather telemetry by city name or GPS coordinates.',
    rateLimit: '400 req/min',
    params: [
      { name: 'city', type: 'string', required: true, description: 'City name or lat,long string.', location: 'query', default: 'Colombo' }
    ],
    sampleResponseBody: {
      location: 'Colombo, Sri Lanka',
      coordinates: { lat: 6.9271, lon: 79.8612 },
      current: {
        temp_c: 29.5,
        feels_like_c: 33.2,
        humidity_percent: 78,
        condition: 'Partly Cloudy',
        wind_kmh: 14.5,
        uv_index: 8.4
      },
      air_quality_index: 42
    }
  },

  // Utility Category
  {
    id: 'util-shorten',
    name: 'URL Compression & Analytics',
    category: 'utility',
    method: 'POST',
    path: '/api/v1/util/shorten',
    summary: 'Shorten long URLs with custom aliases, expiration times, and click tracking.',
    description: 'Creates high-speed short links hosted on edge nodes with instant redirection and geolocation analytics.',
    rateLimit: '300 req/min',
    params: [
      { name: 'url', type: 'string', required: true, description: 'Destination URL to shorten.', location: 'body', default: 'https://vercel.com/docs/frameworks/vite' },
      { name: 'custom_alias', type: 'string', required: false, description: 'Optional vanity slug.', location: 'body', default: 'vercel-vite-docs' }
    ],
    sampleRequestBody: {
      url: 'https://vercel.com/docs/frameworks/vite',
      custom_alias: 'vercel-vite-docs'
    },
    sampleResponseBody: {
      short_url: 'https://apinexusdev-blush.vercel.app/nx/vercel-vite-docs',
      original_url: 'https://vercel.com/docs/frameworks/vite',
      alias: 'vercel-vite-docs',
      qr_code: 'https://apinexusdev-blush.vercel.app/api/v1/util/qrcode?data=https://apinexusdev-blush.vercel.app/nx/vercel-vite-docs',
      created_at: '2026-07-31T02:22:19Z',
      clicks: 0
    }
  },
  {
    id: 'util-qrcode',
    name: 'Matrix Vector QR Code',
    category: 'utility',
    method: 'GET',
    path: '/api/v1/util/qrcode',
    summary: 'Generate customizable SVG, PNG, or DataURL QR codes on demand.',
    description: 'Renders crisp QR code matrices with custom brand colors, logo embedding, and error correction levels.',
    rateLimit: '500 req/min',
    params: [
      { name: 'data', type: 'string', required: true, description: 'Content or URL encoded inside QR.', location: 'query', default: 'https://apinexusdev-blush.vercel.app' },
      { name: 'size', type: 'number', required: false, description: 'Width/Height in pixels (100 to 1000).', location: 'query', default: '250' }
    ],
    sampleResponseBody: {
      data: 'https://apinexusdev-blush.vercel.app',
      format: 'svg',
      dimensions: '250x250',
      data_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">...</svg>'
    }
  },
  {
    id: 'util-youtube-download',
    name: 'Nexus HD YouTube Video Downloader',
    category: 'utility',
    method: 'POST',
    path: '/api/v1/utility/youtube-download',
    summary: 'Extract YouTube video metadata and direct MP4/MP3 download stream URLs.',
    description: 'Parses YouTube video URLs or video IDs, extracts title, channel, duration, view count, high-res thumbnail, and returns direct downloadable stream URLs for 1080p, 720p, 360p, and 320kbps MP3 audio.',
    rateLimit: '180 req/min',
    params: [
      { name: 'url', type: 'string', required: true, description: 'YouTube video URL or Video ID.', location: 'body', default: 'https://youtube.com/watch?v=0geqOYqwL0s' },
      { name: 'quality', type: 'string', required: false, description: 'Requested stream quality (1080p, 720p, 360p, 320k, auto).', location: 'body', default: '1080p' },
      { name: 'format', type: 'string', required: false, description: 'Target media format (mp4 or mp3).', location: 'body', default: 'mp4' }
    ],
    sampleRequestBody: {
      url: 'https://youtube.com/watch?v=0geqOYqwL0s',
      quality: '1080p',
      format: 'mp4'
    },
    sampleResponseBody: {
      status: 'success',
      authenticated: true,
      api_key: 'nx_live_demo_982a3',
      engine: 'APINexus High-Speed Media Engine v2.4',
      video_id: '0geqOYqwL0s',
      title: 'YouTube Ultra HD Trending Video',
      channel: 'Official Creator Channel',
      duration: '03:45',
      duration_seconds: 225,
      view_count: '2,400,000',
      thumbnail: 'https://img.youtube.com/vi/0geqOYqwL0s/maxresdefault.jpg',
      requested_quality: '1080p',
      requested_format: 'mp4',
      primary_download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      download_streams: [
        {
          quality: '1080p (Full HD)',
          resolution: '1920x1080',
          format: 'mp4',
          fps: 60,
          has_audio: true,
          file_size: '52.4 MB',
          download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          direct_media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        },
        {
          quality: '720p (HD)',
          resolution: '1280x720',
          format: 'mp4',
          fps: 60,
          has_audio: true,
          file_size: '26.8 MB',
          download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          direct_media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        },
        {
          quality: '320kbps (Audio)',
          resolution: 'Audio Only',
          format: 'mp3',
          fps: 0,
          has_audio: true,
          file_size: '9.2 MB',
          download_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          direct_media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
      ],
      expires_at: '2026-08-01T14:30:00Z'
    }
  },
  {
    id: 'util-ytdl-zanta-query',
    name: 'YouTube Downloader Endpoint (GET)',
    category: 'utility',
    method: 'GET',
    path: '/api/ytdl',
    summary: 'GET YouTube Downloader API returning direct media download stream links.',
    description: 'Universal YouTube video downloader API supporting direct URL parameter queries.',
    rateLimit: '180 req/min',
    params: [
      { name: 'apiKey', type: 'string', required: true, description: 'API Key authentication token.', location: 'query', default: 'nx_live_demo_982a3' },
      { name: 'url', type: 'string', required: true, description: 'Target YouTube video URL.', location: 'query', default: 'https://youtube.com/watch?v=0geqOYqwL0s' },
      { name: 'type', type: 'string', required: false, description: 'Media type (mp4 or mp3).', location: 'query', default: 'mp4' },
      { name: 'quality', type: 'string', required: false, description: 'Target quality (360, 720, 1080).', location: 'query', default: '360' }
    ],
    sampleRequestBody: {
      apiKey: 'nx_live_demo_982a3',
      url: 'https://youtube.com/watch?v=0geqOYqwL0s',
      type: 'mp4',
      quality: '360'
    },
    sampleResponseBody: {
      status: 'success',
      authenticated: true,
      api_key: 'nx_live_demo_982a3',
      engine: 'APINexus High-Speed Media Engine v2.4',
      video_id: '0geqOYqwL0s',
      title: 'YouTube Ultra HD Trending Video',
      channel: 'Official Creator Channel',
      duration: '03:45',
      duration_seconds: 225,
      view_count: '2,400,000',
      thumbnail: 'https://img.youtube.com/vi/0geqOYqwL0s/maxresdefault.jpg',
      requested_quality: '360',
      requested_format: 'mp4',
      primary_download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      download_streams: [
        {
          quality: '360p (SD)',
          resolution: '640x360',
          format: 'mp4',
          fps: 30,
          has_audio: true,
          file_size: '12.1 MB',
          download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          direct_media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        }
      ]
    }
  }
];

export const CODE_SNIPPETS = {
  curl: (endpoint: ApiEndpoint, baseUrl: string, key: string, params: Record<string, any>) => {
    if (endpoint.method === 'GET') {
      const queryStr = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const fullPath = queryStr ? `${endpoint.path}?${queryStr}` : endpoint.path;
      return `curl -X GET "${baseUrl}${fullPath}" \\
  -H "Authorization: Bearer ${key || 'YOUR_NEXUS_API_KEY'}" \\
  -H "Accept: application/json"`;
    }
    return `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer ${key || 'YOUR_NEXUS_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(params, null, 2)}'`;
  },

  javascript: (endpoint: ApiEndpoint, baseUrl: string, key: string, params: Record<string, any>) => {
    if (endpoint.method === 'GET') {
      const queryStr = new URLSearchParams(params).toString();
      const url = queryStr ? `${endpoint.path}?${queryStr}` : endpoint.path;
      return `// Using Fetch API
const response = await fetch('${baseUrl}${url}', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ${key || 'YOUR_NEXUS_API_KEY'}',
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
    }
    return `// Using Fetch API
const response = await fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${key || 'YOUR_NEXUS_API_KEY'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(params, null, 2)})
});

const data = await response.json();
console.log(data);`;
  },

  python: (endpoint: ApiEndpoint, baseUrl: string, key: string, params: Record<string, any>) => {
    if (endpoint.method === 'GET') {
      return `import requests

url = "${baseUrl}${endpoint.path}"
headers = {
    "Authorization": "Bearer ${key || 'YOUR_NEXUS_API_KEY'}",
    "Accept": "application/json"
}
params = ${JSON.stringify(params, null, 4).replace(/true/g, 'True').replace(/false/g, 'False')}

response = requests.get(url, headers=headers, params=params)
print(response.json())`;
    }
    return `import requests

url = "${baseUrl}${endpoint.path}"
headers = {
    "Authorization": "Bearer ${key || 'YOUR_NEXUS_API_KEY'}",
    "Content-Type": "application/json"
}
payload = ${JSON.stringify(params, null, 4).replace(/true/g, 'True').replace(/false/g, 'False')}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;
  },

  go: (endpoint: ApiEndpoint, baseUrl: string, key: string, params: Record<string, any>) => {
    return `package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
)

func main() {
	url := "${baseUrl}${endpoint.path}"
	payload := strings.NewReader(\`${JSON.stringify(params, null, 2)}\`)

	req, _ := http.NewRequest("${endpoint.method}", url, payload)
	req.Header.Add("Authorization", "Bearer ${key || "YOUR_NEXUS_API_KEY"}")
	req.Header.Add("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`;
  },

  rust: (endpoint: ApiEndpoint, baseUrl: string, key: string, params: Record<string, any>) => {
    return `use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = reqwest::Client::new();
    let res = client
        .${endpoint.method.toLowerCase()}("${baseUrl}${endpoint.path}")
        .header(AUTHORIZATION, "Bearer ${key || 'YOUR_NEXUS_API_KEY'}")
        .header(CONTENT_TYPE, "application/json")
        .json(&serde_json::json!(${JSON.stringify(params)}))
        .send()
        .await?;

    let body = res.text().await?;
    println!("{}", body);
    Ok(())
}`;
  },

  php: (endpoint: ApiEndpoint, baseUrl: string, key: string, params: Record<string, any>) => {
    return `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${baseUrl}${endpoint.path}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${endpoint.method}",
  CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(params)}),
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer ${key || 'YOUR_NEXUS_API_KEY'}",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
  }
};
