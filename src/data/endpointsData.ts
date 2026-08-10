import { ApiEndpoint } from '../types';

export const NEXUS_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'news-adaderana-list',
    name: 'Ada Derana News List & Search API',
    category: 'news',
    method: 'GET',
    path: '/api/v1/news/latest',
    summary: 'Fetch real-time news list, headlines & search results from Ada Derana intelligence feeds.',
    description: 'Scrapes real-time headlines, relative timestamps, lead thumbnails, and direct article URLs directly from Sinhala Ada Derana (sinhala.adaderana.lk). Requires a valid API Key.',
    rateLimit: '100 req/min',
    params: [
      { name: 'apiKey', type: 'string', required: true, description: 'Mandatory Nexus API Key (or x-api-key header).', location: 'query', default: 'YOUR_NEXUS_API_KEY' },
      { name: 'category', type: 'string', required: false, description: 'Category: latest, hot, sports, world, business, or entertainment.', location: 'query', default: 'latest' },
      { name: 'q', type: 'string', required: false, description: 'Optional search keyword filter.', location: 'query', default: '' }
    ],
    sampleRequestBody: {
      apiKey: 'YOUR_NEXUS_API_KEY',
      category: 'latest'
    },
    sampleResponseBody: {
      status: true,
      category: 'LATEST',
      query: null,
      total_news: 15,
      results: [
        {
          id: 'news_official_php_nid_192834',
          title: 'මහනුවර ප්‍රධාන මාර්ගයේ රථවාහන තදබදයක්',
          time: 'මීට မိနစ် 10 කට පෙර',
          image: 'https://sinhala.adaderana.lk/news_images/news_12345.jpg',
          url: 'https://sinhala.adaderana.lk/news_official.php?nid=192834',
          category: 'LATEST',
          detail_api_url: 'https://apinexusdev-blush.vercel.app/api/v1/news/detail?url=https%3A%2F%2Fsinhala.adaderana.lk%2Fnews_official.php%3Fnid%3D192834'
        }
      ]
    }
  },
  {
    id: 'news-adaderana-detail',
    name: 'Ada Derana News Article Detail API',
    category: 'news',
    method: 'GET',
    path: '/api/v1/news/detail',
    summary: 'Fetch full news article content, main image, timestamp, and metadata from Ada Derana.',
    description: 'Scrapes full news article body text, lead image banner, publication timestamp, and source URL for any specific Ada Derana article link. Requires a valid API Key.',
    rateLimit: '100 req/min',
    params: [
      { name: 'apiKey', type: 'string', required: true, description: 'Mandatory Nexus API Key (or x-api-key header).', location: 'query', default: 'YOUR_NEXUS_API_KEY' },
      { name: 'url', type: 'string', required: true, description: 'Full Ada Derana article URL (e.g. https://sinhala.adaderana.lk/news_official.php?nid=192834).', location: 'query', default: 'https://sinhala.adaderana.lk/news_official.php?nid=192834' }
    ],
    sampleRequestBody: {
      apiKey: 'YOUR_NEXUS_API_KEY',
      url: 'https://sinhala.adaderana.lk/news_official.php?nid=192834'
    },
    sampleResponseBody: {
      status: true,
      title: 'මහනුවර ප්‍රධාන මාර්ගයේ රථවාහන තදබදයක්',
      timestamp: '2026-08-01 10:15 AM',
      image: 'https://sinhala.adaderana.lk/news_images/news_12345.jpg',
      url: 'https://sinhala.adaderana.lk/news_official.php?nid=192834',
      paragraphs: [
        'මහනුවර ප්‍රධාන මාර්ගයේ පවතින නඩත්තු කටයුතු හේතුවෙන් අධික රථවාහන තදබදයක් හටගෙන ඇති බව පොලීසිය පවසයි.'
      ],
      full_article: 'මහනුවර ප්‍රධාන මාර්ගයේ පවතින නඩත්තු කටයුතු හේතුවෙන් අධික රථවාහන තදබදයක් හටගෙන ඇති බව පොලීසිය පවසයි...',
      full_news: 'මහනුවර ප්‍රධාන මාර්ගයේ පවතින නඩත්තු කටයුතු හේතුවෙන් අධික රථවාහන තදබදයක් හටගෙන ඇති බව පොලීසිය පවසයි...',
      article_content: 'මහනුවර ප්‍රධාන මාර්ගයේ පවතින නඩත්තු කටයුතු හේතුවෙන් අධික රථවාහන තදබදයක් හටගෙන ඇති බව පොලීසිය පවසයි...'
    }
  },
  {
    id: 'instagram-stalk-search',
    name: 'Instagram Profile Stalker & Search API',
    category: 'instagram',
    method: 'GET',
    path: '/api/v1/instagram/stalk',
    summary: 'Search & stalk Instagram user profiles, follower count, biography, and profile picture.',
    description: 'Scrapes Instagram profile metadata including full name, follower count, following count, total post count, HD profile picture URL, and biography details.',
    rateLimit: '60 req/min',
    params: [
      { name: 'apiKey', type: 'string', required: true, description: 'Mandatory Nexus API Key (or x-api-key header).', location: 'query', default: 'YOUR_NEXUS_API_KEY' },
      { name: 'username', type: 'string', required: true, description: 'Target Instagram username (e.g. cristiano, instagram, etc.).', location: 'query', default: 'cristiano' }
    ],
    sampleRequestBody: {
      apiKey: 'YOUR_NEXUS_API_KEY',
      username: 'cristiano'
    },
    sampleResponseBody: {
      status: 'success',
      username: 'cristiano',
      full_name: 'Cristiano Ronaldo',
      followers: '640M',
      following: '580',
      posts_count: '3,750',
      biography: 'Cristiano Ronaldo Official Instagram Profile',
      profile_pic: 'https://api.dicebear.com/7.x/identicon/svg?seed=cristiano',
      profile_url: 'https://www.instagram.com/cristiano/',
      is_private: false,
      is_verified: true
    }
  },
  {
    id: 'instagram-media-downloader',
    name: 'Instagram Media & Reels Downloader API',
    category: 'instagram',
    method: 'GET',
    path: '/api/v1/instagram/download',
    summary: 'Extract high-speed direct video & image download URLs from Instagram posts, Reels, and IGTV.',
    description: 'Parses Instagram shortcodes from post or reel links and returns direct downloadable CDN media URLs along with original captions and thumbnails.',
    rateLimit: '60 req/min',
    params: [
      { name: 'apiKey', type: 'string', required: true, description: 'Mandatory Nexus API Key (or x-api-key header).', location: 'query', default: 'YOUR_NEXUS_API_KEY' },
      { name: 'url', type: 'string', required: true, description: 'Full Instagram Post or Reel URL.', location: 'query', default: 'https://www.instagram.com/reel/C3x9L9vI1AB/' }
    ],
    sampleRequestBody: {
      apiKey: 'YOUR_NEXUS_API_KEY',
      url: 'https://www.instagram.com/reel/C3x9L9vI1AB/'
    },
    sampleResponseBody: {
      status: 'success',
      shortcode: 'C3x9L9vI1AB',
      type: 'video',
      download_url: 'https://instagram.fcol1-1.fna.fbcdn.net/v/t51.2885-15/...',
      thumbnail: 'https://instagram.fcol1-1.fna.fbcdn.net/v/t51.2885-15/...',
      caption: 'Unforgettable moments on the pitch 🔥',
      original_url: 'https://www.instagram.com/p/C3x9L9vI1AB/'
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
