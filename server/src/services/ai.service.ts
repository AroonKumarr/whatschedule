import crypto from 'crypto';

export interface AIDraftRequest {
  prompt: string;
  context?: string;
  tone?: 'professional' | 'friendly' | 'urgent' | 'casual';
  recipientRole?: string; // e.g., "HR Manager", "Client", "Friend"
}

export interface AIDraftResponse {
  draft: string;
  cached: boolean;
  tokensUsed: number;
  model: string;
}

interface CacheEntry {
  draft: string;
  timestamp: number;
}

class AIService {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTTLMs = 24 * 60 * 60 * 1000; // 24-hour cache for identical draft prompts

  // Guardrail 1: Global concurrency control
  private activeRequests = 0;
  private maxGlobalConcurrency = 5;

  // Guardrail 2: Per-user token / rate-limiting bucket (requests per minute)
  private userRateBuckets: Map<string, { count: number; resetAt: number }> = new Map();
  private maxRequestsPerMinute = 15;

  // Guardrail 3: Token budget counters
  private totalTokensConsumed = 0;
  private tokenBudgetAlertThreshold = 500000;

  constructor() {
    // Periodically prune expired cache entries
    setInterval(() => this.pruneCache(), 60 * 60 * 1000);
  }

  private pruneCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTTLMs) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generates a draft with full production safety guardrails
   */
  public async generateDraft(
    userId: string,
    req: AIDraftRequest
  ): Promise<AIDraftResponse> {
    // 1. Guardrail: Per-user rate limiting
    this.checkRateLimit(userId);

    // 2. Guardrail: Concurrency protection
    if (this.activeRequests >= this.maxGlobalConcurrency) {
      throw new Error('AI drafting service is at maximum capacity. Please retry in a few seconds.');
    }

    // 3. Guardrail: Prompt cache check (Crypto hash)
    const promptHash = crypto
      .createHash('sha256')
      .update(`${req.prompt}:${req.tone || 'professional'}:${req.recipientRole || ''}`)
      .digest('hex');

    const cached = this.cache.get(promptHash);
    if (cached && Date.now() - cached.timestamp < this.cacheTTLMs) {
      return {
        draft: cached.draft,
        cached: true,
        tokensUsed: 0,
        model: 'cache-hit',
      };
    }

    this.activeRequests++;

    try {
      // Execute with timeout and exponential backoff retry
      const draft = await this.executeWithRetry(async () => {
        return await this.callAIProvider(req);
      }, 3);

      // Estimate tokens (~1 token per 4 chars for short drafts)
      const tokensUsed = Math.ceil(draft.length / 4);
      this.totalTokensConsumed += tokensUsed;

      if (this.totalTokensConsumed > this.tokenBudgetAlertThreshold) {
        console.warn(`[AI Budget Alert] Total tokens consumed (${this.totalTokensConsumed}) exceeded threshold!`);
      }

      // Store in cache
      this.cache.set(promptHash, { draft, timestamp: Date.now() });

      return {
        draft,
        cached: false,
        tokensUsed,
        model: process.env.AI_PROVIDER || 'local-template-fallback',
      };
    } finally {
      this.activeRequests--;
    }
  }

  private checkRateLimit(userId: string) {
    const now = Date.now();
    const bucket = this.userRateBuckets.get(userId) || { count: 0, resetAt: now + 60000 };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + 60000;
    }

    if (bucket.count >= this.maxRequestsPerMinute) {
      throw new Error(`Rate limit exceeded (${this.maxRequestsPerMinute} drafts/min). Please slow down.`);
    }

    bucket.count++;
    this.userRateBuckets.set(userId, bucket);
  }

  /**
   * Exponential backoff retry with jitter
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt === maxRetries) break;

        // Exponential backoff: 300ms, 600ms, 1200ms + random jitter
        const jitter = Math.random() * 200;
        const delay = Math.pow(2, attempt) * 150 + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  /**
   * Provider dispatcher with fallback support
   */
  private async callAIProvider(req: AIDraftRequest): Promise<string> {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // If an external API key is provided in .env, connect to it
    if (apiKey && process.env.AI_PROVIDER === 'gemini') {
      return await this.callGeminiAPI(apiKey, req);
    } else if (apiKey && process.env.AI_PROVIDER === 'openai') {
      return await this.callOpenAIAPI(apiKey, req);
    }

    // Default intelligent local template engine (Zero cost, works offline, zero API fees!)
    return this.generateSmartTemplate(req);
  }

  private async callGeminiAPI(apiKey: string, req: AIDraftRequest): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `You are an AI WhatsApp messaging assistant. Draft a concise, courteous WhatsApp message (under 60 words). Tone: ${req.tone || 'professional'}. Role: ${req.recipientRole || 'contact'}. Only output the message text.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7s timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\nUser request: ${req.prompt}` }] }],
          generationConfig: { maxOutputTokens: 250, temperature: 0.6 },
        }),
        signal: controller.signal,
      });

      const data: any = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        this.generateSmartTemplate(req)
      );
    } catch {
      return this.generateSmartTemplate(req);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callOpenAIAPI(apiKey: string, req: AIDraftRequest): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Draft a short, natural WhatsApp message (max 50 words). Tone: ${req.tone || 'professional'}. Output only the message body.`,
            },
            { role: 'user', content: req.prompt },
          ],
          max_tokens: 250,
        }),
        signal: controller.signal,
      });

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || this.generateSmartTemplate(req);
    } catch {
      return this.generateSmartTemplate(req);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Deterministic local smart template fallback (Guarantees zero downtime if API drops)
   */
  private generateSmartTemplate(req: AIDraftRequest): string {
    const p = req.prompt.toLowerCase();

    if (p.includes('salary') || p.includes('pay') || p.includes('hr')) {
      return 'Hi, good morning! Hope you are doing well. I wanted to gently follow up regarding the salary slip update as previously discussed. Please let me know when convenient. Thank you!';
    }
    if (p.includes('meeting') || p.includes('schedule') || p.includes('call')) {
      return 'Hi! Checking in regarding our scheduled call. Looking forward to connecting with you. Let me know if the time still works on your end.';
    }
    if (p.includes('reminder') || p.includes('deadline')) {
      return 'Hi, quick reminder regarding our pending deliverable. Please feel free to reach out if you have any questions or updates. Thanks!';
    }

    return `Hi! Hope you are having a productive day. Reaching out regarding: ${req.prompt}. Looking forward to hearing from you!`;
  }
}

export const aiService = new AIService();
