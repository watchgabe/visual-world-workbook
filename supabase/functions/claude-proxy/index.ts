import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { prompt, messages, maxTokens } = await req.json();

    // Accept either a plain text prompt or a full messages array (for vision/image calls)
    let messagePayload: any[];
    if (messages && Array.isArray(messages)) {
      messagePayload = messages;
    } else if (prompt && typeof prompt === "string" && prompt.trim().length >= 5) {
      messagePayload = [{ role: "user", content: prompt }];
    } else {
      return new Response(
        JSON.stringify({ error: "A prompt or messages array is required." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: maxTokens || 1000,
        messages: messagePayload,
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.json();
      throw new Error(err.error?.message || `Claude API error ${claudeRes.status}`);
    }

    const data = await claudeRes.json();
    const text = data.content.map((b: any) => b.text || "").join("");

    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
