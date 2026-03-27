import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Fetch YouTube auto-captions (server-side — no CORS issues) ──
async function fetchYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    // Try multiple language codes
    const langs = ["en", "en-US", "en-GB", "a.en"];
    for (const lang of langs) {
      const url = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FSCreative/1.0)" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (!data?.events) continue;
      const text = data.events
        .filter((e: any) => e.segs)
        .map((e: any) => e.segs.map((s: any) => s.utf8 || "").join(""))
        .join(" ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 100) return text;
    }
  } catch (_) { /* fall through */ }
  return null;
}

// ── Build the Claude prompt using the Content Waterfall System ──
function buildPrompt(transcript: string): string {
  return `You are a world-class content strategist using the Content Waterfall System. Take this pillar piece of content and build the complete waterfall — turning 1 piece into 26+ platform-ready posts.

Return ONLY valid JSON — no markdown, no code blocks, no explanation. Use exactly this structure:

{
  "title": "compelling title for this pillar piece",
  "pillarSummary": "2-sentence summary of the core idea and value",
  "keyThemes": ["theme 1", "theme 2", "theme 3"],
  "tweets": [
    "Tweet 1 — punchy standalone idea under 280 chars",
    "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5",
    "Tweet 6", "Tweet 7", "Tweet 8", "Tweet 9", "Tweet 10"
  ],
  "shortFormScripts": [
    {
      "angle": "Short-form angle name",
      "platform": "YouTube Shorts / Reels / TikTok / X",
      "hook": "First line — the scroll stop (under 10 words)",
      "script": "Full ~95-word script, conversational, one idea, punchy ending"
    },
    { "angle": "angle 2", "platform": "YouTube Shorts / Reels / TikTok / X", "hook": "hook 2", "script": "script 2" },
    { "angle": "angle 3", "platform": "YouTube Shorts / Reels / TikTok / X", "hook": "hook 3", "script": "script 3" }
  ],
  "carousel": {
    "hookSlide": "Bold slide 1 headline that stops the scroll",
    "promiseSlide": "Slide 2 — what they get from this carousel",
    "valueSlides": ["Slide 3 key point", "Slide 4", "Slide 5", "Slide 6", "Slide 7", "Slide 8", "Slide 9 summary"],
    "ctaSlide": "Slide 10 — one clear CTA"
  },
  "linkedin": {
    "hook": "Opening line — bold claim or contrarian take",
    "body": "Full LinkedIn post — 4-5 short punchy paragraphs with line breaks, expand for professional audience",
    "cta": "Specific call to action"
  },
  "newsletter": {
    "subject": "Email subject line",
    "preview": "Preview text under 90 chars",
    "opening": "First 2 paragraphs — reframe the pillar idea with fresh depth",
    "timing": "Send 4-6 weeks after the original pillar piece"
  },
  "youtube": {
    "title": "Long-form YouTube video title",
    "concept": "How to expand this pillar into a full 10-20 min YouTube video",
    "outline": [
      "Section 1: hook and setup",
      "Section 2: main framework",
      "Section 3: examples and case studies",
      "Section 4: actionable takeaways",
      "Section 5: CTA and close"
    ]
  }
}

Pillar content to analyze:
${transcript.substring(0, 8000)}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { transcript, videoId } = await req.json();

    let content = transcript?.trim() || "";

    // If videoId provided and no transcript, try to fetch it
    if (!content && videoId) {
      const fetched = await fetchYouTubeTranscript(videoId);
      if (!fetched) {
        return new Response(
          JSON.stringify({ error: "Could not fetch transcript for this video. Please paste it manually." }),
          { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
      content = fetched;
    }

    if (!content || content.length < 50) {
      return new Response(
        JSON.stringify({ error: "Please provide a transcript or script to analyze." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Get Anthropic API key from Supabase secrets
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Call Claude
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 5000,
        messages: [{ role: "user", content: buildPrompt(content) }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.json();
      throw new Error(err.error?.message || `Claude API error ${claudeRes.status}`);
    }

    const claudeData = await claudeRes.json();
    const raw = claudeData.content[0].text
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(raw);

    return new Response(JSON.stringify({ waterfall: parsed, transcriptLength: content.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
