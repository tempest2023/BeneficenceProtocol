import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, placeholder: _placeholder, fetchPriority: _fetchPriority, ...props }: {
    src: string | { src: string }
    alt: string
    fill?: boolean
    placeholder?: string
    fetchPriority?: string
  }) => <img src={typeof src === 'string' ? src : src.src} alt={alt} {...props} />,
}))

import ErrorPage from '@/app/error'
import Loading from '@/app/loading'
import NotFound from '@/app/not-found'

describe('public system pages', () => {
  it('presents an independent San Francisco loading artwork as an indeterminate status', () => {
    const { container } = render(<Loading />)

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'Bringing the next page into view.' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading page')
    expect(screen.getByText(/San Francisco \/ Ferry Building/)).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('system-loading-ferry'))
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('uses a dedicated Los Angeles composition for a recoverable 404', () => {
    const { container } = render(<NotFound />)

    expect(screen.getByRole('heading', { name: 'We couldn’t find that page.' })).toBeInTheDocument()
    expect(screen.getByText(/Los Angeles \/ Bradbury Building/)).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('system-not-found-bradbury'))
    expect(screen.getByRole('link', { name: /Return home/ })).toHaveAttribute('href', '/')
  })

  it('retries runtime errors through the current Next.js recovery API', () => {
    const retry = vi.fn()
    render(<ErrorPage error={new Error('temporary')} retry={retry} />)

    fireEvent.click(screen.getByRole('button', { name: /Try again/ }))
    expect(retry).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: 'This page couldn’t be loaded.' })).toBeInTheDocument()
    expect(screen.getByText(/Los Angeles \/ Sixth Street Viaduct/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/')
  })
})
