import { describe, it, expect } from 'vitest'
import {
  LABELS,
  SKIP_KEYS,
  isCCKey,
  igLabel,
  caLabel,
  optLabel,
  prettyKey,
  getLabelForKey,
} from '@/lib/admin/labels'

describe('LABELS', () => {
  it('has brand foundation keys', () => {
    expect(LABELS['q1outcome']).toBe('Desired Outcome')
    expect(LABELS['brandJourneyStmt']).toBe('Brand Journey Statement')
  })

  it('has avatar keys', () => {
    expect(LABELS['av1Age']).toBe('Avatar 1 — Age')
  })
})

describe('SKIP_KEYS', () => {
  it('contains required skip keys', () => {
    expect(SKIP_KEYS.has('cur')).toBe(true)
    expect(SKIP_KEYS.has('done')).toBe(true)
    expect(SKIP_KEYS.has('auditVals')).toBe(true)
    expect(SKIP_KEYS.has('checks')).toBe(true)
    expect(SKIP_KEYS.has('opts')).toBe(true)
    expect(SKIP_KEYS.has('inputs')).toBe(true)
  })
})

describe('getLabelForKey', () => {
  it('returns label for q1outcome', () => {
    expect(getLabelForKey('q1outcome')).toBe('Desired Outcome')
  })

  it('returns label for av1Age', () => {
    expect(getLabelForKey('av1Age')).toBe('Avatar 1 — Age')
  })
})

describe('igLabel', () => {
  it('ig_pillar3 returns Content Pillar 3', () => {
    expect(igLabel('ig_pillar3')).toBe('Content Pillar 3')
  })

  it('ig_p2i3a1 returns Pillar 2 · Idea C · Angle 1', () => {
    expect(igLabel('ig_p2i3a1')).toBe('Pillar 2 · Idea C · Angle 1')
  })

  it('ig_p1i2 returns Pillar 1 — Idea B', () => {
    expect(igLabel('ig_p1i2')).toBe('Pillar 1 — Idea B')
  })
})

describe('caLabel', () => {
  it('ca1name returns Competitor 1 — Name', () => {
    expect(caLabel('ca1name')).toBe('Competitor 1 — Name')
  })

  it("ca2diff returns Competitor 2 — How I'm Different", () => {
    expect(caLabel('ca2diff')).toBe("Competitor 2 — How I'm Different")
  })
})

describe('optLabel', () => {
  it('opt_genre returns Brand Genre', () => {
    expect(optLabel('opt_genre')).toBe('Brand Genre')
  })

  it('opt_mbvibe returns Mood Board Vibe', () => {
    expect(optLabel('opt_mbvibe')).toBe('Mood Board Vibe')
  })
})

describe('prettyKey', () => {
  it('brandJourneyStmt returns Brand Journey Stmt', () => {
    expect(prettyKey('brandJourneyStmt')).toBe('Brand Journey Stmt')
  })
})

describe('isCCKey', () => {
  it('nextStep returns true', () => {
    expect(isCCKey('nextStep')).toBe(true)
  })

  it('ig_p1i2a3 returns true', () => {
    expect(isCCKey('ig_p1i2a3')).toBe(true)
  })

  it('av1Age returns false', () => {
    expect(isCCKey('av1Age')).toBe(false)
  })
})
