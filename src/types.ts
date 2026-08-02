export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiCategory = 'ai' | 'auth' | 'data' | 'utility' | 'news';

export type ApiStatus = 'online' | 'offline' | 'degraded';

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
  location: 'query' | 'header' | 'body' | 'path';
}

export interface ApiEndpoint {
  id: string;
  name: string;
  category: ApiCategory;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  rateLimit: string;
  isExperimental?: boolean;
  status?: ApiStatus;
  params: ApiParam[];
  sampleRequestBody?: Record<string, any>;
  sampleResponseBody: Record<string, any>;
  defaultHeaders?: Record<string, string>;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
  environment: 'development' | 'production';
  permissions: ('read' | 'write' | 'admin')[];
  usageToday: number;
  usageLimit: number;
}

export type CodeLanguage = 'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php';

export interface ApiResponseResult {
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  data: any;
  timestamp: string;
}

export interface AnalyticsMetric {
  timestamp: string;
  requests: number;
  latencyMs: number;
  errors: number;
}

export interface RegionLatency {
  region: string;
  code: string;
  latencyMs: number;
  status: 'optimal' | 'degraded';
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  requestsPerMonth: string;
  rateLimit: string;
  features: string[];
  popular?: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  googleId: string;
  isVerifiedGoogleAccount: boolean;
  role: 'developer' | 'admin' | 'guest';
  tier: string;
  apiKey?: string;
  isBanned?: boolean;
  banReason?: string;
  coinsBalance?: number;
  activeDataCards?: string[];
}

export interface PlatformRule {
  id: string;
  title: string;
  description: string;
  penalty: string;
}

export interface BanAppeal {
  email: string;
  appealText: string;
  status: 'pending' | 'approved' | 'rejected';
  messageFromNexusAi?: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  priceLkr: number;
  priceUsd: number;
  popular?: boolean;
  badge?: string;
}

export interface DataCard {
  id: string;
  title: string;
  dataAllowance: string;
  validityDays: number;
  coinPrice: number;
  priceLkr?: number;
  description: string;
  features: string[];
  recommendedFor: string;
  badge?: string;
}

