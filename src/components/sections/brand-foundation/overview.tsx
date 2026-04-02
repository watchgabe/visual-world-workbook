import { ModuleOverview } from '@/components/workshop/ModuleOverview'

export default function BrandFoundationOverview() {
  return (
    <ModuleOverview
      moduleSlug="brand-foundation"
      moduleNumber="01"
      title="Brand Foundation"
      description="Your Brand Foundation is the strategic bedrock of your entire brand. Everything you build — your visual identity, your content, your business — flows from this. Don't rush it. The creators who do this work are the ones who build brands that last."
      roadmap={[
        { num: '01', slug: 'brand-journey', title: 'Brand Journey', sub: "Where you're going and what you need to do to get there" },
        { num: '02', slug: 'avatar', title: 'Avatar Profile', sub: "Know exactly who you're building for" },
        { num: '03', slug: 'core-mission', title: 'Core Mission', sub: 'Why you do what you do' },
        { num: '04', slug: 'core-values', title: 'Core Values', sub: 'The principles that guide everything' },
        { num: '05', slug: 'content-pillars', title: 'Content Pillars', sub: 'Always know what to talk about' },
        { num: '06', slug: 'origin-story', title: 'Origin Story', sub: 'The journey that makes you relatable' },
        { num: '07', slug: 'brand-vision', title: 'Brand Vision', sub: 'Where your brand is going in 3 years' },
      ]}
    />
  )
}
