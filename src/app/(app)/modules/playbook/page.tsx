'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
type ResponsesByModule = Record<string, Record<string, unknown>>

// Human-readable labels for all field keys — derived from MODULE_SECTIONS field key conventions
const FIELD_LABELS: Record<string, string> = {
  // Brand Foundation — Brand Journey
  bf_journey_outcome:   'Desired Outcome',
  bf_journey_why:       'Why This Matters',
  bf_journey_known:     'Known For',
  bf_journey_do:        'Actions',
  bf_journey_learn:     'Learning Priority',
  bf_journey_statement: 'Brand Journey Statement',
  // Brand Foundation — Avatar 1
  bf_av1_age:        'Age',
  bf_av1_gender:     'Gender',
  bf_av1_occupation: 'Occupation',
  bf_av1_income:     'Income',
  bf_av1_situation:  'Situation',
  bf_av1_who:        'Who They Are',
  bf_av1_look:       'How They Look',
  bf_av1_story:      'Their Story',
  bf_av1_goals:      'Goals',
  bf_av1_passions:   'Passions',
  bf_av1_struggle:   'Struggle',
  bf_av1_tried:      'What They\'ve Tried',
  bf_av1_desired:    'Desired Outcome',
  bf_av1_fears:      'Fears',
  bf_av1_platforms:  'Where They Hang Out',
  bf_av1_connection: 'How You Connect',
  bf_av1_statement:  'Avatar Statement',
  // Brand Foundation — Avatar 2
  bf_av2_age:        'Age',
  bf_av2_gender:     'Gender',
  bf_av2_occupation: 'Occupation',
  bf_av2_income:     'Income',
  bf_av2_situation:  'Situation',
  bf_av2_who:        'Who They Are',
  bf_av2_look:       'How They Look',
  bf_av2_story:      'Their Story',
  bf_av2_goals:      'Goals',
  bf_av2_passions:   'Passions',
  bf_av2_struggle:   'Struggle',
  bf_av2_tried:      'What They\'ve Tried',
  bf_av2_desired:    'Desired Outcome',
  bf_av2_fears:      'Fears',
  bf_av2_platforms:  'Where They Hang Out',
  bf_av2_connection: 'How You Connect',
  bf_av2_statement:  'Avatar 2 Statement',
  // Brand Foundation — Core Mission
  bf_ikigai_love:    'What You Love',
  bf_ikigai_good:    'What You\'re Good At',
  bf_ikigai_world:   'What the World Needs',
  bf_ikigai_paid:    'What You Can Be Paid For',
  bf_ikigai_center:  'Ikigai Center',
  bf_mission_avatar: 'I Help (Avatar)',
  bf_mission_outcome:'Achieve (Outcome)',
  bf_mission_method: 'Through (Method)',
  bf_mission_why:    'So They Can (Why)',
  bf_core_mission:   'Core Mission',
  // Brand Foundation — Core Values
  bf_val1_name:     'Value 1',
  bf_val1_practice: 'Practice',
  bf_val2_name:     'Value 2',
  bf_val2_practice: 'Practice',
  bf_val3_name:     'Value 3',
  bf_val3_practice: 'Practice',
  bf_val4_name:     'Value 4',
  bf_val4_practice: 'Practice',
  bf_val5_name:     'Value 5',
  bf_val5_practice: 'Practice',
  bf_val6_name:     'Value 6',
  bf_val6_practice: 'Practice',
  // Brand Foundation — Content Pillars
  bf_pillar_discover1: 'Discovery Topic 1',
  bf_pillar_discover2: 'Discovery Topic 2',
  bf_pillar_discover3: 'Discovery Topic 3',
  bf_pillar1_name:  'Pillar 1',
  bf_pillar1_sub:   'Subtopics',
  bf_pillar1_avatar:'Target Avatar',
  bf_pillar1_offer: 'Offer Connection',
  bf_pillar1_test:  'Test Idea',
  bf_pillar2_name:  'Pillar 2',
  bf_pillar2_sub:   'Subtopics',
  bf_pillar2_avatar:'Target Avatar',
  bf_pillar2_offer: 'Offer Connection',
  bf_pillar2_test:  'Test Idea',
  bf_pillar3_name:  'Pillar 3',
  bf_pillar3_sub:   'Subtopics',
  bf_pillar3_avatar:'Target Avatar',
  bf_pillar3_offer: 'Offer Connection',
  bf_pillar3_test:  'Test Idea',
  bf_pillar4_name:  'Pillar 4',
  bf_pillar4_sub:   'Subtopics',
  bf_pillar4_avatar:'Target Avatar',
  bf_pillar4_offer: 'Offer Connection',
  bf_pillar4_test:  'Test Idea',
  bf_pillar5_name:  'Pillar 5',
  bf_pillar5_sub:   'Subtopics',
  bf_pillar5_avatar:'Target Avatar',
  bf_pillar5_offer: 'Offer Connection',
  bf_pillar5_test:  'Test Idea',
  // Brand Foundation — Origin Story
  bf_story1:       'Chapter 1 — Before',
  bf_story2:       'Chapter 2 — The Turning Point',
  bf_story3:       'Chapter 3 — The Transformation',
  bf_story4:       'Chapter 4 — The New Life',
  bf_origin_story: 'Origin Story',
  // Brand Foundation — Brand Vision
  bf_vision_3yr:    '3-Year Vision',
  bf_vision_day:    'A Day in Your Life',
  bf_vision_impact: 'Impact',
  bf_vision_legacy: 'Legacy',
  bf_brand_vision:  'Brand Vision',
  // Visual World — Creator Analysis
  vw_ca_patterns:  'Patterns You Notice',
  vw_ca_different: 'What Makes You Different',
  vw_ca_own:       'What You Own',
  vw_ca_gap:       'The Gap',
  // Visual World — Color Palette (Mood Board)
  vw_mb_link:     'Mood Board Link',
  vw_mb_colors:   'Color Vibes',
  vw_mb_lighting: 'Lighting',
  vw_mb_mood:     'Mood',
  vw_mb_textures: 'Textures',
  vw_mb_movie:    'Movie Inspiration',
  vw_mb_time:     'Time of Day',
  vw_mb_place:    'Place',
  // Visual World — Color Palette (actual colors)
  vw_color_primary:   'Primary Color',
  vw_color_secondary: 'Secondary Color',
  vw_color_accent:    'Accent Color',
  vw_color_neutral:   'Neutral Color',
  vw_color_name:      'Palette Name',
  // Visual World — Typography
  vw_typo_primary: 'Primary Font',
  vw_typo_body:    'Body Font',
  // Visual World — Shot System
  vw_shot_e1_location:    'Setting Location',
  vw_shot_e1_vibe:        'Environment Vibe',
  vw_shot_e1_communicate: 'What It Communicates',
  vw_shot_e1_statement:   'Setting Statement',
  vw_shot_e2_mood:        'Primary Mood',
  vw_shot_e2_lighting:    'Lighting Style',
  vw_shot_e2_time:        'Time of Day',
  vw_shot_e2_statement:   'Mood Statement',
  vw_shot_e3_grade:       'Color Grade',
  vw_shot_e3_ref:         'Color Reference',
  vw_shot_e4_objects:     'Signature Objects',
  vw_shot_e4_textures:    'Textures',
  vw_shot_e4_wardrobe:    'Wardrobe',
  vw_shot_e4_never:       'Never On Camera',
  // Content — Content Strategy
  ct_strategy_goal:         'Strategy Goal',
  ct_strategy_next_step:    'Next Step',
  ct_strategy_pain_problem: 'Painful Problem',
  ct_strategy_unique_sol:   'Unique Solution',
  ct_strategy_credibility:  'Contextual Credibility',
  // Content — Sustainability
  ct_sustain_week_hours: 'Weekly Hours Available',
  ct_sustain_energize:   'What Energizes You',
  ct_sustain_drain:      'What Drains You',
  ct_sustain_sharp:      'When You\'re Sharpest',
  ct_sustain_cadence:    'Content Cadence',
  ct_sustain_medium:     'Preferred Medium',
  ct_sustain_audience:   'Audience Platform',
  ct_sustain_enjoy:      'Platforms You Enjoy',
  ct_sustain_freq:       'Posting Frequency',
  ct_sustain_platgoal:   'Platform Goal',
  ct_sustain_primary:    'Primary Platform',
  ct_sustain_secondary:  'Secondary Platform',
  ct_sustain_focus:      'Content Focus',
  ct_batch_film_day:     'Film Day',
  ct_batch_count:        'Batch Count',
  ct_batch_setup:        'Setup Notes',
  ct_batch_commit:       'Commitment',
  // Content — Trust & Money
  ct_tm_free:      'Free Content Offer',
  ct_tm_lead:      'Lead Magnet',
  ct_tm_low:       'Low-Ticket Offer',
  ct_tm_mid:       'Mid-Ticket Offer',
  ct_tm_high:      'High-Ticket Offer',
  ct_tm_conv:      'Conversion Strategy',
  ct_tm_cta_strat: 'CTA Strategy',
  // Content — Idea Generation fields (abbreviated)
  ct_ig_pillar1: 'Content Pillar 1',
  ct_ig_pillar2: 'Content Pillar 2',
  ct_ig_pillar3: 'Content Pillar 3',
  ct_ig_pillar4: 'Content Pillar 4',
  ct_ig_pillar5: 'Content Pillar 5',
  // Content — Storytelling
  ct_story_idea:    'Story Idea',
  ct_story_hook:    'Hook',
  ct_story_prob:    'Problem',
  ct_story_journey: 'Journey',
  ct_story_lesson:  'Lesson',
  ct_story_cta:     'CTA',
  // Launch — Funnel
  la_funnel_platforms:       'Content Platforms',
  la_funnel_lead_magnet:     'Lead Magnet',
  la_funnel_email_platform:  'Email Platform',
  la_funnel_newsletter_freq: 'Newsletter Frequency',
  la_funnel_cta:             'Primary CTA',
  la_funnel_offer:           'Core Offer',
  la_funnel_price:           'Price',
  la_funnel_conversion:      'Conversion Strategy',
  la_funnel_has_lm:          'Has Lead Magnet',
  la_funnel_has_email:       'Has Email List',
  la_funnel_has_offer:       'Has Offer',
  la_funnel_broken:          'What\'s Broken',
  // Launch — Lead Magnet
  la_lm_name:         'Lead Magnet Name',
  la_lm_topic:        'Topic',
  la_lm_offer_bridge: 'Offer Bridge',
  la_lm_format:       'Format',
  la_lm_big_win:      'The Big Win',
  la_lm_outline:      'Outline',
  la_lm_cta:          'CTA',
  la_lm_tool:         'Tool',
  la_lm_delivery:     'Delivery Method',
  // Launch — Bio
  la_bio_link:          'Link in Bio',
  la_bio_username:      'Username',
  la_bio_ig_name:       'Instagram Name',
  la_bio_pfp_visibility:'Profile Pic Visibility',
  la_bio_pfp_bg:        'Background',
  la_bio_pfp_notes:     'Profile Pic Notes',
  la_bio_line1:         'Bio Line 1',
  la_bio_line2:         'Bio Line 2',
  la_bio_line3:         'Bio Line 3',
  la_bio_line4:         'Bio Line 4',
  // Launch — Launch Content
  la_lc_story_why:       'Why You Do This',
  la_lc_story_challenge: 'The Challenge',
  la_lc_story_turning:   'The Turning Point',
  la_lc_story_learned:   'What You Learned',
  la_lc_story_hook:      'Hook',
  la_lc_story_examples:  'Examples',
  la_lc_story_cta:       'CTA',
  la_lc_pos_belief:      'Core Belief',
  la_lc_pos_claim:       'Core Claim',
  la_lc_pos_b1:          'Belief 1',
  la_lc_pos_b2:          'Belief 2',
  la_lc_pos_b3:          'Belief 3',
  la_lc_pos_b4:          'Belief 4',
  la_lc_pos_b5:          'Belief 5',
  la_lc_pos_stop:        'Stop Doing',
  la_lc_pos_oldbelief:   'Old Belief',
  la_lc_pos_start:       'Start Doing',
  la_lc_pos_newbelief:   'New Belief',
  la_lc_pos_anchor:      'Anchor Statement',
  la_lc_mc_subject:      'Masterclass Subject',
  la_lc_mc_audience:     'Target Audience',
  la_lc_mc_authority:    'Your Authority',
  la_lc_mc_s1:           'Section 1',
  la_lc_mc_s2:           'Section 2',
  la_lc_mc_s3:           'Section 3',
  la_lc_mc_s4:           'Section 4',
  la_lc_mc_s5:           'Section 5',
  la_lc_mc_s6:           'Section 6',
  la_lc_mc_s7:           'Section 7',
  la_lc_mc_hook:         'Masterclass Hook',
  la_lc_mc_waterfall:    'Waterfall Repurpose',
  // Launch — Goals
  la_goal_content_freq:      'Content Frequency',
  la_goal_content_platforms: 'Content Platforms',
  la_goal_content:           'Content Goal',
  la_goal_followers:         'Followers Goal',
  la_goal_email:             'Email Subscribers Goal',
  la_goal_audience:          'Audience Goal',
  la_goal_offer:             'Offer Goal',
  la_goal_sales:             'Sales Goal',
  la_goal_revenue:           'Revenue Goal',
  la_goal_system_priority:   'System Priority',
  la_goal_system:            'System Goal',
  la_goal_review_date:       'Review Date',
  la_goal_accountability:    'Accountability Partner',
}

// Fields to display as highlights (large, orange-tinted cards)
const HIGHLIGHT_FIELDS = new Set([
  'bf_journey_statement',
  'bf_av1_statement',
  'bf_ikigai_center',
  'bf_core_mission',
  'bf_origin_story',
  'bf_brand_vision',
  'ct_strategy_pain_problem',
  'ct_strategy_unique_sol',
  'ct_strategy_credibility',
  'la_lm_name',
  'la_lc_story_hook',
  'la_lc_pos_claim',
  'la_lc_pos_anchor',
  'la_goal_content',
  'la_goal_offer',
])

// Fields to skip in generic rendering (handled with special logic)
const SKIP_FIELDS = new Set([
  // Avatar 2 fields are in their own sub-section
  'bf_av2_age', 'bf_av2_gender', 'bf_av2_occupation', 'bf_av2_income',
  'bf_av2_situation', 'bf_av2_who', 'bf_av2_look', 'bf_av2_story',
  'bf_av2_goals', 'bf_av2_passions', 'bf_av2_struggle', 'bf_av2_tried',
  'bf_av2_desired', 'bf_av2_fears', 'bf_av2_platforms', 'bf_av2_connection',
  'bf_av2_statement',
  // Idea generation angle fields — noisy in playbook
  'ct_ig_p1i1_angles', 'ct_ig_p1i2_angles', 'ct_ig_p1i3_angles', 'ct_ig_p1i4_angles',
  'ct_ig_p2i1_angles', 'ct_ig_p2i2_angles', 'ct_ig_p2i3_angles', 'ct_ig_p2i4_angles',
  'ct_ig_p3i1_angles', 'ct_ig_p3i2_angles', 'ct_ig_p3i3_angles', 'ct_ig_p3i4_angles',
  'ct_ig_p4i1_angles', 'ct_ig_p4i2_angles', 'ct_ig_p4i3_angles', 'ct_ig_p4i4_angles',
  'ct_ig_p5i1_angles', 'ct_ig_p5i2_angles', 'ct_ig_p5i3_angles', 'ct_ig_p5i4_angles',
  // Idea sub-fields — granular, skip from playbook
  'ct_ig_p1i1', 'ct_ig_p1i2', 'ct_ig_p1i3', 'ct_ig_p1i4',
  'ct_ig_p2i1', 'ct_ig_p2i2', 'ct_ig_p2i3', 'ct_ig_p2i4',
  'ct_ig_p3i1', 'ct_ig_p3i2', 'ct_ig_p3i3', 'ct_ig_p3i4',
  'ct_ig_p4i1', 'ct_ig_p4i2', 'ct_ig_p4i3', 'ct_ig_p4i4',
  'ct_ig_p5i1', 'ct_ig_p5i2', 'ct_ig_p5i3', 'ct_ig_p5i4',
  // Launch calendar day-by-day fields
  'la_cal1_platform', 'la_cal1_type', 'la_cal1_hook', 'la_cal1_date', 'la_cal1_done',
  'la_cal2_platform', 'la_cal2_type', 'la_cal2_hook', 'la_cal2_date', 'la_cal2_done',
  'la_cal3_platform', 'la_cal3_type', 'la_cal3_hook', 'la_cal3_date', 'la_cal3_done',
  'la_cal4_platform', 'la_cal4_type', 'la_cal4_hook', 'la_cal4_date', 'la_cal4_done',
  'la_cal5_platform', 'la_cal5_type', 'la_cal5_hook', 'la_cal5_date', 'la_cal5_done',
  'la_cal6_platform', 'la_cal6_type', 'la_cal6_hook', 'la_cal6_date', 'la_cal6_done',
  'la_cal7_platform', 'la_cal7_type', 'la_cal7_hook', 'la_cal7_date', 'la_cal7_done',
])

function getStr(responses: Record<string, unknown>, key: string): string {
  const v = responses[key]
  if (typeof v === 'string' && v.trim()) return v.trim()
  return ''
}

function FieldCard({ label, value, highlight: isHighlight }: {
  label: string
  value: unknown
  highlight?: boolean
}) {
  const displayValue = typeof value === 'string' && value.trim() ? value : null

  if (isHighlight) {
    return (
      <div style={{
        background: displayValue ? 'var(--orange-tint)' : 'var(--surface)',
        border: `1px solid ${displayValue ? 'var(--orange-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.1rem 1.4rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
          letterSpacing: '.1em',
          color: 'var(--orange)',
          marginBottom: '5px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '14px', fontWeight: displayValue ? 500 : 400, lineHeight: 1.7,
          color: displayValue ? 'var(--text)' : 'var(--dimmer)',
          fontStyle: displayValue ? 'normal' : 'italic',
          whiteSpace: 'pre-wrap' as const,
        }}>
          {displayValue || 'Not yet completed'}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '.9rem 1rem',
    }}>
      <div style={{
        fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px', lineHeight: 1.6,
        color: displayValue ? 'var(--text)' : 'var(--dimmer)',
        fontStyle: displayValue ? 'normal' : 'italic',
        whiteSpace: 'pre-wrap' as const,
      }}>
        {displayValue || 'Not yet completed'}
      </div>
    </div>
  )
}

interface ColorSwatchProps {
  label: string
  hex: string
}
function ColorSwatch({ label, hex }: ColorSwatchProps) {
  const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '4px', flexShrink: 0,
        background: isValidHex ? hex : 'transparent',
        border: '1px solid var(--border2)',
      }} />
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: '10px', color: 'var(--dimmer)' }}>{hex}</div>
      </div>
    </div>
  )
}

interface PillarCardProps {
  number: string
  name: string
  sub?: string
}
function PillarCard({ number, name, sub }: PillarCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '.85rem',
    }}>
      <div style={{
        fontFamily: 'var(--font-num)', fontSize: '22px', fontWeight: 900,
        color: 'var(--orange)', opacity: 0.4, lineHeight: 1, marginBottom: '4px',
      }}>
        {number}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
        {name}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--dimmer)', marginTop: '3px', lineHeight: 1.4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ margin: '.75rem 0 .4rem' }}>
      <div style={{
        fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '.1em', color: 'var(--dimmer)',
      }}>
        {label}
      </div>
    </div>
  )
}

function ChapterHeader({ num, moduleLabel, title }: { num: string; moduleLabel: string; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      marginBottom: '1.5rem', paddingBottom: '1rem',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-num)', fontSize: '48px', fontWeight: 900,
        color: 'var(--orange)', lineHeight: 1, opacity: 0.35, flexShrink: 0,
      }}>
        {num}
      </div>
      <div>
        <div style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '.14em',
          textTransform: 'uppercase' as const, color: 'var(--dimmer)', marginBottom: '2px',
        }}>
          {moduleLabel}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
          {title}
        </div>
      </div>
    </div>
  )
}

function EmptyChapter({ moduleSlug }: { moduleSlug: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' as const,
      marginBottom: '1rem',
    }}>
      <div style={{ fontSize: '13px', color: 'var(--dimmer)', lineHeight: 1.6 }}>
        No answers yet — open this module to get started.
      </div>
    </div>
  )
}

function PlaybookSkeleton() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
      <div style={{
        textAlign: 'center', padding: '4rem 0',
        color: 'var(--dimmer)', fontSize: '13px',
      }}>
        Loading your playbook...
      </div>
    </div>
  )
}

// ─── CHAPTER RENDERERS ───────────────────────────────────────────────────────

function BrandFoundationChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  // Values
  const values: { name: string; practice: string }[] = []
  for (let i = 1; i <= 6; i++) {
    const name = g(`bf_val${i}_name`)
    if (name) values.push({ name, practice: g(`bf_val${i}_practice`) })
  }

  // Pillars
  const pillars: { name: string; sub: string }[] = []
  for (let i = 1; i <= 5; i++) {
    const name = g(`bf_pillar${i}_name`)
    if (name) pillars.push({ name, sub: g(`bf_pillar${i}_sub`) })
  }

  return (
    <>
      <FieldCard label="Brand Journey Statement" value={r.bf_journey_statement} highlight />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Desired Outcome" value={r.bf_journey_outcome} />
        <FieldCard label="Known For" value={r.bf_journey_known} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Actions" value={r.bf_journey_do} />
        <FieldCard label="Learning Priority" value={r.bf_journey_learn} />
      </div>

      <FieldCard label="Core Mission" value={r.bf_core_mission} highlight />
      <FieldCard label="Ikigai Center" value={r.bf_ikigai_center} highlight />
      <FieldCard label="Avatar Statement" value={r.bf_av1_statement} highlight />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Demographics" value={[g('bf_av1_age'), g('bf_av1_occupation')].filter(Boolean).join(' · ') || null} />
        <FieldCard label="Struggle" value={r.bf_av1_struggle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Desired Outcome" value={r.bf_av1_desired} />
        <FieldCard label="Where They Hang Out" value={r.bf_av1_platforms} />
      </div>

      {values.length > 0 && (
        <>
          <SectionLabel label="Core Values" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
            {values.map((v, i) => (
              <PillarCard key={i} number={`0${i + 1}`} name={v.name} sub={v.practice} />
            ))}
          </div>
        </>
      )}

      {pillars.length > 0 && (
        <>
          <SectionLabel label="Content Pillars" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
            {pillars.map((p, i) => (
              <PillarCard key={i} number={`0${i + 1}`} name={p.name} sub={p.sub} />
            ))}
          </div>
        </>
      )}

      <FieldCard label="Origin Story" value={r.bf_origin_story} highlight />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="3-Year Vision" value={r.bf_vision_3yr} />
        <FieldCard label="Impact" value={r.bf_vision_impact} />
      </div>
      <FieldCard label="Brand Vision" value={r.bf_brand_vision} highlight />
    </>
  )
}

function VisualWorldChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  const colorPrimary   = g('vw_color_primary')
  const colorSecondary = g('vw_color_secondary')
  const colorAccent    = g('vw_color_accent')
  const colorNeutral   = g('vw_color_neutral')
  const colorName      = g('vw_color_name')
  const hasColors      = colorPrimary || colorSecondary || colorAccent || colorNeutral

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="What Makes You Different" value={r.vw_ca_different} />
        <FieldCard label="What You Own" value={r.vw_ca_own} />
      </div>

      {hasColors && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '.9rem 1rem',
          marginBottom: '10px',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
            letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '8px',
          }}>
            Color Palette{colorName ? ` — ${colorName}` : ''}
          </div>
          {colorPrimary   && <ColorSwatch label="Primary"   hex={colorPrimary}   />}
          {colorSecondary && <ColorSwatch label="Secondary" hex={colorSecondary} />}
          {colorAccent    && <ColorSwatch label="Accent"    hex={colorAccent}    />}
          {colorNeutral   && <ColorSwatch label="Neutral"   hex={colorNeutral}   />}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Primary Font" value={r.vw_typo_primary} />
        <FieldCard label="Body Font"    value={r.vw_typo_body}    />
      </div>

      <SectionLabel label="Mood &amp; Setting" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Setting"      value={r.vw_shot_e1_location} />
        <FieldCard label="Primary Mood" value={r.vw_shot_e2_mood}     />
        <FieldCard label="Lighting"     value={r.vw_shot_e2_lighting} />
      </div>
      <FieldCard label="Setting Statement" value={r.vw_shot_e1_statement} highlight />
      <FieldCard label="Mood Statement"    value={r.vw_shot_e2_statement} highlight />

      <SectionLabel label="Design Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Signature Objects" value={r.vw_shot_e4_objects}  />
        <FieldCard label="Wardrobe"          value={r.vw_shot_e4_wardrobe} />
      </div>
      <FieldCard label="Never On Camera" value={r.vw_shot_e4_never} />
    </>
  )
}

function ContentChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  return (
    <>
      <FieldCard label="The Painful Problem"     value={r.ct_strategy_pain_problem} highlight />
      <FieldCard label="My Unique Solution"      value={r.ct_strategy_unique_sol}   highlight />
      <FieldCard label="Contextual Credibility"  value={r.ct_strategy_credibility}  highlight />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Primary Platform"  value={r.ct_sustain_primary}    />
        <FieldCard label="Weekly Hours"      value={r.ct_sustain_week_hours} />
        <FieldCard label="Content Cadence"   value={r.ct_sustain_cadence}    />
      </div>

      <SectionLabel label="Content Pillars" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
        {[1, 2, 3, 4, 5].map(i => {
          const name = g(`ct_ig_pillar${i}`)
          return name ? <PillarCard key={i} number={`0${i}`} name={name} /> : null
        })}
      </div>

      <SectionLabel label="Story Framework" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Hook"    value={r.ct_story_hook}    />
        <FieldCard label="Problem" value={r.ct_story_prob}    />
        <FieldCard label="Journey" value={r.ct_story_journey} />
        <FieldCard label="Lesson"  value={r.ct_story_lesson}  />
      </div>
      <FieldCard label="CTA" value={r.ct_story_cta} />

      <SectionLabel label="Offer Ladder" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Free Content"  value={r.ct_tm_free} />
        <FieldCard label="Lead Magnet"   value={r.ct_tm_lead} />
        <FieldCard label="Low-Ticket"    value={r.ct_tm_low}  />
        <FieldCard label="Mid-Ticket"    value={r.ct_tm_mid}  />
        <FieldCard label="High-Ticket"   value={r.ct_tm_high} />
        <FieldCard label="Conversion Strategy" value={r.ct_tm_conv} />
      </div>
    </>
  )
}

function LaunchChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)
  const bioFull = [g('la_bio_line1'), g('la_bio_line2'), g('la_bio_line3'), g('la_bio_line4')].filter(Boolean).join('\n')

  return (
    <>
      <SectionLabel label="Bio" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Username"    value={r.la_bio_username} />
        <FieldCard label="Link in Bio" value={r.la_bio_link}     />
      </div>
      {bioFull && <FieldCard label="Instagram Bio" value={bioFull} highlight />}

      <SectionLabel label="Your Funnel" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Content Platforms" value={r.la_funnel_platforms}      />
        <FieldCard label="Email Platform"    value={r.la_funnel_email_platform} />
        <FieldCard label="Primary CTA"       value={r.la_funnel_cta}            />
        <FieldCard label="Core Offer"        value={r.la_funnel_offer}          />
      </div>

      <SectionLabel label="Lead Magnet" />
      <FieldCard label="Lead Magnet Name" value={r.la_lm_name} highlight />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="The Big Win" value={r.la_lm_big_win} />
        <FieldCard label="Format"      value={r.la_lm_format}  />
      </div>

      <SectionLabel label="Video 1 — Your Story" />
      <FieldCard label="Hook" value={r.la_lc_story_hook} highlight />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Why You Do This" value={r.la_lc_story_why}       />
        <FieldCard label="The Challenge"   value={r.la_lc_story_challenge} />
        <FieldCard label="Turning Point"   value={r.la_lc_story_turning}   />
        <FieldCard label="What You Learned" value={r.la_lc_story_learned}  />
      </div>

      <SectionLabel label="Video 2 — Positioning" />
      <FieldCard label="Core Claim"     value={r.la_lc_pos_claim}   highlight />
      <FieldCard label="Anchor Statement" value={r.la_lc_pos_anchor} highlight />

      <SectionLabel label="90-Day Goals" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Followers Goal"        value={r.la_goal_followers} />
        <FieldCard label="Email Subscribers"     value={r.la_goal_email}     />
        <FieldCard label="Revenue Goal"          value={r.la_goal_revenue}   />
        <FieldCard label="Review Date"           value={r.la_goal_review_date} />
      </div>
      <FieldCard label="Content Goal" value={r.la_goal_content} highlight />
      <FieldCard label="Offer Goal"   value={r.la_goal_offer}   highlight />
      <FieldCard label="Accountability Partner" value={r.la_goal_accountability} />
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const { user } = useAuth()
  const [responses, setResponses] = useState<ResponsesByModule>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('blp_responses')
      .select('module_slug, responses')
      .eq('user_id', user.id)
      .then(({ data }: { data: { module_slug: string; responses: Record<string, unknown> }[] | null }) => {
        const byModule: ResponsesByModule = {}
        for (const row of data ?? []) {
          byModule[row.module_slug] = row.responses as Record<string, unknown>
        }
        setResponses(byModule)
        setLoading(false)
      })
  }, [user])

  if (loading) return <PlaybookSkeleton />

  const bf = responses['brand-foundation'] ?? {}
  const vw = responses['visual-world']     ?? {}
  const ct = responses['content']          ?? {}
  const la = responses['launch']           ?? {}

  // Cover metadata
  const brandName = getStr(bf, 'bf_journey_known') || getStr(la, 'la_bio_username') || 'Your Brand'
  const handle    = getStr(la, 'la_bio_username')  || ''
  const knownFor  = getStr(bf, 'bf_journey_known') || ''
  const goal90    = getStr(la, 'la_goal_content')  || getStr(la, 'la_goal_audience') || getStr(la, 'la_goal_revenue') || ''
  const today     = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  function MetaCell({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
    return (
      <div style={{ padding: '.65rem 0' }}>
        <div style={{
          fontSize: '8px', fontWeight: 700, letterSpacing: '.12em',
          textTransform: 'uppercase' as const, color: 'var(--dimmer)', marginBottom: '3px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '12px', fontWeight: value ? 700 : 400, lineHeight: 1.4,
          color: value ? 'var(--text)' : 'var(--dimmer)',
          fontStyle: value ? 'normal' : 'italic',
          wordWrap: 'break-word' as const,
        }}>
          {value || placeholder}
        </div>
      </div>
    )
  }

  const chapters = [
    { slug: 'brand-foundation', num: '01', label: 'Module 01', title: 'Brand Foundation',      data: bf },
    { slug: 'visual-world',     num: '02', label: 'Module 02', title: 'Your Visual World',      data: vw },
    { slug: 'content',          num: '03', label: 'Module 03', title: 'Create Your Content',    data: ct },
    { slug: 'launch',           num: '04', label: 'Module 04', title: 'Launch',                 data: la },
  ]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>

      {/* ── COVER ── */}
      <div style={{ textAlign: 'left', paddingTop: '2.5rem', marginBottom: '0' }}>
        <div style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '.18em',
          textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.75rem',
        }}>
          FSCreative&#8482;
        </div>
        <div style={{
          fontFamily: 'var(--font-num)',
          fontSize: 'clamp(72px, 13vw, 140px)',
          fontWeight: 900, lineHeight: 0.95,
          letterSpacing: '-2px', color: 'var(--text)',
          marginBottom: '2.5rem',
        }}>
          YOUR BRAND<br />PLAYBOOK
        </div>

        {/* Metadata row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '1.5rem' }}>
          <MetaCell label="Creator"    value={brandName} placeholder="Your Name"                  />
          <MetaCell label="Handle"     value={handle}    placeholder="Not set"                     />
          <MetaCell label="Known For"  value={knownFor}  placeholder="Complete Brand Foundation"   />
          <MetaCell label="90-Day Goal" value={goal90}   placeholder="Complete Launch module"      />
        </div>

        {/* Chapter nav */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          columnGap: '1rem', marginTop: '1.25rem', marginBottom: '3rem',
        }}>
          {chapters.map(c => (
            <a
              key={c.slug}
              href={`#ch${c.num}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.65rem 0', fontSize: '9px', fontWeight: 700, letterSpacing: '.08em',
                textTransform: 'uppercase', color: 'var(--dim)', textDecoration: 'none',
                borderTop: '1.5px solid var(--dimmer)',
                borderBottom: '1.5px solid var(--dimmer)',
              }}
            >
              {c.title.split(' ')[0]}
              <span style={{ color: 'var(--orange)', fontSize: '11px', flexShrink: 0, marginLeft: '4px' }}>
                &#8599;
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── CHAPTERS ── */}
      {chapters.map(c => (
        <div key={c.slug} id={`ch${c.num}`} className="pb-chapter" style={{ marginBottom: '3rem' }}>
          <ChapterHeader num={c.num} moduleLabel={c.label} title={c.title} />
          {c.slug === 'brand-foundation' && (
            Object.keys(c.data).length > 0
              ? <BrandFoundationChapter r={c.data} />
              : <EmptyChapter moduleSlug={c.slug} />
          )}
          {c.slug === 'visual-world' && (
            Object.keys(c.data).length > 0
              ? <VisualWorldChapter r={c.data} />
              : <EmptyChapter moduleSlug={c.slug} />
          )}
          {c.slug === 'content' && (
            Object.keys(c.data).length > 0
              ? <ContentChapter r={c.data} />
              : <EmptyChapter moduleSlug={c.slug} />
          )}
          {c.slug === 'launch' && (
            Object.keys(c.data).length > 0
              ? <LaunchChapter r={c.data} />
              : <EmptyChapter moduleSlug={c.slug} />
          )}
        </div>
      ))}

      {/* ── CTA ── */}
      <div style={{
        marginTop: '3rem',
        background: 'var(--orange-tint)',
        border: '1px solid var(--orange-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '.6rem' }}>
          Want help implementing your brand?
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          The Brand Launch Sprint&#8482; is a focused 30-day execution environment where you install
          your complete premium personal brand with direct creative direction from Gabe.
          Weekly live sessions. Direct feedback on every step. A community of creators doing the work alongside you.
        </p>
        <a
          href="https://fscreative.live"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            background: 'var(--orange)', color: '#fff',
            fontSize: '13px', fontWeight: 600,
            padding: '.7rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Join Brand Launch Sprint&#8482; &#8594;
        </a>
      </div>

      {/* ── PRINT BUTTON ── */}
      <button
        onClick={() => window.print()}
        className="print-btn"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '10px 18px', fontSize: '12px', fontWeight: 600,
          color: 'var(--text)', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          cursor: 'pointer', fontFamily: 'var(--font)', marginTop: '2rem',
        }}
      >
        Print Playbook
      </button>
    </div>
  )
}
