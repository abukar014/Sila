export type InsightsProvider = {
  id: string
  verified_date: string | null
  scheduling_url: string | null
  specialties: string[] | null
  languages: string[] | null
  faith_approach: string | null
  telehealth: boolean
  in_person: boolean
  sliding_scale: boolean
  photo_url: string | null
  bio: string | null
  credentials: string | null
  license_type: string | null
}

export function is30DaysActive(verifiedDate: string | null): boolean {
  if (!verifiedDate) return false
  return Date.now() - new Date(verifiedDate).getTime() >= 30 * 24 * 60 * 60 * 1000
}

export function buildDiscoverabilityTags(p: InsightsProvider): string[] {
  const tags: string[] = []
  if (p.faith_approach) tags.push(p.faith_approach)
  p.languages?.forEach(l => tags.push(l))
  p.specialties?.slice(0, 4).forEach(s => tags.push(s))
  if (p.telehealth) tags.push('Telehealth')
  if (p.in_person)  tags.push('In-person')
  if (p.sliding_scale) tags.push('Sliding scale')
  return tags.filter(Boolean).slice(0, 8)
}

export function calcCompleteness(p: InsightsProvider): { score: number; gaps: string[] } {
  const checks = [
    { label: 'Upload a profile photo',  ok: !!p.photo_url },
    { label: 'Add a bio',               ok: !!p.bio },
    { label: 'Add a scheduling link',   ok: !!p.scheduling_url },
    { label: 'Add your specialties',    ok: (p.specialties?.length ?? 0) >= 2 },
    { label: 'Add languages you speak', ok: (p.languages?.length ?? 0) > 0 },
    { label: 'Add your faith approach', ok: !!p.faith_approach },
    { label: 'Add your credentials',    ok: !!(p.credentials || p.license_type) },
  ]
  const filled = checks.filter(c => c.ok).length
  return {
    score: Math.round((filled / checks.length) * 100),
    gaps:  checks.filter(c => !c.ok).map(c => c.label),
  }
}
