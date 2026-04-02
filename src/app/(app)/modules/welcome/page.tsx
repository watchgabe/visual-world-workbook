'use client'

import { useState } from 'react'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionNav } from '@/components/workshop/SectionNav'
import { ProgressRing } from '@/components/workshop/ProgressRing'

export default function WelcomeDemoPage() {
  const [textareaValue, setTextareaValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [activeSection, setActiveSection] = useState(1)

  const sections = [
    { name: 'Values', complete: true },
    { name: 'Mission', complete: false },
    { name: 'Vision', complete: false },
  ]

  const styleOptions = [
    { label: 'Minimalist', value: 'minimalist' },
    { label: 'Bold', value: 'bold' },
    { label: 'Playful', value: 'playful' },
    { label: 'Elegant', value: 'elegant' },
  ]

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '8px',
        }}
      >
        Workshop Components Demo
      </h1>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--dim)',
          marginBottom: '2rem',
        }}
      >
        Visual verification checkpoint — check that all components match old app styling in both
        themes.
      </p>

      {/* ProgressRing */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--dimmer)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          ProgressRing
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ProgressRing percent={65} />
          <ProgressRing percent={0} />
          <ProgressRing percent={100} />
        </div>
      </section>

      {/* SectionNav */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--dimmer)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          SectionNav
        </h2>
        <SectionNav
          sections={sections}
          activeIndex={activeSection}
          onSectionChange={setActiveSection}
        />
      </section>

      {/* WorkshopTextarea */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--dimmer)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          WorkshopTextarea
        </h2>
        <WorkshopTextarea
          moduleSlug="welcome"
          fieldKey="brand_vision"
          value={textareaValue}
          onChange={setTextareaValue}
          placeholder="Describe your brand vision..."
          label="Brand Vision"
        />
        <WorkshopTextarea
          moduleSlug="welcome"
          fieldKey="no_label"
          value=""
          onChange={() => {}}
          placeholder="No label textarea..."
        />
      </section>

      {/* WorkshopInput */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--dimmer)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          WorkshopInput
        </h2>
        <WorkshopInput
          moduleSlug="welcome"
          fieldKey="brand_name"
          value={inputValue}
          onChange={setInputValue}
          placeholder="Brand name"
          label="Brand Name"
        />
        <WorkshopInput
          moduleSlug="welcome"
          fieldKey="tagline"
          value=""
          onChange={() => {}}
          placeholder="Tagline (no label)..."
        />
      </section>

      {/* OptionSelector */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--dimmer)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          OptionSelector
        </h2>
        <OptionSelector
          moduleSlug="welcome"
          fieldKey="visual_style"
          value={selectedStyle}
          onChange={setSelectedStyle}
          options={styleOptions}
          label="Visual Style"
        />
      </section>
    </div>
  )
}
