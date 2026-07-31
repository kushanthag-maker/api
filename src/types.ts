export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiCategory = 'ai' | 'auth' | 'data' | 'utility';

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
