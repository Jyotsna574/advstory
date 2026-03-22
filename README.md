# Adventure Story ✨

Kid-friendly interactive adventure book built with **React**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

## Local development

```bash
npm install
npm run dev
```

## Deploy on Vercel (free)

This repo is ready for [Vercel](https://vercel.com)’s free Hobby tier.

### Option A — Dashboard (recommended)

1. Push this repo to GitHub (e.g. [github.com/Jyotsna574/advstory](https://github.com/Jyotsna574/advstory)).
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. **Import** your `advstory` repository.
4. Vercel should detect **Vite** automatically:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**. You’ll get a URL like `https://advstory-xxx.vercel.app`.

### Option B — Vercel CLI

```bash
npm i -g vercel
cd "path/to/adventure story"
vercel
```

Follow the prompts; use defaults unless your app lives in a subfolder (then set **Root Directory** in the project settings).

### Notes

- `vercel.json` configures the Vite build output and SPA fallback so all routes serve `index.html`.
- **Node:** Vercel uses a current Node version by default; compatible with Vite 4.
- After the first deploy, every push to `main` can auto-redeploy if you enable **Git** integration.

---

## ElevenLabs narration (TTS)

Narration uses a **Vercel serverless** route at `/api/tts` so your API key never ships to the browser.

### Environment variables (Vercel)

**Settings → Environment Variables** (enable for **Production** and **Preview** if you use preview URLs):

| Name | Value |
|------|--------|
| `ELEVENLABS_API_KEY` | Your key from [ElevenLabs](https://elevenlabs.io) (scoped to **Text to Speech** only). |
| `ELEVENLABS_VOICE_ID` | Your voice ID (optional; a default voice is used if omitted). |

**Redeploy** after saving variables.

### Verify deployment

1. **Health check (no credits used)** — open in the browser:
   - `https://YOUR-PROJECT.vercel.app/api/tts`  
   You should see JSON with `"elevenlabsKeyConfigured": true`.

2. **Full audio test** (uses a small amount of quota):
   ```bash
   curl -X POST "https://YOUR-PROJECT.vercel.app/api/tts" -H "Content-Type: application/json" -d "{\"text\":\"Hello from Adventure Book.\"}" -o tts-test.mp3
   ```
   Play `tts-test.mp3`.

If the API fails, the app **falls back** to the browser’s built-in speech.

### Local dev with TTS

`npm run dev` does not run `/api/tts`. Use:

```bash
cp .env.example .env.local
# Edit .env.local with your real ELEVENLABS_* values

npx vercel dev
```

---

## React + Vite

This project uses [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) for Fast Refresh.
