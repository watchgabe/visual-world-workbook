-- ============================================================================
-- DATA MIGRATION: vww_progress → blp_responses
-- ============================================================================
-- Run AFTER creating the blp_responses table (supabase/schema.sql).
-- Requires: auth.users populated with the same emails as vww_progress.
-- Safe to re-run: uses ON CONFLICT DO NOTHING (won't overwrite new data).
-- ============================================================================

-- Helper function: map old VW option labels to new value slugs
CREATE OR REPLACE FUNCTION _migrate_vw_opt(old_label text) RETURNS text AS $$
BEGIN
  RETURN CASE old_label
    -- Mood board lighting (mblight)
    WHEN 'Warm, golden natural' THEN 'warm-golden'
    WHEN 'Bright, even studio' THEN 'bright-studio'
    WHEN 'High contrast dramatic' THEN 'high-contrast'
    WHEN 'Soft, diffused' THEN 'soft-diffused'
    -- Mood board textures (mbtex)
    WHEN 'Natural (wood, plants, stone)' THEN 'natural'
    WHEN 'Modern (concrete, metal, glass)' THEN 'modern'
    WHEN 'Vintage (leather, aged wood)' THEN 'vintage'
    WHEN 'Mixed / eclectic' THEN 'mixed'
    -- Shot system: e1vibe
    WHEN 'Calm and minimal' THEN 'calm-minimal'
    WHEN 'Creative and eclectic' THEN 'creative-eclectic'
    WHEN 'Professional and polished' THEN 'professional-polished'
    WHEN 'Luxurious and elevated' THEN 'luxurious-elevated'
    WHEN 'Energetic and dynamic' THEN 'energetic-dynamic'
    WHEN 'Raw and authentic' THEN 'raw-authentic'
    -- Shot system: e2mood
    WHEN 'Warm and approachable' THEN 'warm-approachable'
    WHEN 'Cool and authoritative' THEN 'cool-authoritative'
    WHEN 'Energetic and motivating' THEN 'energetic-motivating'
    WHEN 'Calm and contemplative' THEN 'calm-contemplative'
    WHEN 'Bold and challenging' THEN 'bold-challenging'
    WHEN 'Authentic and raw' THEN 'authentic-raw'
    -- Shot system: e2light
    WHEN 'Warm golden natural light' THEN 'warm-golden'
    WHEN 'Bright even studio light' THEN 'bright-studio'
    -- (High contrast dramatic and Soft diffused light already mapped above)
    -- Shot system: e3grade
    WHEN 'Warm tones' THEN 'warm'
    WHEN 'Cool tones' THEN 'cool'
    WHEN 'Desaturated / film-like' THEN 'desaturated'
    -- (High contrast already mapped above)
    WHEN 'Natural / ungraded' THEN 'natural'
    WHEN 'Mixed by content type' THEN 'mixed'
    -- Shot system: e4tex
    WHEN 'Natural (wood, plants, fabric, stone)' THEN 'natural'
    WHEN 'Vintage (leather, aged wood, film grain)' THEN 'vintage'
    -- (Modern and Mixed already mapped above)
    ELSE old_label  -- pass through if no match
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function: map old BF pillar test labels to new slugs
CREATE OR REPLACE FUNCTION _migrate_pillar_test(old_label text) RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN old_label ILIKE 'Yes%' THEN 'yes'
    WHEN old_label ILIKE 'Maybe%' THEN 'maybe'
    ELSE old_label
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================================
-- 1. BRAND FOUNDATION
-- Old path: vww_progress.data->'cf'->>'{fieldId}'
-- Old options: vww_progress.data->'cf'->>'opt_{groupId}'
-- Old audit: vww_progress.data->'cf'->'auditVals'->>'{key}'
-- ============================================================================
INSERT INTO public.blp_responses (user_id, module_slug, responses)
SELECT
  au.id,
  'brand-foundation',
  jsonb_strip_nulls(
    -- Chunk 1: Brand Journey + Avatar 1 (23 pairs)
    jsonb_build_object(
      'bf_journey_outcome',   d->>'q1outcome',
      'bf_journey_why',       d->>'q1why',
      'bf_journey_known',     d->>'q2known',
      'bf_journey_do',        d->>'q3do',
      'bf_journey_learn',     d->>'q4learn',
      'bf_journey_statement', d->>'brandJourneyStmt',
      'bf_av1_age',        d->>'av1Age',
      'bf_av1_gender',     d->>'av1Gender',
      'bf_av1_occupation', d->>'av1Occupation',
      'bf_av1_income',     d->>'av1Income',
      'bf_av1_situation',  d->>'av1Situation',
      'bf_av1_who',        d->>'av1Who',
      'bf_av1_look',       d->>'av1Look',
      'bf_av1_story',      d->>'av1Story',
      'bf_av1_goals',      d->>'av1Goals',
      'bf_av1_passions',   d->>'av1Passions',
      'bf_av1_struggle',   d->>'av1Struggle',
      'bf_av1_tried',      d->>'av1Tried',
      'bf_av1_desired',    d->>'av1Desired',
      'bf_av1_fears',      d->>'av1Fears',
      'bf_av1_platforms',  d->>'av1Platforms',
      'bf_av1_connection', d->>'av1Connection',
      'bf_av1_statement',  d->>'av1Statement'
    )
    -- Chunk 2: Avatar 2 + Mission (27 pairs)
    || jsonb_build_object(
      'bf_av2_age',        d->>'av2Age',
      'bf_av2_gender',     d->>'av2Gender',
      'bf_av2_occupation', d->>'av2Occupation',
      'bf_av2_income',     d->>'av2Income',
      'bf_av2_situation',  d->>'av2Situation',
      'bf_av2_who',        d->>'av2Who',
      'bf_av2_look',       d->>'av2Look',
      'bf_av2_story',      d->>'av2Story',
      'bf_av2_goals',      d->>'av2Goals',
      'bf_av2_passions',   d->>'av2Passions',
      'bf_av2_struggle',   d->>'av2Struggle',
      'bf_av2_tried',      d->>'av2Tried',
      'bf_av2_desired',    d->>'av2Desired',
      'bf_av2_fears',      d->>'av2Fears',
      'bf_av2_platforms',  d->>'av2Platforms',
      'bf_av2_connection', d->>'av2Connection',
      'bf_av2_statement',  d->>'av2Statement',
      'bf_ikigai_love',     d->>'ikigaiLove',
      'bf_ikigai_good',     d->>'ikigaiGood',
      'bf_ikigai_world',    d->>'ikigaiWorld',
      'bf_ikigai_paid',     d->>'ikigaiPaid',
      'bf_ikigai_center',   d->>'ikigaiCenter',
      'bf_mission_avatar',  d->>'missionAvatar',
      'bf_mission_outcome', d->>'missionOutcome',
      'bf_mission_method',  d->>'missionMethod',
      'bf_mission_why',     d->>'missionWhy',
      'bf_core_mission',    d->>'coreMission'
    )
    -- Chunk 3: Values + Audit (24 pairs)
    || jsonb_build_object(
      'bf_val1_name',     d->>'val1name',
      'bf_val1_practice', d->>'val1practice',
      'bf_val2_name',     d->>'val2name',
      'bf_val2_practice', d->>'val2practice',
      'bf_val3_name',     d->>'val3name',
      'bf_val3_practice', d->>'val3practice',
      'bf_val4_name',     d->>'val4name',
      'bf_val4_practice', d->>'val4practice',
      'bf_val5_name',     d->>'val5name',
      'bf_val5_practice', d->>'val5practice',
      'bf_val6_name',     d->>'val6name',
      'bf_val6_practice', d->>'val6practice',
      'bf_audit_vc1', d->'auditVals'->>'vc1',
      'bf_audit_vc2', d->'auditVals'->>'vc2',
      'bf_audit_vc3', d->'auditVals'->>'vc3',
      'bf_audit_pc1', d->'auditVals'->>'pc1',
      'bf_audit_pc2', d->'auditVals'->>'pc2',
      'bf_audit_pc3', d->'auditVals'->>'pc3',
      'bf_audit_cq1', d->'auditVals'->>'cq1',
      'bf_audit_cq2', d->'auditVals'->>'cq2',
      'bf_audit_cq3', d->'auditVals'->>'cq3',
      'bf_audit_ts1', d->'auditVals'->>'ts1',
      'bf_audit_ts2', d->'auditVals'->>'ts2',
      'bf_audit_ts3', d->'auditVals'->>'ts3'
    )
    -- Chunk 4: Pillars (28 pairs)
    || jsonb_build_object(
      'bf_pillar_discover1', d->>'pillarDiscover1',
      'bf_pillar_discover2', d->>'pillarDiscover2',
      'bf_pillar_discover3', d->>'pillarDiscover3',
      'bf_pillar1_name',   d->>'pillar1name',
      'bf_pillar1_sub',    d->>'pillar1sub',
      'bf_pillar1_avatar', d->>'pillar1avatar',
      'bf_pillar1_offer',  d->>'pillar1offer',
      'bf_pillar1_test',   _migrate_pillar_test(d->>'opt_p1test'),
      'bf_pillar2_name',   d->>'pillar2name',
      'bf_pillar2_sub',    d->>'pillar2sub',
      'bf_pillar2_avatar', d->>'pillar2avatar',
      'bf_pillar2_offer',  d->>'pillar2offer',
      'bf_pillar2_test',   _migrate_pillar_test(d->>'opt_p2test'),
      'bf_pillar3_name',   d->>'pillar3name',
      'bf_pillar3_sub',    d->>'pillar3sub',
      'bf_pillar3_avatar', d->>'pillar3avatar',
      'bf_pillar3_offer',  d->>'pillar3offer',
      'bf_pillar3_test',   _migrate_pillar_test(d->>'opt_p3test'),
      'bf_pillar4_name',   d->>'pillar4name',
      'bf_pillar4_sub',    d->>'pillar4sub',
      'bf_pillar4_avatar', d->>'pillar4avatar',
      'bf_pillar4_offer',  d->>'pillar4offer',
      'bf_pillar4_test',   _migrate_pillar_test(d->>'opt_p4test'),
      'bf_pillar5_name',   d->>'pillar5name',
      'bf_pillar5_sub',    d->>'pillar5sub',
      'bf_pillar5_avatar', d->>'pillar5avatar',
      'bf_pillar5_offer',  d->>'pillar5offer',
      'bf_pillar5_test',   _migrate_pillar_test(d->>'opt_p5test')
    )
    -- Chunk 5: Origin Story + Brand Vision (10 pairs)
    || jsonb_build_object(
      'bf_story1',       d->>'story1',
      'bf_story2',       d->>'story2',
      'bf_story3',       d->>'story3',
      'bf_story4',       d->>'story4',
      'bf_origin_story', d->>'originStory',
      'bf_vision_3yr',    d->>'vision3yr',
      'bf_vision_day',    d->>'visionDay',
      'bf_vision_impact', d->>'visionImpact',
      'bf_vision_legacy', d->>'visionLegacy',
      'bf_brand_vision',  d->>'brandVision'
    )
  )
FROM vww_progress vp
CROSS JOIN LATERAL (SELECT vp.data->'cf' AS d) AS cf_data
JOIN auth.users au ON au.email = vp.email
WHERE vp.data->'cf' IS NOT NULL
  AND jsonb_typeof(vp.data->'cf') = 'object'
ON CONFLICT (user_id, module_slug) DO NOTHING;


-- ============================================================================
-- 2. VISUAL WORLD
-- Old path: vww_progress.data->'vw'->'inputs'->>'{fieldId}'
-- Old options: vww_progress.data->'vw'->'opts'->>'{groupId}'
-- ============================================================================
INSERT INTO public.blp_responses (user_id, module_slug, responses)
SELECT
  au.id,
  'visual-world',
  jsonb_strip_nulls(jsonb_build_object(
    -- Creator Analysis synthesis (s1)
    'vw_ca_patterns',   inp->>'synPatterns',
    'vw_ca_different',  inp->>'synDiff',
    'vw_ca_own',        inp->>'synOwn',
    'vw_ca_gap',        inp->>'gapStatement',
    -- Mood Board (s2)
    'vw_mb_link',     inp->>'mbLink',
    'vw_mb_colors',   inp->>'mbColors',
    'vw_mb_lighting', _migrate_vw_opt(opts->>'mblight'),
    'vw_mb_mood',     inp->>'mbMood',
    'vw_mb_textures', _migrate_vw_opt(opts->>'mbtex'),
    'vw_mb_movie',    inp->>'mbMovie',
    'vw_mb_time',     inp->>'mbTime',
    'vw_mb_place',    inp->>'mbPlace',
    -- Color Palette (s3)
    'vw_color_primary',   inp->>'col-primary',
    'vw_color_secondary', inp->>'col-secondary',
    'vw_color_accent',    inp->>'col-accent',
    'vw_color_neutral',   inp->>'col-neutral',
    'vw_color_name',      inp->>'paletteName',
    -- Typography (s4)
    'vw_typo_primary',       inp->>'font-primary',
    'vw_typo_body',          inp->>'font-secondary',
    'vw_typo_primary_italic', inp->>'font-primary-italic',
    'vw_typo_primary_bold',   inp->>'font-primary-bold',
    'vw_typo_body_italic',    inp->>'font-secondary-italic',
    'vw_typo_body_bold',      inp->>'font-secondary-bold',
    -- Shot System: Element 1 — Setting (s5)
    'vw_shot_e1_location',    inp->>'e1-location',
    'vw_shot_e1_vibe',        _migrate_vw_opt(opts->>'e1vibe'),
    'vw_shot_e1_communicate', inp->>'e1-communicate',
    'vw_shot_e1_statement',   inp->>'e1-statement',
    -- Shot System: Element 2 — Mood
    'vw_shot_e2_mood',      _migrate_vw_opt(opts->>'e2mood'),
    'vw_shot_e2_lighting',  _migrate_vw_opt(opts->>'e2light'),
    'vw_shot_e2_time',      inp->>'e2-time',
    'vw_shot_e2_statement', inp->>'e2-statement',
    -- Shot System: Element 3 — Color Language
    'vw_shot_e3_grade', _migrate_vw_opt(opts->>'e3grade'),
    'vw_shot_e3_ref',   inp->>'e3-ref',
    -- Shot System: Element 4 — Design Details
    'vw_shot_e4_objects',  inp->>'e4-objects',
    'vw_shot_e4_textures', _migrate_vw_opt(opts->>'e4tex'),
    'vw_shot_e4_wardrobe', inp->>'e4-wardrobe',
    'vw_shot_e4_never',    inp->>'e4-never'
  ))
FROM vww_progress vp
CROSS JOIN LATERAL (
  SELECT
    vp.data->'vw'->'inputs' AS inp,
    vp.data->'vw'->'opts'   AS opts
) AS vw_data
JOIN auth.users au ON au.email = vp.email
WHERE vp.data->'vw' IS NOT NULL
  AND jsonb_typeof(vp.data->'vw') = 'object'
ON CONFLICT (user_id, module_slug) DO NOTHING;


-- ============================================================================
-- 3. CONTENT
-- Old path: vww_progress.data->'cc'->'inputs'->>'{fieldId}'
-- Old options: vww_progress.data->'cc'->'opts'->>'{groupId}'
-- Note: options use value === label (no slug transformation needed)
-- ============================================================================
INSERT INTO public.blp_responses (user_id, module_slug, responses)
SELECT
  au.id,
  'content',
  jsonb_strip_nulls(
    -- Chunk 1: Strategy + Sustainability + Batching (22 pairs)
    jsonb_build_object(
      'ct_strategy_goal',        opts->>'goal',
      'ct_strategy_next_step',   inp->>'nextStep',
      'ct_strategy_pain_problem', inp->>'painProblem',
      'ct_strategy_unique_sol',  inp->>'uniqueSol',
      'ct_strategy_credibility', inp->>'credibility',
      'ct_sustain_week_hours', inp->>'weekHours',
      'ct_sustain_energize',   inp->>'energize',
      'ct_sustain_drain',      inp->>'drain',
      'ct_sustain_sharp',      opts->>'sharp',
      'ct_sustain_cadence',    inp->>'cadence',
      'ct_sustain_medium',     opts->>'medium',
      'ct_sustain_audience',   opts->>'audience',
      'ct_sustain_enjoy',      opts->>'enjoy',
      'ct_sustain_freq',       opts->>'freq',
      'ct_sustain_platgoal',   opts->>'platgoal',
      'ct_sustain_primary',    opts->>'primary',
      'ct_sustain_secondary',  opts->>'secondary',
      'ct_sustain_focus',      inp->>'sauron',
      'ct_batch_film_day', inp->>'filmDay',
      'ct_batch_count',    inp->>'batchCount',
      'ct_batch_setup',    inp->>'filmSetup',
      'ct_batch_commit',   inp->>'batchCommit'
    )
    -- Chunk 2: Offer Stack + Pillars + Ideas p1-p3 (24 pairs)
    || jsonb_build_object(
      'ct_tm_free',     inp->>'ofree',
      'ct_tm_lead',     inp->>'olead',
      'ct_tm_low',      inp->>'olow',
      'ct_tm_mid',      inp->>'omid',
      'ct_tm_high',     inp->>'ohigh',
      'ct_tm_conv',     inp->>'conv',
      'ct_tm_cta_strat', inp->>'ctastrat',
      'ct_ig_pillar1', inp->>'ig_pillar1',
      'ct_ig_pillar2', inp->>'ig_pillar2',
      'ct_ig_pillar3', inp->>'ig_pillar3',
      'ct_ig_pillar4', inp->>'ig_pillar4',
      'ct_ig_pillar5', inp->>'ig_pillar5',
      'ct_ig_p1i1', inp->>'ig_p1i1', 'ct_ig_p1i2', inp->>'ig_p1i2',
      'ct_ig_p1i3', inp->>'ig_p1i3', 'ct_ig_p1i4', inp->>'ig_p1i4',
      'ct_ig_p2i1', inp->>'ig_p2i1', 'ct_ig_p2i2', inp->>'ig_p2i2',
      'ct_ig_p2i3', inp->>'ig_p2i3', 'ct_ig_p2i4', inp->>'ig_p2i4',
      'ct_ig_p3i1', inp->>'ig_p3i1', 'ct_ig_p3i2', inp->>'ig_p3i2',
      'ct_ig_p3i3', inp->>'ig_p3i3', 'ct_ig_p3i4', inp->>'ig_p3i4'
    )
    -- Chunk 3: Ideas p4-p5 + Storytelling + Blueprint (21 pairs)
    || jsonb_build_object(
      'ct_ig_p4i1', inp->>'ig_p4i1', 'ct_ig_p4i2', inp->>'ig_p4i2',
      'ct_ig_p4i3', inp->>'ig_p4i3', 'ct_ig_p4i4', inp->>'ig_p4i4',
      'ct_ig_p5i1', inp->>'ig_p5i1', 'ct_ig_p5i2', inp->>'ig_p5i2',
      'ct_ig_p5i3', inp->>'ig_p5i3', 'ct_ig_p5i4', inp->>'ig_p5i4',
      'ct_story_idea',    inp->>'storyI',
      'ct_story_hook',    inp->>'storyH1',
      'ct_story_prob',    inp->>'storyP',
      'ct_story_journey', inp->>'storyJ',
      'ct_story_lesson',  inp->>'storyL',
      'ct_story_cta',     inp->>'storyC',
      'ct_bp_color1',    inp->>'mbColor1',
      'ct_bp_color2',    inp->>'mbColor2',
      'ct_bp_color3',    inp->>'mbColor3',
      'ct_bp_mood_vibe', opts->>'mbvibe',
      'ct_bp_narrative', inp->>'mbNarrative',
      'ct_bp_objects',   inp->>'mbObjects',
      'ct_bp_references', inp->>'mbRef'
    )
    -- Idea Generation: 80 angle fields (added separately to stay under jsonb_build_object limit)
    || jsonb_build_object(
      'ct_ig_p1i1a1', inp->>'ig_p1i1a1', 'ct_ig_p1i1a2', inp->>'ig_p1i1a2',
      'ct_ig_p1i1a3', inp->>'ig_p1i1a3', 'ct_ig_p1i1a4', inp->>'ig_p1i1a4',
      'ct_ig_p1i2a1', inp->>'ig_p1i2a1', 'ct_ig_p1i2a2', inp->>'ig_p1i2a2',
      'ct_ig_p1i2a3', inp->>'ig_p1i2a3', 'ct_ig_p1i2a4', inp->>'ig_p1i2a4',
      'ct_ig_p1i3a1', inp->>'ig_p1i3a1', 'ct_ig_p1i3a2', inp->>'ig_p1i3a2',
      'ct_ig_p1i3a3', inp->>'ig_p1i3a3', 'ct_ig_p1i3a4', inp->>'ig_p1i3a4',
      'ct_ig_p1i4a1', inp->>'ig_p1i4a1', 'ct_ig_p1i4a2', inp->>'ig_p1i4a2',
      'ct_ig_p1i4a3', inp->>'ig_p1i4a3', 'ct_ig_p1i4a4', inp->>'ig_p1i4a4',
      'ct_ig_p2i1a1', inp->>'ig_p2i1a1', 'ct_ig_p2i1a2', inp->>'ig_p2i1a2',
      'ct_ig_p2i1a3', inp->>'ig_p2i1a3', 'ct_ig_p2i1a4', inp->>'ig_p2i1a4',
      'ct_ig_p2i2a1', inp->>'ig_p2i2a1', 'ct_ig_p2i2a2', inp->>'ig_p2i2a2',
      'ct_ig_p2i2a3', inp->>'ig_p2i2a3', 'ct_ig_p2i2a4', inp->>'ig_p2i2a4',
      'ct_ig_p2i3a1', inp->>'ig_p2i3a1', 'ct_ig_p2i3a2', inp->>'ig_p2i3a2',
      'ct_ig_p2i3a3', inp->>'ig_p2i3a3', 'ct_ig_p2i3a4', inp->>'ig_p2i3a4',
      'ct_ig_p2i4a1', inp->>'ig_p2i4a1', 'ct_ig_p2i4a2', inp->>'ig_p2i4a2',
      'ct_ig_p2i4a3', inp->>'ig_p2i4a3', 'ct_ig_p2i4a4', inp->>'ig_p2i4a4'
    )
    || jsonb_build_object(
      'ct_ig_p3i1a1', inp->>'ig_p3i1a1', 'ct_ig_p3i1a2', inp->>'ig_p3i1a2',
      'ct_ig_p3i1a3', inp->>'ig_p3i1a3', 'ct_ig_p3i1a4', inp->>'ig_p3i1a4',
      'ct_ig_p3i2a1', inp->>'ig_p3i2a1', 'ct_ig_p3i2a2', inp->>'ig_p3i2a2',
      'ct_ig_p3i2a3', inp->>'ig_p3i2a3', 'ct_ig_p3i2a4', inp->>'ig_p3i2a4',
      'ct_ig_p3i3a1', inp->>'ig_p3i3a1', 'ct_ig_p3i3a2', inp->>'ig_p3i3a2',
      'ct_ig_p3i3a3', inp->>'ig_p3i3a3', 'ct_ig_p3i3a4', inp->>'ig_p3i3a4',
      'ct_ig_p3i4a1', inp->>'ig_p3i4a1', 'ct_ig_p3i4a2', inp->>'ig_p3i4a2',
      'ct_ig_p3i4a3', inp->>'ig_p3i4a3', 'ct_ig_p3i4a4', inp->>'ig_p3i4a4',
      'ct_ig_p4i1a1', inp->>'ig_p4i1a1', 'ct_ig_p4i1a2', inp->>'ig_p4i1a2',
      'ct_ig_p4i1a3', inp->>'ig_p4i1a3', 'ct_ig_p4i1a4', inp->>'ig_p4i1a4',
      'ct_ig_p4i2a1', inp->>'ig_p4i2a1', 'ct_ig_p4i2a2', inp->>'ig_p4i2a2',
      'ct_ig_p4i2a3', inp->>'ig_p4i2a3', 'ct_ig_p4i2a4', inp->>'ig_p4i2a4',
      'ct_ig_p4i3a1', inp->>'ig_p4i3a1', 'ct_ig_p4i3a2', inp->>'ig_p4i3a2',
      'ct_ig_p4i3a3', inp->>'ig_p4i3a3', 'ct_ig_p4i3a4', inp->>'ig_p4i3a4',
      'ct_ig_p4i4a1', inp->>'ig_p4i4a1', 'ct_ig_p4i4a2', inp->>'ig_p4i4a2',
      'ct_ig_p4i4a3', inp->>'ig_p4i4a3', 'ct_ig_p4i4a4', inp->>'ig_p4i4a4'
    )
    || jsonb_build_object(
      'ct_ig_p5i1a1', inp->>'ig_p5i1a1', 'ct_ig_p5i1a2', inp->>'ig_p5i1a2',
      'ct_ig_p5i1a3', inp->>'ig_p5i1a3', 'ct_ig_p5i1a4', inp->>'ig_p5i1a4',
      'ct_ig_p5i2a1', inp->>'ig_p5i2a1', 'ct_ig_p5i2a2', inp->>'ig_p5i2a2',
      'ct_ig_p5i2a3', inp->>'ig_p5i2a3', 'ct_ig_p5i2a4', inp->>'ig_p5i2a4',
      'ct_ig_p5i3a1', inp->>'ig_p5i3a1', 'ct_ig_p5i3a2', inp->>'ig_p5i3a2',
      'ct_ig_p5i3a3', inp->>'ig_p5i3a3', 'ct_ig_p5i3a4', inp->>'ig_p5i3a4',
      'ct_ig_p5i4a1', inp->>'ig_p5i4a1', 'ct_ig_p5i4a2', inp->>'ig_p5i4a2',
      'ct_ig_p5i4a3', inp->>'ig_p5i4a3', 'ct_ig_p5i4a4', inp->>'ig_p5i4a4',
      -- Creator Analysis from Blueprint (s9)
      'ct_bp_creator1_name',       inp->>'ca1name',
      'ct_bp_creator1_why',        inp->>'ca1why',
      'ct_bp_creator1_takeaway',   inp->>'ca1take',
      'ct_bp_creator1_difference', inp->>'ca1diff',
      'ct_bp_creator2_name',       inp->>'ca2name',
      'ct_bp_creator2_why',        inp->>'ca2why',
      'ct_bp_creator2_takeaway',   inp->>'ca2take',
      'ct_bp_creator2_difference', inp->>'ca2diff',
      'ct_bp_creator3_name',       inp->>'ca3name',
      'ct_bp_creator3_why',        inp->>'ca3why',
      'ct_bp_creator3_takeaway',   inp->>'ca3take',
      'ct_bp_creator3_difference', inp->>'ca3diff'
    )
  )
FROM vww_progress vp
CROSS JOIN LATERAL (
  SELECT
    vp.data->'cc'->'inputs' AS inp,
    vp.data->'cc'->'opts'   AS opts
) AS cc_data
JOIN auth.users au ON au.email = vp.email
WHERE vp.data->'cc' IS NOT NULL
  AND jsonb_typeof(vp.data->'cc') = 'object'
ON CONFLICT (user_id, module_slug) DO NOTHING;


-- ============================================================================
-- 4. LAUNCH
-- Old path: vww_progress.data->'launch-v1'->>'{fieldId}'
-- Old options: vww_progress.data->'launch-v1'->>'opt_{groupId}'
-- Note: options use value === label (no slug transformation needed)
-- Note: days 5-7 use 'cal5topic' not 'cal5type' in old data
-- ============================================================================
INSERT INTO public.blp_responses (user_id, module_slug, responses)
SELECT
  au.id,
  'launch',
  jsonb_strip_nulls(
    -- Chunk 1: Funnel + Lead Magnet + Bio (31 pairs)
    jsonb_build_object(
      'la_funnel_platforms',       d->>'funnelPlatforms',
      'la_funnel_lead_magnet',     d->>'funnelLeadMagnet',
      'la_funnel_email_platform',  d->>'funnelEmailPlatform',
      'la_funnel_newsletter_freq', d->>'funnelNewsletterFreq',
      'la_funnel_cta',             d->>'funnelCTA',
      'la_funnel_offer',           d->>'funnelOffer',
      'la_funnel_price',           d->>'funnelPrice',
      'la_funnel_conversion',      d->>'funnelConversion',
      'la_funnel_has_lm',          d->>'opt_hasLm',
      'la_funnel_has_email',       d->>'opt_hasEmail',
      'la_funnel_has_offer',       d->>'opt_hasOffer',
      'la_funnel_broken',          d->>'funnelBroken',
      'la_lm_name',         d->>'lmName',
      'la_lm_topic',        d->>'lmTopic',
      'la_lm_offer_bridge', d->>'lmOfferBridge',
      'la_lm_format',       d->>'opt_lmFormat',
      'la_lm_big_win',      d->>'lmBigWin',
      'la_lm_outline',      d->>'lmOutline',
      'la_lm_cta',          d->>'lmCTA',
      'la_lm_tool',         d->>'opt_lmTool',
      'la_lm_delivery',     d->>'opt_lmDelivery',
      'la_bio_link',           d->>'igLink',
      'la_bio_username',       d->>'bioUsername',
      'la_bio_ig_name',        d->>'igName',
      'la_bio_pfp_visibility', d->>'opt_pfpVisibility',
      'la_bio_pfp_bg',         d->>'opt_pfpBg',
      'la_bio_pfp_notes',      d->>'pfpNotes',
      'la_bio_line1',          d->>'bioLine1',
      'la_bio_line2',          d->>'bioLine2',
      'la_bio_line3',          d->>'bioLine3',
      'la_bio_line4',          d->>'bioLine4'
    )
    -- Chunk 2: Launch Content (31 pairs)
    || jsonb_build_object(
      'la_lc_story_why',       d->>'story1why',
      'la_lc_story_challenge', d->>'story1challenge',
      'la_lc_story_turning',   d->>'story1turning',
      'la_lc_story_learned',   d->>'story1learned',
      'la_lc_story_hook',      d->>'story1hook',
      'la_lc_story_examples',  d->>'story1examples',
      'la_lc_story_cta',       d->>'story1cta',
      'la_lc_pos_belief',      d->>'pos1belief',
      'la_lc_pos_claim',       d->>'pos1claim',
      'la_lc_pos_b1',          d->>'pos1b1',
      'la_lc_pos_b2',          d->>'pos1b2',
      'la_lc_pos_b3',          d->>'pos1b3',
      'la_lc_pos_b4',          d->>'pos1b4',
      'la_lc_pos_b5',          d->>'pos1b5',
      'la_lc_pos_stop',        d->>'pos1stop',
      'la_lc_pos_oldbelief',   d->>'pos1oldbelief',
      'la_lc_pos_start',       d->>'pos1start',
      'la_lc_pos_newbelief',   d->>'pos1newbelief',
      'la_lc_pos_anchor',      d->>'pos1anchor',
      'la_lc_mc_subject',      d->>'mc1subject',
      'la_lc_mc_audience',     d->>'mc1audience',
      'la_lc_mc_authority',    d->>'mc1authority',
      'la_lc_mc_s1',           d->>'mc1s1',
      'la_lc_mc_s2',           d->>'mc1s2',
      'la_lc_mc_s3',           d->>'mc1s3',
      'la_lc_mc_s4',           d->>'mc1s4',
      'la_lc_mc_s5',           d->>'mc1s5',
      'la_lc_mc_s6',           d->>'mc1s6',
      'la_lc_mc_s7',           d->>'mc1s7',
      'la_lc_mc_hook',         d->>'mc1hook',
      'la_lc_mc_waterfall',    d->>'mc1waterfall'
    )
  -- Calendar days (split into separate jsonb_build_object to stay under arg limit)
  || jsonb_build_object(
    -- Calendar days 1-4 (type field)
    'la_cal1_platform', d->>'cal1platform',
    'la_cal1_type',     d->>'cal1type',
    'la_cal1_hook',     d->>'cal1hook',
    'la_cal1_date',     d->>'cal1date',
    'la_cal1_done',     d->>'opt_cal1done',
    'la_cal2_platform', d->>'cal2platform',
    'la_cal2_type',     d->>'cal2type',
    'la_cal2_hook',     d->>'cal2hook',
    'la_cal2_date',     d->>'cal2date',
    'la_cal2_done',     d->>'opt_cal2done',
    'la_cal3_platform', d->>'cal3platform',
    'la_cal3_type',     d->>'cal3type',
    'la_cal3_hook',     d->>'cal3hook',
    'la_cal3_date',     d->>'cal3date',
    'la_cal3_done',     d->>'opt_cal3done',
    'la_cal4_platform', d->>'cal4platform',
    'la_cal4_type',     d->>'cal4type',
    'la_cal4_hook',     d->>'cal4hook',
    'la_cal4_date',     d->>'cal4date',
    'la_cal4_done',     d->>'opt_cal4done',
    -- Calendar days 5-7 (old uses 'topic' not 'type')
    'la_cal5_platform', d->>'cal5platform',
    'la_cal5_type',     d->>'cal5topic',
    'la_cal5_hook',     d->>'cal5hook',
    'la_cal5_date',     d->>'cal5date',
    'la_cal5_done',     d->>'opt_cal5done',
    'la_cal6_platform', d->>'cal6platform',
    'la_cal6_type',     d->>'cal6topic',
    'la_cal6_hook',     d->>'cal6hook',
    'la_cal6_date',     d->>'cal6date',
    'la_cal6_done',     d->>'opt_cal6done',
    'la_cal7_platform', d->>'cal7platform',
    'la_cal7_type',     d->>'cal7topic',
    'la_cal7_hook',     d->>'cal7hook',
    'la_cal7_date',     d->>'cal7date',
    'la_cal7_done',     d->>'opt_cal7done'
  )
  || jsonb_build_object(
    -- 90-Day Goals (s6)
    'la_goal_content_freq',      d->>'goal90ContentFreq',
    'la_goal_content_platforms', d->>'goal90ContentPlatforms',
    'la_goal_content',           d->>'goal90Content',
    'la_goal_followers',         d->>'goal90Followers',
    'la_goal_email',             d->>'goal90Email',
    'la_goal_audience',          d->>'goal90Audience',
    'la_goal_offer',             d->>'goal90Offer',
    'la_goal_sales',             d->>'goal90Sales',
    'la_goal_revenue',           d->>'goal90Revenue',
    'la_goal_system_priority',   d->>'goal90SystemPriority',
    'la_goal_system',            d->>'goal90System',
    'la_goal_review_date',       d->>'reviewDate',
    'la_goal_accountability',    d->>'accountabilityPartner'
  ))
FROM vww_progress vp
CROSS JOIN LATERAL (SELECT vp.data->'launch-v1' AS d) AS la_data
JOIN auth.users au ON au.email = vp.email
WHERE vp.data->'launch-v1' IS NOT NULL
  AND jsonb_typeof(vp.data->'launch-v1') = 'object'
ON CONFLICT (user_id, module_slug) DO NOTHING;


-- ============================================================================
-- CLEANUP: Drop helper functions
-- ============================================================================
DROP FUNCTION IF EXISTS _migrate_vw_opt(text);
DROP FUNCTION IF EXISTS _migrate_pillar_test(text);


-- ============================================================================
-- VERIFICATION: Check migration results
-- ============================================================================
SELECT
  module_slug,
  count(*) AS rows_migrated,
  avg(jsonb_object_keys_count) AS avg_fields_per_row
FROM (
  SELECT
    module_slug,
    (SELECT count(*) FROM jsonb_object_keys(responses)) AS jsonb_object_keys_count
  FROM public.blp_responses
) sub
GROUP BY module_slug
ORDER BY module_slug;
