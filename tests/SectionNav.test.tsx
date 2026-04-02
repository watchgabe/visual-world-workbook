import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionNav } from '../src/components/workshop/SectionNav'

const sections = [
  { name: 'Values', complete: true },
  { name: 'Mission', complete: false },
  { name: 'Vision', complete: false },
]

describe('SectionNav', () => {
  it('renders a button for each section', () => {
    render(<SectionNav sections={sections} activeIndex={1} onSectionChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(screen.getByText('Values')).toBeInTheDocument()
    expect(screen.getByText('Mission')).toBeInTheDocument()
    expect(screen.getByText('Vision')).toBeInTheDocument()
  })

  it('active tab (Mission, index 1) has orange-tint background', () => {
    render(<SectionNav sections={sections} activeIndex={1} onSectionChange={() => {}} />)
    const missionBtn = screen.getByText('Mission').closest('button')
    expect(missionBtn).toHaveStyle({ background: 'var(--orange-tint)' })
  })

  it('completed tab (Values) has green-bg background', () => {
    render(<SectionNav sections={sections} activeIndex={1} onSectionChange={() => {}} />)
    const valuesBtn = screen.getByText('Values').closest('button')
    expect(valuesBtn).toHaveStyle({ background: 'var(--green-bg)' })
  })

  it('inactive incomplete tab (Vision) has transparent background', () => {
    render(<SectionNav sections={sections} activeIndex={1} onSectionChange={() => {}} />)
    const visionBtn = screen.getByText('Vision').closest('button')
    expect(visionBtn).toHaveStyle({ background: 'transparent' })
  })

  it('calls onSectionChange with correct index when tab clicked', async () => {
    const user = userEvent.setup()
    const onSectionChange = vi.fn()
    render(<SectionNav sections={sections} activeIndex={1} onSectionChange={onSectionChange} />)
    await user.click(screen.getByText('Vision'))
    expect(onSectionChange).toHaveBeenCalledWith(2)
  })

  it('completed tab contains a checkmark SVG indicator', () => {
    const { container } = render(
      <SectionNav sections={sections} activeIndex={1} onSectionChange={() => {}} />
    )
    // The Values button (completed) should have an SVG checkmark
    const valuesBtn = screen.getByText('Values').closest('button')
    const checkSvg = valuesBtn?.querySelector('svg')
    expect(checkSvg).toBeInTheDocument()
  })

  it('tabs have pill shape (borderRadius: 20px)', () => {
    render(<SectionNav sections={sections} activeIndex={1} onSectionChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveStyle({ borderRadius: '20px' })
    })
  })
})
