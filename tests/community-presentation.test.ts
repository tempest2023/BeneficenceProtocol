import { describe, expect, it } from 'vitest'
import { publicCommunityAudience } from '@/lib/community/presentation'

describe('publicCommunityAudience', () => {
  it('uses a qualitative description through the public threshold', () => {
    expect(publicCommunityAudience(0)).toBe('many active participants')
    expect(publicCommunityAudience(999)).toBe('many active participants')
    expect(publicCommunityAudience(1000)).toBe('many active participants')
  })

  it('publishes a formatted count only above the threshold', () => {
    expect(publicCommunityAudience(1001)).toBe('1,001 people')
    expect(publicCommunityAudience(12500)).toBe('12,500 people')
  })
})
