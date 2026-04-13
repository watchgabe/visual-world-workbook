import { ModuleOverview } from '@/components/workshop/ModuleOverview'

export default function VisualWorldOverview() {
  return (
    <ModuleOverview
      moduleSlug="visual-world"
      moduleNumber="02"
      title="Define Your Visual World™"
      description="You can watch 10 seconds of a Wes Anderson film and know it's Wes Anderson. You can watch Christopher Nolan and immediately feel the weight of his world — the lighting, the atmosphere, the gravity. Your brand should work the same way. This module is about building that world: a visual identity so consistent and intentional that someone knows it's you before they see your face or read your name."
      roadmap={[
        { num: '01', slug: 'creator-analysis', title: 'Creator Analysis', sub: 'Study what premium looks like in your space' },
        { num: '02', slug: 'color-palette', title: 'Mood Board & Color Palette', sub: 'Gather inspiration and build your visual language' },
        { num: '03', slug: 'typography', title: 'Typography', sub: 'Define your typographic voice' },
        { num: '04', slug: 'shot-system', title: 'Your Perspective', sub: 'Setting, mood, design details, and your visual narrative' },
        { num: '05', slug: 'visual-world-doc', title: 'Visual World Doc', sub: 'Your compiled visual identity document' },
      ]}
    />
  )
}
