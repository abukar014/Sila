export type Provider = {
  id: string
  slug: string
  name: string
  license_type: string | null
  credentials: string | null
  state: string | null
  specialties: string[] | null
  approaches: string[] | null
  identity: string[] | null
  faith_approach: string | null
  languages: string[] | null
  bio: string | null
  pull_quote: string | null
  scheduling_url: string | null
  insurances: string[] | null
  fee_individual: string | null
  fee_couples: string | null
  fee_initial: string | null
  visit_type: string | null
  telehealth: boolean | null
  in_person: boolean | null
  photo_url: string | null
  accepting_clients: boolean | null
  verified_date: string | null
  gender: string | null
  sliding_scale?: boolean
  age_groups?: string[] | null
}

export function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export function modalityLabel(p: Pick<Provider, 'visit_type' | 'telehealth' | 'in_person'>) {
  const both = p.telehealth && p.in_person
  const tele = p.telehealth && !p.in_person
  const inperson = !p.telehealth && p.in_person
  if (both || p.visit_type === 'Both') return 'Telehealth + In-person'
  if (inperson || p.visit_type === 'In-person') return 'In-person'
  return 'Telehealth'
}

export function toArr(val: unknown): string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

export const AVATAR_COLORS = [
  '#3F6A58', '#4A5A7A', '#7A5A5A', '#5A6A4A', '#6A5A7A', '#4A6A6A',
]
export function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
