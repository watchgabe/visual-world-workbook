import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { intent?: Record<string, string> }
  try {
    body = await request.json() as { intent?: Record<string, string> }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const intent = body.intent || {}

  const systemPrompt = `You are a visual brand strategist for content creators. Your job is to take a creator's brief and generate exactly 3 distinct brand directions.

Each direction must be meaningfully different — not subtle variations, but genuinely different aesthetic schools. For example: one editorial/minimal, one cinematic/warm, one bold/maximalist.

You MUST respond with ONLY valid JSON. No markdown. No explanation. No code blocks. Just raw JSON.

The JSON must match this exact schema:
{
  "directions": [
    {
      "id": "direction-1",
      "name": "Direction Name (2-3 words max)",
      "tagline": "A one-sentence description of this aesthetic direction",
      "personality": "2-3 sentences describing the personality and tone this direction embodies",
      "headlineFont": "A real, specific Google Font name appropriate for this direction",
      "bodyFont": "A real, specific Google Font name appropriate for this direction — different from headline",
      "palette": [
        { "hex": "#000000", "role": "Background", "name": "Midnight" },
        { "hex": "#ffffff", "role": "Primary text", "name": "White" },
        { "hex": "#ee663e", "role": "Accent", "name": "Ember" },
        { "hex": "#b0a090", "role": "Secondary text", "name": "Warm Gray" }
      ],
      "treatment": "Name of the image treatment (e.g. 'Warm Film', 'High Contrast', 'Muted Editorial')",
      "treatmentDetails": "Specific instructions: warm shadows, crushed blacks, desaturated highlights, slight grain, golden temperature shift. 2-3 sentences.",
      "layoutLanguage": "Describe spacing, composition rules, grid density, caption placement, alignment tendencies. 2-3 sentences.",
      "bestFor": "When is this direction the right choice? What creator type, what content style, what platform does it suit best?"
    }
  ]
}

Font rules:
- Use REAL Google Fonts that actually exist (e.g. Playfair Display, DM Sans, Space Grotesk, Fraunces, Syne, Outfit, Libre Baskerville, Cormorant Garamond, Bebas Neue, etc.)
- Headline and body fonts must be DIFFERENT fonts
- Match fonts to the aesthetic direction — don't use Bebas Neue for an editorial minimal direction

Color rules:
- Provide exactly 4 colors per palette
- Colors must work together as a real brand palette
- Hex codes must be valid 6-character hex values
- Roles should be: Background, Primary text, Accent, Secondary text

Directional spread rules:
- Direction 1: More minimal, editorial, or type-forward
- Direction 2: More warm, cinematic, or personal  
- Direction 3: More bold, high-contrast, or expressive`

  const userPrompt = `Creator Brief:
- What they create: ${intent.bb_creator_type || 'Not specified'}
- Primary platform: ${intent.bb_primary_platform || 'Not specified'}
- How the brand should feel (to them): ${intent.bb_brand_feel || 'Not specified'}
- How the audience should feel: ${intent.bb_audience_feel || 'Not specified'}
- Visual keywords: ${intent.bb_visual_keywords || 'Not specified'}
- Inspiration notes: ${intent.bb_inspo_notes || 'Not specified'}

Generate 3 distinct brand directions based on this brief. Respond with only the JSON object.`

  try {
    // Use the existing Claude proxy
    const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`
    const edgeRes = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!edgeRes.ok) {
      const errText = await edgeRes.text()
      console.error('Claude proxy error:', errText)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
    }

    const claudeData = await edgeRes.json() as {
      content?: { type: string; text: string }[]
      error?: string
    }

    if (claudeData.error) {
      return NextResponse.json({ error: claudeData.error }, { status: 502 })
    }

    const rawText = claudeData.content?.[0]?.text ?? ''

    // Parse the JSON response
    let parsed: { directions: unknown[] }
    try {
      // Strip any accidental markdown fences
      const clean = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      parsed = JSON.parse(clean) as { directions: unknown[] }
    } catch {
      console.error('JSON parse error. Raw:', rawText.slice(0, 500))
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    if (!Array.isArray(parsed.directions) || parsed.directions.length === 0) {
      return NextResponse.json({ error: 'Invalid AI response structure' }, { status: 500 })
    }

    return NextResponse.json({ directions: parsed.directions })
  } catch (err) {
    console.error('Brand builder API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
