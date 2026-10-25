import crypto from 'crypto';

export interface AIDraftRequest {
  prompt: string;
  context?: string;
  tone?: 'professional' | 'friendly' | 'urgent' | 'casual';
  recipientRole?: string;
}

export interface AIDraftResponse {
  draft: string;
  cached: boolean;
  tokensUsed: number;
  model: string;
  provider: 'groq' | 'gemini' | 'local-fallback';
}

interface CacheEntry {
  draft: string;
  timestamp: number;
  provider: 'groq' | 'gemini' | 'local-fallback';
  model: string;
}

class AIService {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTTLMs = 24 * 60 * 60 * 1000;

  // Global Concurrency Guardrail (max 8 concurrent requests across 1M potential users)
  private activeRequests = 0;
  private maxGlobalConcurrency = 8;

  // Per-User Rate Limiting Token Bucket (15 requests/min per IP or user token)
  private userRateBuckets: Map<string, { count: number; resetAt: number }> = new Map();
  private maxRequestsPerMinute = 15;

  private totalTokensConsumed = 0;
  private tokenBudgetAlertThreshold = 500000;

  constructor() {
    const timer = setInterval(() => this.pruneCache(), 60 * 60 * 1000);
    if (timer.unref) timer.unref();
  }

  private pruneCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTTLMs) {
        this.cache.delete(key);
      }
    }
  }

  public async generateDraft(
    userId: string,
    req: AIDraftRequest
  ): Promise<AIDraftResponse> {
    this.checkRateLimit(userId);

    if (this.activeRequests >= this.maxGlobalConcurrency) {
      throw new Error('AI drafting engine is experiencing peak load. Please retry in 3 seconds.');
    }

    // SHA-256 Prompt Caching
    const promptHash = crypto
      .createHash('sha256')
      .update(`${req.prompt.trim()}:${req.tone || 'professional'}:${req.recipientRole || ''}`)
      .digest('hex');

    const cached = this.cache.get(promptHash);
    if (cached && Date.now() - cached.timestamp < this.cacheTTLMs) {
      return {
        draft: cached.draft,
        cached: true,
        tokensUsed: 0,
        model: cached.model,
        provider: cached.provider,
      };
    }

    this.activeRequests++;

    try {
      // Automatic Multi-Provider Failover Cascade: Groq -> Gemini -> Local
      const result = await this.executeProviderCascade(req);

      const tokensUsed = Math.ceil(result.draft.length / 4);
      this.totalTokensConsumed += tokensUsed;

      this.cache.set(promptHash, {
        draft: result.draft,
        timestamp: Date.now(),
        provider: result.provider,
        model: result.model,
      });

      return {
        draft: result.draft,
        cached: false,
        tokensUsed,
        model: result.model,
        provider: result.provider,
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
      throw new Error(`Rate limit reached (${this.maxRequestsPerMinute} drafts/min). Please wait a moment.`);
    }

    bucket.count++;
    this.userRateBuckets.set(userId, bucket);
  }

  /**
   * Multi-Model Fallback Cascade
   * 1. Groq (qwen/qwen3.8-27b) — Sub-200ms ultra-fast inference
   * 2. Google Gemini (gemini-2.5-flash) — Resilient failover
   * 3. Local Smart Template — Zero downtime offline fallback
   */
  private async executeProviderCascade(
    req: AIDraftRequest
  ): Promise<{ draft: string; model: string; provider: 'groq' | 'gemini' | 'local-fallback' }> {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Step 1: Try Groq first (blazing fast <200ms)
    if (groqKey) {
      try {
        const groqDraft = await this.callGroq(groqKey, req);
        if (groqDraft) {
          return { draft: groqDraft, model: 'qwen3.8-27b (Groq)', provider: 'groq' };
        }
      } catch (err: any) {
        console.warn('[AI Cascade] Groq provider failed or rate limited, failing over to Gemini:', err?.message);
      }
    }

    // Step 2: Failover to Google Gemini 2.5 Flash
    if (geminiKey) {
      try {
        const geminiDraft = await this.callGemini(geminiKey, req);
        if (geminiDraft) {
          return { draft: geminiDraft, model: 'gemini-2.5-flash (Google)', provider: 'gemini' };
        }
      } catch (err: any) {
        console.warn('[AI Cascade] Gemini provider failed, falling over to local template:', err?.message);
      }
    }

    // Step 3: Local Offline Smart Template
    return {
      draft: this.generateSmartTemplate(req),
      model: 'smart-template-engine',
      provider: 'local-fallback',
    };
  }

  private async callGroq(apiKey: string, req: AIDraftRequest): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const systemPrompt = `You are a WhatsApp message drafting assistant. Draft a single, natural WhatsApp message (max 45 words). Tone: ${req.tone || 'professional'}. Role: ${req.recipientRole || 'contact'}. Output ONLY the message text. No quotes, no intro, no reasoning.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: req.prompt },
          ],
          max_tokens: 150,
          temperature: 0.6,
        }),
        signal: controller.signal,
      });

      const data: any = await response.json();
      const rawText = data.choices?.[0]?.message?.content?.trim();
      return this.cleanDraftOutput(rawText);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callGemini(apiKey: string, req: AIDraftRequest): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const promptText = `Draft a concise, polite WhatsApp message (under 50 words). Tone: ${req.tone || 'professional'}. Recipient: ${req.recipientRole || 'contact'}. Purpose: ${req.prompt}. Output ONLY the message text without introductory words or quotes.`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { maxOutputTokens: 180, temperature: 0.5 },
        }),
        signal: controller.signal,
      });

      const data: any = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return this.cleanDraftOutput(rawText);
    } finally {
      clearTimeout(timeout);
    }
  }

  private cleanDraftOutput(text?: string): string {
    if (!text) return '';
    return text
      .replace(/^["']|["']$/g, '') // Remove wrapping quotes
      .replace(/^(Here is a draft:|Draft:|Message:)\s*/i, '')
      .trim();
  }

  private generateSmartTemplate(req: AIDraftRequest): string {
    const p = req.prompt.toLowerCase();
    if (p.includes('salary') || p.includes('pay') || p.includes('hr')) {
      return 'Hi, good morning! Hope you are doing well. I wanted to gently follow up regarding the salary slip update as previously discussed. Please let me know when convenient. Thank you!';
    }
    if (p.includes('meeting') || p.includes('call') || p.includes('schedule')) {
      return 'Hi! Quick check-in regarding our upcoming scheduled meeting. Looking forward to connecting. Please let me know if the time still works for you!';
    }
    if (p.includes('reminder') || p.includes('deadline')) {
      return 'Hi, gentle reminder regarding our pending project deliverable. Let me know if you need any additional details from my end. Thanks!';
    }
    return `Hi! Hope you are having a productive day. Reaching out regarding: ${req.prompt}. Looking forward to connecting!`;
  }

  /**
   * Parse a natural-language voice command into a structured schedule action.
   * Examples:
   *  "Send message to Aroon at 9pm, let's play cricket tomorrow"
   *  "Remind Bilal tomorrow morning at 10 about the meeting"
   *
   * Returns: { recipientName, message, scheduledAt (ISO UTC), confidence }
   */
  public async parseVoiceCommand(
    userId: string,
    transcript: string,
    userTimezone: string = 'UTC'
  ): Promise<{
    recipientName: string | null;
    message: string | null;
    scheduledAt: string | null;
    rawParsed: string;
    provider: string;
  }> {
    this.checkRateLimit(userId);

    const now = new Date().toISOString();
    const systemPrompt = `You are a smart WhatsApp message scheduler assistant.
The user spoke a voice command. Extract the scheduling intent.
Current UTC time: ${now}
User's timezone: ${userTimezone}

Extract and return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "recipientName": "<name of person to send to, or null>",
  "message": "<the actual message content to send, or null>",
  "scheduledAt": "<ISO 8601 UTC datetime string when to send, or null if no time mentioned>",
  "confidence": <0.0-1.0>
}

Rules:
- If user says "tomorrow at 9pm" resolve it relative to current UTC time + user timezone.
- If no time is mentioned, scheduledAt = null (send immediately).
- message should be ONLY the message content, not the scheduling instructions.
- recipientName is the contact name the user wants to send to.`;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let rawParsed = '';
    let provider = 'local-fallback';

    // Try Groq first (fastest)
    if (groqKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Voice command: "${transcript}"` },
            ],
            max_tokens: 200,
            temperature: 0.1, // Low temp for structured JSON
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data: any = await response.json();
        rawParsed = data.choices?.[0]?.message?.content?.trim() || '';
        if (rawParsed) provider = 'groq';
      } catch (err: any) {
        console.warn('[Voice AI] Groq failed, trying Gemini:', err?.message);
      }
    }

    // Fallback to Gemini
    if (!rawParsed && geminiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nVoice command: "${transcript}"` }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.1 },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data: any = await response.json();
        rawParsed = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (rawParsed) provider = 'gemini';
      } catch (err: any) {
        console.warn('[Voice AI] Gemini failed:', err?.message);
      }
    }

    // Parse the JSON response
    try {
      // Strip markdown code fences if present
      const cleaned = rawParsed.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        recipientName: parsed.recipientName || null,
        message: parsed.message || null,
        scheduledAt: parsed.scheduledAt || null,
        rawParsed,
        provider,
      };
    } catch (_) {
      // Return best-effort nulls if JSON parse fails
      return {
        recipientName: null,
        message: transcript, // fallback: use full transcript as message
        scheduledAt: null,
        rawParsed,
        provider,
      };
    }
  }
}

export const aiService = new AIService();
