import { render, screen } from '@testing-library/react'
import { ProgressRing } from '../src/components/workshop/ProgressRing'

const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

describe('ProgressRing', () => {
  it('renders SVG element with width="44" height="44"', () => {
    const { container } = render(<ProgressRing percent={50} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '44')
    expect(svg).toHaveAttribute('height', '44')
  })

  it('renders track circle with stroke="var(--border2)"', () => {
    const { container } = render(<ProgressRing percent={50} />)
    const circles = container.querySelectorAll('circle')
    // First circle is the track
    expect(circles[0]).toHaveAttribute('stroke', 'var(--border2)')
  })

  it('renders fill circle with stroke="var(--orange)"', () => {
    const { container } = render(<ProgressRing percent={50} />)
    const circles = container.querySelectorAll('circle')
    // Second circle is the fill
    expect(circles[1]).toHaveAttribute('stroke', 'var(--orange)')
  })

  it('at 0% the fill circle has strokeDashoffset equal to circumference', () => {
    const { container } = render(<ProgressRing percent={0} />)
    const circles = container.querySelectorAll('circle')
    const fillCircle = circles[1]
    const offset = parseFloat(fillCircle.getAttribute('stroke-dashoffset') || '0')
    expect(offset).toBeCloseTo(CIRCUMFERENCE, 1)
  })

  it('at 100% the fill circle has strokeDashoffset of 0', () => {
    const { container } = render(<ProgressRing percent={100} />)
    const circles = container.querySelectorAll('circle')
    const fillCircle = circles[1]
    const offset = parseFloat(fillCircle.getAttribute('stroke-dashoffset') || '-1')
    expect(offset).toBe(0)
  })

  it('at 50% the fill circle has strokeDashoffset of approximately half circumference', () => {
    const { container } = render(<ProgressRing percent={50} />)
    const circles = container.querySelectorAll('circle')
    const fillCircle = circles[1]
    const offset = parseFloat(fillCircle.getAttribute('stroke-dashoffset') || '0')
    expect(offset).toBeCloseTo(CIRCUMFERENCE / 2, 1)
  })

  it('renders text element showing the percent number', () => {
    render(<ProgressRing percent={73} />)
    expect(screen.getByText('73%')).toBeInTheDocument()
  })

  it('has role="img" and aria-label with completion info', () => {
    const { container } = render(<ProgressRing percent={42} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', '42% complete')
  })
})
