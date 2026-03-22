/**
 * Vercel Serverless Function — ElevenLabs Text-to-Speech proxy
 *
 * Keeps your API key server-side. Client sends text, gets audio.
 *
 * Required env vars (Vercel Dashboard → Settings → Environment Variables):
 *   ELEVENLABS_API_KEY  — your API key from elevenlabs.io
 *   ELEVENLABS_VOICE_ID — (optional) voice ID; default is Rachel
 */

const DEFAULT_VOICE = "21m00smcm4vld03095g93"; // Rachel — warm, kid-friendly

module.exports = async function handler(req, res) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

  // GET — quick health check (no ElevenLabs call, no credits). Open in browser to verify env on Vercel.
  if (req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      ok: true,
      elevenlabsKeyConfigured: Boolean(apiKey),
      voiceIdFromEnv: Boolean(process.env.ELEVENLABS_VOICE_ID),
      hint: apiKey
        ? "POST JSON { \"text\": \"Hello\" } with Content-Type: application/json to generate audio."
        : "Set ELEVENLABS_API_KEY in Vercel → Settings → Environment Variables, then redeploy.",
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY not configured" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const text = body.text?.trim();
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs error:", response.status, err);
    return res.status(response.status).json({
      error: "TTS failed",
      details: err,
    });
  }

  const audio = await response.arrayBuffer();
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h for same text
  return res.send(Buffer.from(audio));
};
