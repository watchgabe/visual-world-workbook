'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 4
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

// ── Static pairing data (from old app) ────────────────────
type Pairing = {
  name: string
  header: { f: string; w: string; s: string }
  body: { f: string; w: string; s: string }
  preview: string
  previewBody: string
  why: string
  gf: string
}

const TYP_PAIRINGS: Record<string, Pairing[]> = {
  'dark-cinematic': [
    { name: 'Cinematic Authority', header: { f: 'Bebas Neue', w: '400', s: 'display sans-serif' }, body: { f: 'DM Sans', w: '400', s: 'geometric sans-serif' }, preview: 'BRAND NAME', previewBody: 'The most cinematic creators aren\'t the most talented — they\'re the most intentional.', why: 'Bebas Neue is the most cinematic display font on Google Fonts. Big, bold, commanding. DM Sans keeps body copy modern and clean.', gf: 'https://fonts.google.com/specimen/Bebas+Neue' },
    { name: 'Dark Editorial', header: { f: 'Barlow Condensed', w: '700', s: 'condensed sans-serif' }, body: { f: 'Barlow', w: '400', s: 'humanist sans-serif' }, preview: 'DARK EDITORIAL', previewBody: 'Your visual world is the setting of your brand — the environment and atmosphere that shows up in every piece of content.', why: 'The Barlow family creates a cohesive, professional editorial system. Condensed headers command attention; regular body stays readable.', gf: 'https://fonts.google.com/specimen/Barlow+Condensed' },
    { name: 'Documentary Weight', header: { f: 'DM Serif Display', w: '400', s: 'transitional serif' }, body: { f: 'DM Sans', w: '300', s: 'geometric sans-serif' }, preview: 'Your Story', previewBody: 'The creators who build real brands understand one thing that everyone else misses: the visual world is the message.', why: 'DM Serif Display has the gravitas of legacy media. Against DM Sans Light it feels like premium documentary content.', gf: 'https://fonts.google.com/specimen/DM+Serif+Display' },
    { name: 'Space Editorial', header: { f: 'Space Grotesk', w: '700', s: 'geometric sans-serif' }, body: { f: 'Inter', w: '300', s: 'interface sans-serif' }, preview: 'EDITORIAL', previewBody: 'Premium content isn\'t about production value — it\'s about intentionality in every frame.', why: 'Space Grotesk has a futuristic, considered feel. Inter at light weight keeps body copy clean and contemporary.', gf: 'https://fonts.google.com/specimen/Space+Grotesk' },
    { name: 'Grotesk Dark', header: { f: 'Syne', w: '700', s: 'geometric sans-serif' }, body: { f: 'Jost', w: '300', s: 'geometric sans-serif' }, preview: 'DARK WORLD', previewBody: 'The visual world you build is the first thing your audience experiences. Make it unforgettable.', why: 'Syne\'s geometric character reads as modern and cinematic. Jost Light keeps the body airy, letting the darkness breathe.', gf: 'https://fonts.google.com/specimen/Syne' },
    { name: 'Barlow System', header: { f: 'Barlow', w: '700', s: 'humanist sans-serif' }, body: { f: 'Barlow', w: '300', s: 'humanist sans-serif' }, preview: 'SYSTEM', previewBody: 'When every detail is deliberate, the brand becomes unmistakable. No accident. All intention.', why: 'A single-family approach using Barlow\'s wide weight range creates a clean, cinematic system with no visual friction.', gf: 'https://fonts.google.com/specimen/Barlow' },
  ],
  'clean-minimal': [
    { name: 'Modern Minimal', header: { f: 'Inter', w: '700', s: 'interface sans-serif' }, body: { f: 'Inter', w: '400', s: 'interface sans-serif' }, preview: 'Clean System', previewBody: 'Designed for screens. Perfectly legible at any size. A single-family approach creates the most cohesive, digital-native feel.', why: 'Inter was designed specifically for digital interfaces. Using one family with multiple weights creates a clean, intentional system.', gf: 'https://fonts.google.com/specimen/Inter' },
    { name: 'Clean Confidence', header: { f: 'Syne', w: '800', s: 'geometric sans-serif' }, body: { f: 'Inter', w: '400', s: 'interface sans-serif' }, preview: 'Considered', previewBody: 'Every visual decision you make either builds your brand or dilutes it. There is no neutral.', why: 'Syne has subtle geometric quirks that add personality to a minimal look. Considered and modern without being corporate.', gf: 'https://fonts.google.com/specimen/Syne' },
    { name: 'Technical Precision', header: { f: 'Space Grotesk', w: '700', s: 'quirky geometric' }, body: { f: 'DM Sans', w: '400', s: 'geometric sans-serif' }, preview: 'Precise', previewBody: 'The difference between content that looks cheap and content that looks premium is almost never the camera.', why: 'Space Grotesk has deliberate imperfections that feel human and smart. Paired with DM Sans for clean, technical precision.', gf: 'https://fonts.google.com/specimen/Space+Grotesk' },
    { name: 'Classic Minimal', header: { f: 'Montserrat', w: '700', s: 'geometric sans-serif' }, body: { f: 'Open Sans', w: '400', s: 'humanist sans-serif' }, preview: 'Clean', previewBody: 'The best minimal brands remove everything that doesn\'t serve the message. What\'s left is the brand.', why: 'A timeless pairing used by thousands of premium brands. Montserrat\'s geometric precision pairs perfectly with Open Sans\'s warmth.', gf: 'https://fonts.google.com/specimen/Montserrat' },
    { name: 'DM Duo', header: { f: 'DM Sans', w: '700', s: 'geometric sans-serif' }, body: { f: 'DM Sans', w: '300', s: 'geometric sans-serif' }, preview: 'Minimal', previewBody: 'Clarity is a brand value. The simplest system is often the most sophisticated.', why: 'DM Sans as a single-family system is deeply considered and quietly premium. Light weight body creates visual breathing room.', gf: 'https://fonts.google.com/specimen/DM+Sans' },
    { name: 'Grotesk Minimal', header: { f: 'Space Grotesk', w: '700', s: 'geometric sans-serif' }, body: { f: 'Lato', w: '300', s: 'humanist sans-serif' }, preview: 'Grotesk', previewBody: 'Minimal doesn\'t mean empty. It means purposeful. Every element earns its place.', why: 'Space Grotesk\'s slight quirkiness adds personality to a minimal palette. Lato Light keeps body copy warm and human.', gf: 'https://fonts.google.com/specimen/Space+Grotesk' },
  ],
  'bold-statement': [
    { name: 'Lifestyle Bold', header: { f: 'Archivo Black', w: '400', s: 'grotesque sans-serif' }, body: { f: 'Archivo', w: '400', s: 'grotesque sans-serif' }, preview: 'STATEMENT', previewBody: 'Stop posting content that blends in. Your brand should be impossible to scroll past.', why: 'Archivo Black is loud, proud, and impossible to ignore. The full family gives both impact for headers and readability for body.', gf: 'https://fonts.google.com/specimen/Archivo+Black' },
    { name: 'Brand Machine', header: { f: 'Montserrat', w: '900', s: 'geometric sans-serif' }, body: { f: 'Open Sans', w: '400', s: 'humanist sans-serif' }, preview: 'YOUR BRAND', previewBody: 'Build a brand that speaks before you say a word. Visual identity is the fastest form of communication.', why: 'Montserrat at Black weight is a brand machine — used by hundreds of premium brands worldwide. Open Sans keeps it accessible.', gf: 'https://fonts.google.com/specimen/Montserrat' },
    { name: 'Maximum Impact', header: { f: 'Barlow Condensed', w: '800', s: 'condensed sans-serif' }, body: { f: 'Barlow', w: '400', s: 'humanist sans-serif' }, preview: 'MAXIMUM IMPACT', previewBody: 'Your typography communicates who you are before anyone reads a word. Make it count.', why: 'Maximum impact per pixel. Condensed headers make strong statements. Barlow body stays clean and readable at any size.', gf: 'https://fonts.google.com/specimen/Barlow+Condensed' },
    { name: 'Syne Statement', header: { f: 'Syne', w: '800', s: 'geometric sans-serif' }, body: { f: 'Jost', w: '400', s: 'geometric sans-serif' }, preview: 'BOLD', previewBody: 'The brands that win are the ones that are impossible to confuse with anyone else. Own your voice.', why: 'Syne at 800 weight is bold and geometric with personality. Jost body is modern, neutral, and clean.', gf: 'https://fonts.google.com/specimen/Syne' },
    { name: 'Archivo System', header: { f: 'Archivo Black', w: '400', s: 'grotesque sans-serif' }, body: { f: 'Archivo', w: '400', s: 'grotesque sans-serif' }, preview: 'BRAND', previewBody: 'A bold brand is not an accident. It\'s a decision made before anything was designed.', why: 'Archivo Black for display — dominant and proud. Archivo Regular for body — friendly and readable. A complete bold system.', gf: 'https://fonts.google.com/specimen/Archivo+Black' },
    { name: 'Condensed Power', header: { f: 'Barlow Condensed', w: '800', s: 'condensed sans-serif' }, body: { f: 'Barlow', w: '400', s: 'humanist sans-serif' }, preview: 'POWER', previewBody: 'Condensed type communicates density — more signal, less noise. Every word earns its place.', why: 'Barlow Condensed at heavy weight dominates any layout. The regular Barlow body creates clear hierarchy and strong contrast.', gf: 'https://fonts.google.com/specimen/Barlow+Condensed' },
  ],
  'warm-approachable': [
    { name: 'Warm Creator', header: { f: 'Lora', w: '700', s: 'contemporary serif' }, body: { f: 'Source Sans Pro', w: '400', s: 'humanist sans-serif' }, preview: 'Your Story', previewBody: 'The brands people trust are the ones that feel human. Warmth is not weakness — it\'s a strategic decision.', why: 'Lora feels human and warm — like a handwritten letter that grew up. Source Sans Pro keeps body copy clean and accessible.', gf: 'https://fonts.google.com/specimen/Lora' },
    { name: 'Friendly Authority', header: { f: 'Nunito', w: '800', s: 'rounded sans-serif' }, body: { f: 'Nunito Sans', w: '400', s: 'rounded sans-serif' }, preview: 'Welcome In', previewBody: 'Approachable brands make people feel safe before they feel sold to. Build trust first. Revenue follows.', why: 'Rounded terminals make Nunito feel approachable and kind. Authority without intimidation.', gf: 'https://fonts.google.com/specimen/Nunito' },
    { name: 'Human Editorial', header: { f: 'Playfair Display', w: '700', s: 'transitional serif' }, body: { f: 'Inter', w: '400', s: 'interface sans-serif' }, preview: 'The Human Brand', previewBody: 'When people feel seen in your content, they trust you. When they trust you, they buy from you.', why: 'Playfair Display brings warmth and editorial elegance. Inter grounds it with the clean, modern readability of a digital-first brand.', gf: 'https://fonts.google.com/specimen/Playfair+Display' },
    { name: 'Serif Warmth', header: { f: 'Playfair Display', w: '700', s: 'transitional serif' }, body: { f: 'Lato', w: '400', s: 'humanist sans-serif' }, preview: 'Your World', previewBody: 'Serif fonts carry decades of trust signals. Combined with a warm sans, the result feels both credible and approachable.', why: 'Playfair\'s warmth comes from its elegant curves. Lato body is one of the most readable, approachable typefaces available.', gf: 'https://fonts.google.com/specimen/Playfair+Display' },
    { name: 'DM Warmth', header: { f: 'DM Serif Display', w: '400', s: 'transitional serif' }, body: { f: 'DM Sans', w: '400', s: 'geometric sans-serif' }, preview: 'Warmth', previewBody: 'The brands that last are the ones that feel like people — not like corporations. Design for trust.', why: 'DM Serif Display\'s italic quality adds warmth and personality. DM Sans keeps body copy grounded and readable.', gf: 'https://fonts.google.com/specimen/DM+Serif+Display' },
    { name: 'Rounded Warmth', header: { f: 'Nunito', w: '800', s: 'rounded sans-serif' }, body: { f: 'Nunito Sans', w: '400', s: 'rounded sans-serif' }, preview: 'Welcome', previewBody: 'Warmth in design is not softness — it\'s accessibility. A brand that feels safe to approach is a brand that converts.', why: 'Nunito\'s rounded terminals create immediate warmth and trust. The sans companion keeps body copy clean and readable.', gf: 'https://fonts.google.com/specimen/Nunito' },
  ],
  'luxury-editorial': [
    { name: 'Luxury Editorial', header: { f: 'Cormorant Garamond', w: '700', s: 'garalde serif' }, body: { f: 'Jost', w: '300', s: 'geometric sans-serif' }, preview: 'Élégance', previewBody: 'The most premium brands in the world share one thing: every decision is intentional. Nothing is arbitrary.', why: 'Cormorant Garamond is the most refined font on Google Fonts. Thin, elegant, expensive-looking. Jost at light weight matches its delicacy.', gf: 'https://fonts.google.com/specimen/Cormorant+Garamond' },
    { name: 'Premium Authority', header: { f: 'Playfair Display', w: '700', s: 'transitional serif' }, body: { f: 'Montserrat', w: '300', s: 'geometric sans-serif' }, preview: 'Prestige', previewBody: 'Luxury isn\'t about price. It\'s about the feeling someone gets when they encounter your brand.', why: 'The classic premium pairing. Playfair Display for prestige, Montserrat Light for precision. Used by luxury brands worldwide.', gf: 'https://fonts.google.com/specimen/Playfair+Display' },
    { name: 'Refined Minimal', header: { f: 'DM Serif Display', w: '400', s: 'transitional serif' }, body: { f: 'DM Sans', w: '300', s: 'geometric sans-serif' }, preview: 'Curated', previewBody: 'Restraint is a luxury. Knowing what not to include is the mark of a designer who understands premium.', why: 'The DM family was designed together for maximum harmony. Serif and sans from the same designer — refined and intentional.', gf: 'https://fonts.google.com/specimen/DM+Serif+Display' },
    { name: 'Haute Couture', header: { f: 'Italiana', w: '400', s: 'elegant serif' }, body: { f: 'Raleway', w: '300', s: 'geometric sans-serif' }, preview: 'Haute', previewBody: 'True luxury is effortless. The typography disappears into the content, elevating without announcing itself.', why: 'Italiana is pure high fashion — magazine masthead energy. Raleway Light matches its elegant restraint perfectly.', gf: 'https://fonts.google.com/specimen/Italiana' },
    { name: 'Editorial Italic', header: { f: 'Cormorant Garamond', w: '700', s: 'garalde serif' }, body: { f: 'Montserrat', w: '300', s: 'geometric sans-serif' }, preview: 'Editorial', previewBody: 'The gap between looking expensive and looking cheap is almost always in the typography. Cormorant closes it.', why: 'Cormorant Garamond italic at heavy weight is one of the most editorial combinations in digital typography. Montserrat Light grounds it.', gf: 'https://fonts.google.com/specimen/Cormorant+Garamond' },
    { name: 'DM Luxury', header: { f: 'DM Serif Display', w: '400', s: 'transitional serif' }, body: { f: 'Inter', w: '300', s: 'interface sans-serif' }, preview: 'Curated', previewBody: 'Luxury brands say more by doing less. White space, restraint, and deliberate typography are the product.', why: 'DM Serif Display in italic is the most refined option in the DM family. Inter at Light weight feels contemporary and precise.', gf: 'https://fonts.google.com/specimen/DM+Serif+Display' },
  ],
  'creative-expressive': [
    { name: 'Creative Director', header: { f: 'Abril Fatface', w: '400', s: 'display serif' }, body: { f: 'Lato', w: '400', s: 'humanist sans-serif' }, preview: 'ART', previewBody: 'The most creative brands don\'t follow trends. They make them. Your typography should say that before anyone reads a word.', why: 'Abril Fatface is theatrical and confident — stops the scroll immediately. Lato brings it back to earth for body copy.', gf: 'https://fonts.google.com/specimen/Abril+Fatface' },
    { name: 'Arts & Culture', header: { f: 'Syne', w: '800', s: 'geometric sans-serif' }, body: { f: 'Lato', w: '300', s: 'humanist sans-serif' }, preview: 'Original', previewBody: 'Creative brands need typography that proves it before you say anything. Your font is the first piece of art they see.', why: 'Syne was designed for arts and culture institutions. Bold and confident with subtle quirks that mark it as genuinely creative.', gf: 'https://fonts.google.com/specimen/Syne' },
    { name: 'Fashion Lifestyle', header: { f: 'Italiana', w: '400', s: 'elegant serif' }, body: { f: 'Raleway', w: '300', s: 'geometric sans-serif' }, preview: 'Couture', previewBody: 'When the typography is right, the brand feels effortless. Like it was always meant to look exactly this way.', why: 'Italiana feels like a high-fashion magazine masthead. Raleway Light brings geometric elegance to body copy. Together: effortlessly premium.', gf: 'https://fonts.google.com/specimen/Italiana' },
    { name: 'Grotesk Expressive', header: { f: 'Syne', w: '800', s: 'geometric sans-serif' }, body: { f: 'Jost', w: '300', s: 'geometric sans-serif' }, preview: 'EXPRESSIVE', previewBody: 'Creative brands don\'t apologize for being different. They build systems that make the difference undeniable.', why: 'Syne was literally designed for arts and culture. At 800 weight it\'s expressive and confident. Jost Light balances it with quiet precision.', gf: 'https://fonts.google.com/specimen/Syne' },
    { name: 'Condensed Creative', header: { f: 'Bebas Neue', w: '400', s: 'display sans-serif' }, body: { f: 'Raleway', w: '300', s: 'geometric sans-serif' }, preview: 'CREATIVE', previewBody: 'The most creative visual worlds are built on disciplined systems. Freedom within structure — that\'s the mark of a real art director.', why: 'Bebas Neue is pure creative energy — used in editorial, fashion, and culture worldwide. Raleway Light adds elegance to the mix.', gf: 'https://fonts.google.com/specimen/Bebas+Neue' },
    { name: 'Archivo Creative', header: { f: 'Archivo Black', w: '400', s: 'grotesque sans-serif' }, body: { f: 'Source Sans Pro', w: '400', s: 'humanist sans-serif' }, preview: 'ORIGINAL', previewBody: 'Creative brands stand for something specific. The typography makes the statement before the content does.', why: 'Archivo Black\'s grotesque character is raw and expressive. Source Sans Pro grounds the body in warmth and readability.', gf: 'https://fonts.google.com/specimen/Archivo+Black' },
  ],
}

// ── Static Google Fonts autocomplete list ─────────────────
const POPULAR_GOOGLE_FONTS = [
  'Abril Fatface', 'Alegreya', 'Archivo', 'Archivo Black', 'Arvo',
  'Assistant', 'Barlow', 'Barlow Condensed', 'Bebas Neue', 'Bitter',
  'Cairo', 'Cabin', 'Cinzel', 'Comfortaa', 'Cormorant Garamond',
  'Crimson Text', 'DM Sans', 'DM Serif Display', 'Dancing Script', 'Dosis',
  'EB Garamond', 'Exo 2', 'Fira Sans', 'Fjalla One', 'Gelasio',
  'Great Vibes', 'IBM Plex Sans', 'IBM Plex Serif', 'Inconsolata', 'Inter',
  'Italiana', 'Josefin Sans', 'Jost', 'Kanit', 'Karla',
  'Lato', 'Libre Baskerville', 'Libre Bodoni', 'Literata', 'Lora',
  'Merriweather', 'Montserrat', 'Mukta', 'Mulish', 'Noto Sans',
  'Nunito', 'Nunito Sans', 'Open Sans', 'Oswald', 'Outfit',
  'Overpass', 'Oxygen', 'PT Sans', 'PT Serif', 'Pacifico',
  'Playfair Display', 'Poppins', 'Prompt', 'Questrial', 'Quicksand',
  'Raleway', 'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Roboto Serif',
  'Rubik', 'Signika', 'Slabo 27px', 'Source Code Pro', 'Source Sans Pro',
  'Source Serif Pro', 'Space Grotesk', 'Space Mono', 'Syne', 'Teko',
  'Titillium Web', 'Ubuntu', 'Unbounded', 'Unna', 'Work Sans',
  'Yanone Kaffeesatz', 'Zilla Slab',
]

const AESTHETIC_MOODS = [
  { key: 'dark-cinematic',     num: '01', label: 'Dark & Cinematic',     tags: ['bold', 'dramatic', 'cinematic'],   preview: 'IMPACT',    previewStyle: { fontFamily: '\'Barlow Condensed\',sans-serif', letterSpacing: '.02em', fontWeight: 700 } },
  { key: 'clean-minimal',      num: '02', label: 'Clean & Minimal',      tags: ['modern', 'digital', 'precise'],    preview: 'Clarity',   previewStyle: { fontFamily: '\'Inter\',sans-serif', fontWeight: 700 } },
  { key: 'bold-statement',     num: '03', label: 'Bold & Statement',     tags: ['loud', 'confident', 'energy'],     preview: 'LOUD',      previewStyle: { fontFamily: '\'Montserrat\',sans-serif', fontWeight: 900 } },
  { key: 'warm-approachable',  num: '04', label: 'Warm & Approachable',  tags: ['warm', 'trusting', 'personal'],    preview: 'Human',     previewStyle: { fontFamily: '\'Lora\',serif', fontWeight: 700 } },
  { key: 'luxury-editorial',   num: '05', label: 'Luxury & Editorial',   tags: ['refined', 'premium', 'editorial'], preview: 'Élégant',  previewStyle: { fontFamily: '\'Playfair Display\',serif', fontWeight: 700, fontStyle: 'italic' as const } },
  { key: 'creative-expressive', num: '06', label: 'Creative & Expressive', tags: ['artistic', 'unique', 'expressive'], preview: 'Art', previewStyle: { fontFamily: '\'Abril Fatface\',serif' } },
]

// ── Helper: inject Google Fonts link tag ──────────────────
function injectGoogleFont(fontName: string, linkId: string) {
  if (!fontName || fontName.length < 2) return
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,300;0,400;0,700;0,800;0,900;1,300;1,400;1,700&display=swap`
  let link = document.getElementById(linkId) as HTMLLinkElement | null
  if (link) {
    link.href = href
  } else {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

// ── Font input with autocomplete ─────────────────────────
function FontAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [localVal, setLocalVal] = useState(value)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Keep local in sync with external value (on load)
  useEffect(() => { setLocalVal(value) }, [value])

  const suggestions = localVal.length >= 1
    ? POPULAR_GOOGLE_FONTS.filter(f => f.toLowerCase().startsWith(localVal.toLowerCase())).slice(0, 8)
    : []

  function handleChange(v: string) {
    setLocalVal(v)
    onChange(v)
    setOpen(true)
  }

  function select(font: string) {
    setLocalVal(font)
    onChange(font)
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={localVal}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: '13.5px',
          color: 'var(--text)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0,0,0,.2)',
            zIndex: 50,
            overflow: 'hidden',
            marginTop: '2px',
          }}
        >
          {suggestions.map(font => (
            <button
              key={font}
              type="button"
              onMouseDown={e => { e.preventDefault(); select(font) }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text)',
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'var(--surface)' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent' }}
            >
              {font}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Typography() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  // ── AI Font Identifier state ──────────────────────────
  const [fontIdPhoto, setFontIdPhoto] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [fontIdDragOver, setFontIdDragOver] = useState(false)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [identifyResult, setIdentifyResult] = useState<{ primary: string; body: string; confidence: string; notes: string } | null>(null)
  const [identifyError, setIdentifyError] = useState<string | null>(null)

  // ── Font Pairing state ────────────────────────────────
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [pairingOffset, setPairingOffset] = useState(0)

  // ── Load saved data ───────────────────────────────────
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .maybeSingle()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const saved = data.responses as Record<string, string>
        Object.entries(saved).forEach(([key, val]) => {
          if (typeof val === 'string') (setValue as (k: string, v: string) => void)(key, val)
        })
      })
    return () => { cancelled = true }
  }, [user, setValue])

  // ── Google Fonts live preview — primary font ──────────
  const primaryFont = watch('vw_typo_primary')
  useEffect(() => {
    if (!primaryFont || primaryFont.length < 2) return
    const timer = setTimeout(() => injectGoogleFont(primaryFont, 'gf-primary'), 500)
    return () => clearTimeout(timer)
  }, [primaryFont])

  // ── Google Fonts live preview — body font ─────────────
  const bodyFont = watch('vw_typo_body')
  useEffect(() => {
    if (!bodyFont || bodyFont.length < 2) return
    const timer = setTimeout(() => injectGoogleFont(bodyFont, 'gf-body'), 500)
    return () => clearTimeout(timer)
  }, [bodyFont])

  // ── Italic/bold state ─────────────────────────────────
  const primaryItalic = watch('vw_typo_primary_italic') === 'true'
  const primaryBold   = watch('vw_typo_primary_bold')   === 'true'
  const bodyItalic    = watch('vw_typo_body_italic')    === 'true'
  const bodyBold      = watch('vw_typo_body_bold')      === 'true'

  function toggleStyle(field: string) {
    const current = (getValues() as Record<string, string>)[field]
    ;(setValue as (k: string, v: string) => void)(field, current === 'true' ? '' : 'true')
  }

  // ── Font identifier upload ────────────────────────────
  function handleFontIdFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      setFontIdPhoto({ base64, mime: file.type, preview: dataUrl })
      setIdentifyResult(null)
      setIdentifyError(null)
    }
    reader.readAsDataURL(file)
  }

  async function runFontIdentification() {
    if (!fontIdPhoto) return
    setIsIdentifying(true)
    setIdentifyError(null)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxTokens: 600,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: fontIdPhoto.mime,
                  data: fontIdPhoto.base64,
                },
              },
              {
                type: 'text',
                text: 'Look at the main font/typography style in this image. Return exactly 3 free Google Fonts that match this style — from closest match to more creative alternatives.\n\nFor each return:\n- googleFontName: exact name as it appears on fonts.google.com (e.g. "Libre Bodoni", "Playfair Display")\n- isItalic: true if the style in the image is italic, otherwise false\n- description: one sentence on why it matches or how it differs from the others\n- role: "headline" or "body"\n\nReturn ONLY a valid JSON array of exactly 3 items:\n[{"googleFontName":"...","isItalic":false,"description":"...","role":"headline"}]\nOnly return the JSON, no other text.',
              },
            ],
          }],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text: string = data.text || data.content || ''
      const cleaned = text.replace(/```json|```/g, '').trim()
      const jsonStart = cleaned.indexOf('[')
      const jsonEnd = cleaned.lastIndexOf(']')
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No font suggestions returned')
      const fonts: Array<{ googleFontName: string; isItalic: boolean; description: string; role: string }> = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
      // Inject preview fonts
      fonts.forEach(f => injectGoogleFont(f.googleFontName, `gf-id-${f.googleFontName.replace(/\s+/g, '-').toLowerCase()}`))
      // Store as simple result (first headline as primary, first body as body)
      const headline = fonts.find(f => f.role === 'headline') || fonts[0]
      const body = fonts.find(f => f.role === 'body') || fonts[1] || fonts[0]
      setIdentifyResult({
        primary: headline?.googleFontName || '',
        body: body?.googleFontName || '',
        confidence: 'high',
        notes: fonts.map(f => `${f.googleFontName}: ${f.description}`).join(' | '),
      })
      // Store full list for rendering
      setFontSuggestions(fonts)
    } catch (e) {
      setIdentifyError(e instanceof Error ? e.message : 'Identification failed')
    } finally {
      setIsIdentifying(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fontSuggestions, setFontSuggestions] = useState<any[]>([])

  // ── Mood card pairing ────────────────────────────────
  function selectMood(moodKey: string) {
    if (selectedMood === moodKey) {
      setSelectedMood(null)
      setPairingOffset(0)
      return
    }
    setSelectedMood(moodKey)
    setPairingOffset(0)
  }

  function applyPairing(p: Pairing) {
    ;(setValue as (k: string, v: string) => void)('vw_typo_primary', p.header.f)
    ;(setValue as (k: string, v: string) => void)('vw_typo_body', p.body.f)
    if (user) {
      saveField(user.id, MODULE_SLUG, 'vw_typo_primary', p.header.f)
      saveField(user.id, MODULE_SLUG, 'vw_typo_body', p.body.f)
    }
  }

  const currentPairings = selectedMood ? (TYP_PAIRINGS[selectedMood] || []).slice(pairingOffset, pairingOffset + 3) : []
  const totalPairings = selectedMood ? (TYP_PAIRINGS[selectedMood] || []).length : 0

  const responses = watch()

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={responses}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginBottom: '.5rem',
        }}
      >
        Workshop 4
      </div>
      <h1
        style={{
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.4px',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}
      >
        Define Your Typography
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your typography is the written voice of your visual world. Use the Font Finder to discover
        the right pairing for your brand aesthetic — or drop in any image to identify fonts you love.
      </p>

      {/* ── 1. AI Font Identifier ── */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        AI Font Identifier
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Drop in a screenshot or image with fonts you love — a brand, a poster, a design. AI will
        identify the fonts and suggest free Google Fonts alternatives.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setFontIdDragOver(true) }}
        onDragLeave={() => setFontIdDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setFontIdDragOver(false)
          const files = Array.from(e.dataTransfer.files)
          if (files[0]) handleFontIdFile(files[0])
        }}
        onClick={() => document.getElementById('fi-file-input')?.click()}
        style={{
          border: `2px dashed ${fontIdDragOver ? 'var(--orange)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: fontIdPhoto ? '12px' : '28px 16px',
          marginBottom: '1rem',
          cursor: 'pointer',
          background: fontIdDragOver ? 'var(--orange-tint)' : 'var(--surface)',
          transition: 'all .15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {fontIdPhoto ? (
          <img
            src={fontIdPhoto.preview}
            alt="Uploaded for font identification"
            style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
          />
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--dimmer)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div style={{ fontSize: '13px', color: 'var(--dim)' }}>Click or drop an image here</div>
            <div style={{ fontSize: '11px', color: 'var(--dimmer)' }}>Supports PNG, JPG, WEBP</div>
          </>
        )}
      </div>
      <input
        id="fi-file-input"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFontIdFile(e.target.files[0]); e.currentTarget.value = '' }}
      />

      {fontIdPhoto && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={runFontIdentification}
            disabled={isIdentifying}
            style={{
              background: isIdentifying ? 'var(--border)' : 'var(--orange)',
              color: isIdentifying ? 'var(--dimmer)' : '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isIdentifying ? 'not-allowed' : 'pointer',
            }}
          >
            {isIdentifying ? 'Identifying...' : 'Identify Fonts'}
          </button>
          <button
            type="button"
            onClick={() => { setFontIdPhoto(null); setIdentifyResult(null); setFontSuggestions([]) }}
            style={{ background: 'transparent', border: 'none', color: 'var(--dimmer)', fontSize: '12px', cursor: 'pointer' }}
          >
            Remove image
          </button>
        </div>
      )}

      {identifyError && (
        <div style={{ color: 'var(--orange-dark)', fontSize: '12px', marginBottom: '1rem' }}>{identifyError}</div>
      )}

      {fontSuggestions.length > 0 && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '10px' }}>
            Font Suggestions
          </div>
          {fontSuggestions.map((f, i) => (
            <div
              key={i}
              style={{
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                paddingTop: i > 0 ? '10px' : 0,
                marginTop: i > 0 ? '10px' : 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: `'${f.googleFontName}', sans-serif` }}>
                    {f.googleFontName}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--dimmer)',
                      background: 'var(--surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--border)',
                      borderRadius: '3px',
                      padding: '1px 6px',
                      marginLeft: '8px',
                    }}
                  >
                    {f.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const field = f.role === 'body' ? 'vw_typo_body' : 'vw_typo_primary'
                    ;(setValue as (k: string, v: string) => void)(field, f.googleFontName)
                    if (user) saveField(user.id, MODULE_SLUG, field, f.googleFontName)
                  }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Use as {f.role === 'body' ? 'Body' : 'Primary'}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5, marginBottom: '6px' }}>{f.description}</div>
              <div
                style={{
                  fontFamily: `'${f.googleFontName}', sans-serif`,
                  fontStyle: f.isItalic ? 'italic' : 'normal',
                  fontSize: '15px',
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
          {identifyResult && (
            <button
              type="button"
              onClick={() => {
                ;(setValue as (k: string, v: string) => void)('vw_typo_primary', identifyResult.primary)
                ;(setValue as (k: string, v: string) => void)('vw_typo_body', identifyResult.body)
                if (user) {
                  saveField(user.id, MODULE_SLUG, 'vw_typo_primary', identifyResult.primary)
                  saveField(user.id, MODULE_SLUG, 'vw_typo_body', identifyResult.body)
                }
              }}
              style={{
                marginTop: '12px',
                background: 'var(--orange)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Use Headline + Body Suggestion
            </button>
          )}
        </div>
      )}

      {/* ── 2. Font Pairing Suggestions (mood cards) ── */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Font Finder
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Which of these feels closest to your brand world? Pick the aesthetic that matches your mood board.
      </p>

      {/* Aesthetic mood grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '6px',
          marginBottom: '1rem',
        }}
      >
        {AESTHETIC_MOODS.map(mood => (
          <div
            key={mood.key}
            role="button"
            tabIndex={0}
            onClick={() => selectMood(mood.key)}
            onKeyDown={e => e.key === 'Enter' && selectMood(mood.key)}
            style={{
              background: selectedMood === mood.key ? 'var(--orange-tint)' : 'var(--card)',
              border: `1px solid ${selectedMood === mood.key ? 'var(--orange)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '4px',
              }}
            >
              {mood.num}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              {mood.label}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--dim)', marginBottom: '6px', ...mood.previewStyle }}>
              {mood.preview}
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {mood.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '10px',
                    color: 'var(--dimmer)',
                    background: 'var(--surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                    borderRadius: '3px',
                    padding: '1px 5px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pairing results */}
      {selectedMood && currentPairings.length > 0 && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '2px' }}>
            {AESTHETIC_MOODS.find(m => m.key === selectedMood)?.label} — Pairings
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--dim)', marginBottom: '12px' }}>
            Click <strong>Use This Pairing</strong> to auto-fill your fonts below.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentPairings.map((p, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{p.name}</div>
                <div style={{ marginBottom: '6px' }}>
                  <div
                    style={{
                      fontFamily: `'${p.header.f}', serif, sans-serif`,
                      fontWeight: Number(p.header.w) || 700,
                      fontSize: '18px',
                      color: 'var(--text)',
                      lineHeight: 1.2,
                    }}
                  >
                    Your Brand
                  </div>
                  <div
                    style={{
                      fontFamily: `'${p.body.f}', sans-serif`,
                      fontWeight: Number(p.body.w) || 400,
                      fontSize: '12.5px',
                      color: 'var(--dim)',
                      lineHeight: 1.6,
                      marginTop: '4px',
                    }}
                  >
                    {p.previewBody}
                  </div>
                </div>
                <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Primary Font</div>
                    <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>{p.header.f}</div>
                    <div style={{ fontSize: '10px', color: 'var(--dimmer)' }}>{p.header.s}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Body Font</div>
                    <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>{p.body.f}</div>
                    <div style={{ fontSize: '10px', color: 'var(--dimmer)' }}>{p.body.s}</div>
                  </div>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.6, marginBottom: '10px', fontStyle: 'italic' }}>{p.why}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => applyPairing(p)}
                    style={{
                      background: 'var(--orange)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Use This Pairing
                  </button>
                  <a
                    href={p.gf}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--orange)', textDecoration: 'none' }}
                  >
                    View on Google Fonts →
                  </a>
                </div>
              </div>
            ))}
          </div>
          {totalPairings > 3 && (
            <button
              type="button"
              onClick={() => {
                const next = pairingOffset + 3
                setPairingOffset(next >= totalPairings ? 0 : next)
              }}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '9px',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                color: 'var(--dim)',
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              {pairingOffset + 3 >= totalPairings ? 'See First 3 Again →' : 'See 3 More Options →'}
            </button>
          )}
        </div>
      )}

      {/* ── 3 + 4 + 5. Font inputs + preview + autocomplete + toggles ── */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Your Fonts
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Enter them directly below. Suggestions appear as you type.{' '}
        <a
          href="https://fonts.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--orange)', textDecoration: 'none' }}
        >
          Browse Google Fonts →
        </a>
      </p>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '1rem',
          }}
        >
          Enter Your Fonts
        </div>

        {/* Primary Font */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
              Primary Font — headlines, hooks, title cards
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                title="Italic"
                onClick={() => toggleStyle('vw_typo_primary_italic')}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: primaryItalic ? 'var(--orange)' : 'var(--surface)',
                  color: primaryItalic ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                I
              </button>
              <button
                type="button"
                title="Bold"
                onClick={() => toggleStyle('vw_typo_primary_bold')}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: primaryBold ? 'var(--orange)' : 'var(--surface)',
                  color: primaryBold ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '13px',
                }}
              >
                B
              </button>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '6px' }}>
            This is what people see in your thumbnails, title cards, and major hooks.
          </div>

          {/* Autocomplete input for primary */}
          <FontAutocomplete
            value={watch('vw_typo_primary')}
            onChange={val => (setValue as (k: string, v: string) => void)('vw_typo_primary', val)}
            placeholder="e.g. Bebas Neue, Playfair Display, Montserrat..."
          />

          {/* Also save via WorkshopInput (hidden) for autosave trigger */}
          <div style={{ display: 'none' }}>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="vw_typo_primary"
              value={watch('vw_typo_primary')}
              onChange={val => (setValue as (k: string, v: string) => void)('vw_typo_primary', val)}
              getFullResponses={getValues}
              placeholder=""
            />
          </div>

          {/* Primary font preview */}
          {watch('vw_typo_primary') && watch('vw_typo_primary').length >= 2 && (
            <div
              style={{
                marginTop: '10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>Preview</div>
              <div
                style={{
                  fontFamily: `'${watch('vw_typo_primary')}', sans-serif`,
                  fontStyle: primaryItalic ? 'italic' : 'normal',
                  fontWeight: primaryBold ? 700 : 400,
                  fontSize: '20px',
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div
                style={{
                  fontFamily: `'${watch('vw_typo_primary')}', sans-serif`,
                  fontStyle: 'italic',
                  fontWeight: primaryBold ? 700 : 400,
                  fontSize: '14px',
                  color: 'var(--dim)',
                  marginBottom: '2px',
                }}
              >
                Italic — The quick brown fox
              </div>
              <div
                style={{
                  fontFamily: `'${watch('vw_typo_primary')}', sans-serif`,
                  fontStyle: 'normal',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--dim)',
                }}
              >
                Bold — The quick brown fox
              </div>
            </div>
          )}
        </div>

        {/* Body Font */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
              Body Font — captions, supporting copy, longer text
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                title="Italic"
                onClick={() => toggleStyle('vw_typo_body_italic')}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: bodyItalic ? 'var(--orange)' : 'var(--surface)',
                  color: bodyItalic ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                I
              </button>
              <button
                type="button"
                title="Bold"
                onClick={() => toggleStyle('vw_typo_body_bold')}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: bodyBold ? 'var(--orange)' : 'var(--surface)',
                  color: bodyBold ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '13px',
                }}
              >
                B
              </button>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '6px' }}>
            Used for captions, supporting text, and any longer copy in your content.
          </div>

          {/* Autocomplete input for body */}
          <FontAutocomplete
            value={watch('vw_typo_body')}
            onChange={val => (setValue as (k: string, v: string) => void)('vw_typo_body', val)}
            placeholder="e.g. Inter, DM Sans, Source Sans Pro..."
          />

          {/* Also save via WorkshopInput (hidden) for autosave trigger */}
          <div style={{ display: 'none' }}>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="vw_typo_body"
              value={watch('vw_typo_body')}
              onChange={val => (setValue as (k: string, v: string) => void)('vw_typo_body', val)}
              getFullResponses={getValues}
              placeholder=""
            />
          </div>

          {/* Body font preview */}
          {watch('vw_typo_body') && watch('vw_typo_body').length >= 2 && (
            <div
              style={{
                marginTop: '10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>Preview</div>
              <div
                style={{
                  fontFamily: `'${watch('vw_typo_body')}', sans-serif`,
                  fontStyle: bodyItalic ? 'italic' : 'normal',
                  fontWeight: bodyBold ? 700 : 400,
                  fontSize: '15px',
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div
                style={{
                  fontFamily: `'${watch('vw_typo_body')}', sans-serif`,
                  fontStyle: 'italic',
                  fontWeight: bodyBold ? 700 : 400,
                  fontSize: '13px',
                  color: 'var(--dim)',
                  marginBottom: '2px',
                }}
              >
                Italic — The quick brown fox
              </div>
              <div
                style={{
                  fontFamily: `'${watch('vw_typo_body')}', sans-serif`,
                  fontStyle: 'normal',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--dim)',
                }}
              >
                Bold — The quick brown fox
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom fonts note */}
      <div
        style={{
          background: 'var(--orange-tint)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          padding: '.75rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--orange-dark)', lineHeight: 1.6 }}>
          If you use custom / brand fonts (not on Google Fonts), type the font name exactly as it
          appears in your design tool (Figma, Canva, Adobe). Your style guide will reference it —
          just make sure you have the license.
        </div>
      </div>
    </SectionWrapper>
  )
}
