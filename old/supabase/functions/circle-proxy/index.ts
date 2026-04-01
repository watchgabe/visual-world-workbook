// circle-proxy — Supabase Edge Function
// Proxies Circle API calls server-side (bypasses CORS for browser clients)
// Also handles module completion → updates Circle member profile fields

const CIRCLE_API = 'https://app.circle.so/api/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, email, community_id, module_key } = body;

    const circleKey = Deno.env.get('CIRCLE_API_KEY');
    const communityId = community_id || Deno.env.get('CIRCLE_COMMUNITY_ID') || '301190';

    if (!circleKey) {
      return json({ error: 'CIRCLE_API_KEY not set in Supabase secrets' }, 500);
    }

    if (!email) {
      return json({ error: 'email is required' }, 400);
    }

    // ── Action: get_member ─────────────────────────────────────────
    // Looks up a Circle member by email. Used by admin panel.
    if (action === 'get_member') {
      const resp = await fetch(
        `${CIRCLE_API}/community_members?email=${encodeURIComponent(email)}&community_id=${communityId}`,
        { headers: { 'Authorization': `Token ${circleKey}`, 'Content-Type': 'application/json' } }
      );

      if (!resp.ok) {
        const err = await resp.text();
        return json({ error: `Circle API error ${resp.status}`, detail: err }, resp.status);
      }

      const data = await resp.json();
      const member = Array.isArray(data) ? (data[0] || null) : (data?.id ? data : null);
      return json({ member });
    }

    // ── Action: module_complete ────────────────────────────────────
    // Called when a workbook module is completed. Updates Circle member headline.
    if (action === 'module_complete') {
      if (!module_key) return json({ error: 'module_key is required' }, 400);

      // 1. Find the member
      const findResp = await fetch(
        `${CIRCLE_API}/community_members?email=${encodeURIComponent(email)}&community_id=${communityId}`,
        { headers: { 'Authorization': `Token ${circleKey}`, 'Content-Type': 'application/json' } }
      );
      const findData = await findResp.json();
      const member = Array.isArray(findData) ? (findData[0] || null) : (findData?.id ? findData : null);

      if (!member) {
        return json({ error: 'member not found in Circle' }, 404);
      }

      // 2. Build updated headline showing completed modules
      // We track completion in the member's headline as emoji badges
      const moduleLabels: Record<string, string> = {
        'cf': 'Foundation',
        'vw': 'Visuals',
        'cc': 'Content',
        'launch-v1': 'Launch',
      };

      const label = moduleLabels[module_key] || module_key;

      // Read existing headline, append if not already there
      const currentHeadline: string = member.headline || '';
      const badge = `✅ ${label}`;
      const newHeadline = currentHeadline.includes(badge)
        ? currentHeadline
        : [currentHeadline, badge].filter(Boolean).join(' · ');

      // 3. Update member
      const patchResp = await fetch(
        `${CIRCLE_API}/community_members/${member.id}?community_id=${communityId}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Token ${circleKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ community_member: { headline: newHeadline } }),
        }
      );

      if (!patchResp.ok) {
        const err = await patchResp.text();
        return json({ error: `Circle update failed ${patchResp.status}`, detail: err }, patchResp.status);
      }

      return json({ success: true, member_id: member.id, headline: newHeadline });
    }

    return json({ error: `Unknown action: ${action}` }, 400);

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
