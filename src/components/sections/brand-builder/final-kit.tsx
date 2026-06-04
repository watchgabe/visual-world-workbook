'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import type { BrandDirection } from './brand-directions'

const MODULE_SLUG = 'brand-builder' as const
const SECTION_INDEX = 4
const SECTION_DEF = MODULE_SECTIONS['brand-builder']![SECTION_INDEX]

function KitBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--orange)',
      }}>
        {title}
      </div>
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  )
}

export default function FinalKitSection() {
  const { user } = useAuth()

  const [kit, setKit] = useState<{
    direction: BrandDirection | null
    fonts: { headline: string; body: string } | null
    colors: { hex: string; role: string; name: string }[] | null
    treatment: string
    layout: string
  }>({ direction: null, fonts: null, colors: null, treatment: '', layout: '' })

  const [copied, setCopied] = useState<string>('')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(createClient() as any)
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .maybeSingle()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const r = data.responses

        let direction: BrandDirection | null = null
        let fonts: { headline: string; body: string } | null = null
        let colors: { hex: string; role: string; name: string }[] | null = null

        // Load directions
        if (r.bb_directions_json && r.bb_kit_direction) {
          try {
            const dirs = JSON.parse(r.bb_directions_json) as BrandDirection[]
            direction = dirs.find(d => d.id === r.bb_kit_direction) || null
          } catch { /* ignore */ }
        }

        if (r.bb_kit_fonts) {
          try { fonts = JSON.parse(r.bb_kit_fonts) as { headline: string; body: string } } catch { /* ignore */ }
        }

        if (r.bb_kit_colors) {
          try { colors = JSON.parse(r.bb_kit_colors) as { hex: string; role: string; name: string }[] } catch { /* ignore */ }
        }

        setKit({
          direction,
          fonts,
          colors,
          treatment: r.bb_kit_treatment || '',
          layout: r.bb_kit_layout || '',
        })
      })
    return () => { cancelled = true }
  }, [user])

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 1500)
    })
  }

  const hasKit = kit.direction || kit.fonts || kit.colors

  const responses = {
    bb_kit_direction: kit.direction?.id || '',
    bb_kit_fonts: kit.fonts ? JSON.stringify(kit.fonts) : '',
    bb_kit_colors: kit.colors ? JSON.stringify(kit.colors) : '',
    bb_kit_treatment: kit.treatment,
    bb_kit_layout: kit.layout,
  }

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={responses}
    >
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.5rem' }}>
        Brand Builder — Step 5
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: '1rem' }}>
        Your Brand Kit
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        This is your locked visual system. Use it every time you design a post, shoot a video, build a landing page, or hand off work to a collaborator.
      </p>

      {!hasKit && (
        <div style={{ background: 'var(--orange-tint)', border: '1px solid var(--orange-border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', fontSize: '13px', color: 'var(--dim)' }}>
          Select a brand direction in <strong>Brand Directions</strong> to populate your kit.
        </div>
      )}

      {hasKit && (
        <>
          {/* Direction identity */}
          {kit.direction && (
            <div style={{
              background: 'var(--orange-tint)', border: '1px solid var(--orange-border)',
              borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '6px' }}>
                Your Direction
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px', fontFamily: `'${kit.direction.headlineFont}', serif, sans-serif` }}>
                {kit.direction.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--dim)', fontStyle: 'italic' }}>{kit.direction.tagline}</div>
              <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, marginTop: '8px', marginBottom: 0 }}>{kit.direction.personality}</p>
            </div>
          )}

          {/* Typography */}
          {kit.fonts && (
            <KitBlock title="Typography">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Headline</div>
                  <div style={{ fontSize: '20px', fontFamily: `'${kit.fonts.headline}', serif, sans-serif`, color: 'var(--text)', fontWeight: 700, lineHeight: 1.2, marginBottom: '4px' }}>
                    Your Brand Voice
                  </div>
                  <button
                    onClick={() => copyText(kit.fonts!.headline, 'headline')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '11px', color: copied === 'headline' ? 'var(--green-text)' : 'var(--orange)', fontFamily: 'var(--font)' }}
                  >
                    {copied === 'headline' ? '✓ Copied' : kit.fonts.headline}
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Body</div>
                  <div style={{ fontSize: '14px', fontFamily: `'${kit.fonts.body}', sans-serif`, color: 'var(--dim)', lineHeight: 1.6, marginBottom: '4px' }}>
                    Supporting copy that reads naturally at longer lengths.
                  </div>
                  <button
                    onClick={() => copyText(kit.fonts!.body, 'body')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '11px', color: copied === 'body' ? 'var(--green-text)' : 'var(--orange)', fontFamily: 'var(--font)' }}
                  >
                    {copied === 'body' ? '✓ Copied' : kit.fonts.body}
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--card)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--dimmer)', lineHeight: 1.5 }}>
                Both available on <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Google Fonts</a> — free to use on any platform.
              </div>
            </KitBlock>
          )}

          {/* Color palette */}
          {kit.colors && (
            <KitBlock title="Color Palette">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {kit.colors.map((c, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => copyText(c.hex, `color-${i}`)}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: c.hex, border: '2px solid rgba(255,255,255,.1)', flexShrink: 0 }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--dimmer)' }}>{c.role}</div>
                      <div style={{ fontSize: '10px', fontFamily: 'monospace', color: copied === `color-${i}` ? 'var(--green-text)' : 'var(--orange)' }}>
                        {copied === `color-${i}` ? '✓' : c.hex}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--dimmer)' }}>Click any color to copy the hex code.</div>
            </KitBlock>
          )}

          {/* Image treatment */}
          {kit.treatment && (
            <KitBlock title="Image Treatment">
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{kit.treatment}</div>
              <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>{kit.direction?.treatmentDetails}</p>
            </KitBlock>
          )}

          {/* Layout language */}
          {kit.layout && (
            <KitBlock title="Layout Language">
              <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>{kit.layout}</p>
            </KitBlock>
          )}

          {/* Best for */}
          {kit.direction?.bestFor && (
            <KitBlock title="When to use this system">
              <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>{kit.direction.bestFor}</p>
            </KitBlock>
          )}

          {/* Quick reference card — shareable text */}
          <div style={{ marginTop: '1.5rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--orange)', marginBottom: '10px' }}>
              Quick Reference — Share With Collaborators
            </div>
            <button
              onClick={() => {
                const ref = [
                  `BRAND KIT — ${kit.direction?.name ?? 'My Brand'}`,
                  `Direction: ${kit.direction?.tagline ?? ''}`,
                  '',
                  `FONTS`,
                  `Headline: ${kit.fonts?.headline ?? ''}`,
                  `Body: ${kit.fonts?.body ?? ''}`,
                  '',
                  `COLORS`,
                  ...(kit.colors?.map(c => `${c.name} (${c.role}): ${c.hex}`) ?? []),
                  '',
                  `TREATMENT: ${kit.treatment}`,
                ].join('\n')
                copyText(ref, 'fullkit')
              }}
              style={{
                width: '100%', padding: '10px 20px', borderRadius: '100px',
                background: copied === 'fullkit' ? 'var(--green-text)' : 'var(--surface)',
                color: copied === 'fullkit' ? '#fff' : 'var(--orange)',
                border: copied === 'fullkit' ? 'none' : '2px solid var(--orange)',
                fontSize: '11px', fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
              }}
            >
              {copied === 'fullkit' ? '✓ Copied to Clipboard' : 'Copy Full Brand Kit'}
            </button>
          </div>
        </>
      )}
    </SectionWrapper>
  )
}
