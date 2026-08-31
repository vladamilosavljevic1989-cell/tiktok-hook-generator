# TikTok Hook Generator 🎯

AI-powered tool that generates 7 scroll-stopping TikTok hooks for any topic.
No user signup needed. Rate-limited to 5 free uses per IP per day.

---

## Deploy in 5 minutes (Vercel — free)

### Step 1 — Get your OpenAI API key
1. Go to https://platform.openai.com
2. Sign up → API Keys → Create new secret key
3. Copy it — looks like `sk-proj-...`
4. Add a small credit ($5 minimum) under Billing

### Step 2 — Push to GitHub
1. Create a new repo on github.com (call it `tiktok-hook-generator`)
2. Upload all files from this folder into it

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project" → import your GitHub repo
3. Click Deploy (no build settings needed)

### Step 4 — Add your API key (important!)
1. In Vercel → your project → Settings → Environment Variables
2. Add:
   - Name: `OPENAI_API_KEY`
   - Value: your key from Step 1
3. Click Save → then Redeploy (Deployments tab → ... → Redeploy)

### Step 5 — Connect your domain
1. Buy a domain (namecheap.com or godaddy.com) — ~$12/year
2. In Vercel → Settings → Domains → Add your domain
3. Follow the DNS instructions (takes ~10 mins)

That's it — your tool is live! 🚀

---

## Customization

**Change daily limit:** Edit `DAILY_LIMIT` in `api/generate.js` (currently 5)

**Change the AI model:** Edit the `model` field in `api/generate.js`
- `claude-haiku-4-5-20251001` — fastest & cheapest (current, ~$0.001 per request)
- `claude-sonnet-4-6` — smarter but costs more (~$0.01 per request)

**Change the number of hooks:** Edit the prompt in `api/generate.js` (currently 7)

---

## Cost estimate (OpenAI API)
- Each generation costs ~$0.0002 using gpt-4o-mini
- 100 users/day × 5 uses = 500 requests = ~$0.10/day = ~$3/month
- Extremely cheap — $5 credit lasts months

---

## Selling this tool
List on: microns.io or littleexits.com
Target price: $200–$400 (more with traffic/ad revenue)
Add Google AdSense to index.html for passive revenue before selling.
