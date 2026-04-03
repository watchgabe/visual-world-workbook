import { ModuleOverview } from '@/components/workshop/ModuleOverview'

export default function ContentOverview() {
  return (
    <ModuleOverview
      moduleSlug="content"
      moduleNumber="03"
      title="Create Your Content™"
      description="How to create content that looks premium, builds trust, and gets customers. Each section teaches you the framework, then gives you an exercise to apply it. By the end you'll have a complete personalized content playbook. The creators who win aren't the most talented. They're the most consistent. They understand three things: how to look premium, how to build trust, and how to get customers. This workbook covers all three."
      stats={[
        { num: 10, label: 'PARTS' },
        { num: 24, label: 'EXERCISES' },
      ]}
      roadmap={[
        { num: '01', slug: 'content-strategy', title: 'Content Strategy', sub: 'The framework behind effective content' },
        { num: '02', slug: 'sustainability', title: 'Sustainability', sub: 'Build a system that keeps you consistent' },
        { num: '03', slug: 'sustainability', title: 'Batching System', sub: 'Protect your maker time and create in bulk' },
        { num: '04', slug: 'formats', title: 'Formats', sub: 'Short-form, carousels, and long-form' },
        { num: '05', slug: 'content-system', title: 'Content System', sub: 'The Waterfall Method — one piece, everywhere' },
        { num: '06', slug: 'trust-and-money', title: 'Trust & Money', sub: 'Turn attention into subscribers and buyers' },
        { num: '07', slug: 'trust-and-money', title: 'Idea Generation', sub: 'Turn one topic into dozens of content ideas' },
        { num: '08', slug: 'trust-and-money', title: 'Storytelling', sub: 'Capture attention and build belief' },
        { num: '09', slug: 'content-system', title: 'Starter Kit', sub: 'The gear that gives you professional results' },
        { num: '10', slug: 'cinematic-content', title: 'Cinematic Content', sub: 'Shots, angles, B-roll, and premium visuals' },
      ]}
    />
  )
}
