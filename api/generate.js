// api/generate.js — Vercel serverless function
// Your OpenAI API key is stored in Vercel environment variables (never in code)

const rateLimit = new Map(); // In-memory store (resets on cold start — fine for free tier)

const DAILY_LIMIT = 5; // Free uses per IP per day

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Rate limiting ---
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const today = new Date().toISOString().slice(0, 10); // "2024-01-15"
  const key = `${ip}:${today}`;
  const uses = rateLimit.get(key) || 0;

  if (uses >= DAILY_LIMIT) {
    return res.status(429).json({
      error: `You've used all ${DAILY_LIMIT} free generations for today. Come back tomorrow!`
    });
  }

  // --- Validate input ---
  const { topic, niche, style } = req.body || {};
  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({ error: 'Please provide a valid topic.' });
  }
  if (topic.length > 300) {
    return res.status(400).json({ error: 'Topic too long (max 300 characters).' });
  }

  const styleDescriptions = {
    curiosity: 'curiosity gap (tease something without revealing it)',
    controversial: 'controversial or counterintuitive statement',
    story: 'personal story opener ("I used to...", "Last week I...")',
    number: 'number or list-based ("3 things...", "I did X for 30 days...")',
    mistake: 'mistake or warning ("Stop doing this...", "I wish someone told me...")',
    relatable: 'relatable situation the viewer has experienced'
  };

  const validStyles = Object.keys(styleDescriptions);
  const validNiches = ['general','finance','fitness','food','travel','beauty','tech','business','relationships','education','gaming','parenting'];
  const safeStyle = validStyles.includes(style) ? style : 'curiosity';
  const safeNiche = validNiches.includes(niche) ? niche : 'general';

  // --- Call OpenAI ---
  const prompt = `You are an expert TikTok content strategist who specializes in writing viral hooks.

Generate exactly 7 TikTok video hooks for the following:
- Topic: "${topic.trim()}"
- Niche: ${safeNiche}
- Hook style: ${styleDescriptions[safeStyle]}

Rules for great hooks:
- Maximum 15 words each
- Must create immediate curiosity or emotion in the first 2 seconds
- Written as spoken words (what the creator would SAY on camera)
- No hashtags, no emojis
- Varied sentence structures — don't repeat the same opening pattern
- Each hook should feel distinctly different from the others

Return ONLY a JSON array with this structure, nothing else:
[
  {"hook": "hook text here", "type": "why this works in 3-4 words"},
  ...
]`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Set this in Vercel dashboard
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cheapest capable model — ~$0.0002 per request
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error('OpenAI error:', err);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const data = await openaiRes.json();
    const text = data.choices[0].message.content.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Bad response format');
    const hooks = JSON.parse(jsonMatch[0]);

    // Increment rate limit AFTER success
    rateLimit.set(key, uses + 1);
    const remaining = DAILY_LIMIT - uses - 1;

    return res.status(200).json({ hooks, remaining });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
