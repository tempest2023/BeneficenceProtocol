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
  it('presents the San Francisco loading artwork as an indeterminate status', () => {
    const { container } = render(<Loading />)

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'Preparing the public record…' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Gathering the public view')
    expect(screen.getByText(/San Francisco \/ Golden Gate Bridge/)).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('uses the shared Los Angeles composition for a recoverable 404', () => {
    render(<NotFound />)

    expect(screen.getByRole('heading', { name: 'This page is outside the public record.' })).toBeInTheDocument()
    expect(screen.getByText(/Los Angeles \/ Griffith Observatory/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Return home/ })).toHaveAttribute('href', '/')
  })

  it('retries runtime errors through the current Next.js recovery API', () => {
    const retry = vi.fn()
    render(<ErrorPage error={new Error('temporary')} retry={retry} />)

    fireEvent.click(screen.getByRole('button', { name: /Try again/ }))
    expect(retry).toHaveBeenCalledOnce()
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/')
  })
})
