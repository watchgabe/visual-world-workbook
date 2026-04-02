import { ModuleOverview } from '@/components/workshop/ModuleOverview'

export default function LaunchOverview() {
  return (
    <ModuleOverview
      moduleSlug="launch"
      moduleNumber="04"
      title="Launch™"
      description="Now it's time to build the infrastructure that turns attention into subscribers and subscribers into buyers — then announce your brand to the world with clarity and momentum. You don't own your audience. Every follower you have lives on a platform that can change its algorithm, ban your account, or disappear entirely. This module is how you fix that."
      stats={[
        { num: 7, label: 'WORKSHOPS' },
        { num: 7, label: 'DELIVERABLES' },
      ]}
      roadmap={[
        { num: '01', slug: 'bio', title: 'Bio', sub: 'Turn your profile into a conversion tool' },
        { num: '02', slug: 'funnel', title: 'Your Funnel', sub: 'Map the path from attention to customer' },
        { num: '03', slug: 'manychat', title: 'ManyChat & Newsletter', sub: 'Build the infrastructure you actually own' },
        { num: '04', slug: 'lead-magnet', title: 'Lead Magnet', sub: 'Create the offer that earns the opt-in' },
        { num: '05', slug: 'launch-content', title: 'Launch Content', sub: 'Three pinned videos that build your brand 24/7' },
        { num: '06', slug: 'goals', title: '90-Day Goals', sub: 'Set and track your 90-day growth targets' },
      ]}
    />
  )
}
