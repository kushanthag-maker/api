import { buildApp } from '../server.js';

let app: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = buildApp();
    }
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel Serverless Function Execution Error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: false,
        message: 'APINexus Serverless Function execution failed',
        error: err?.message || String(err)
      });
    }
  }
}
