export const PUBLIC_MEMBER_COUNT_THRESHOLD = 1000

export function publicCommunityAudience(total: number) {
  return total > PUBLIC_MEMBER_COUNT_THRESHOLD
    ? `${total.toLocaleString('en-US')} people`
    : 'many active participants'
}
