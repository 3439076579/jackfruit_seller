import type { RawCategory } from '@/types/raw'
import type { Category } from '@/types/models'

export function toCategory(raw: RawCategory): Category {
  return {
    id: raw.ID,
    name: raw.category_name,
    createdAt: raw.CreatedAt,
  }
}

export function toCategoryList(raw: RawCategory[]): Category[] {
  return raw.map(toCategory)
}

export function toNullableCategory(raw?: RawCategory | null): Category | null {
  if (!raw || raw.ID === 0) return null
  return toCategory(raw)
}
