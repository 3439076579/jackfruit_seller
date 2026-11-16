import type { RawUser } from '@/types/raw'
import type { User } from '@/types/models'

/**
 * RawUser → User
 * - ID / CreatedAt 的大写来自 gorm.Model 无 json tag，这里统一成小写
 * - password 后端会原样返回，前端模型不带它，避免在 store 和 devtools 里裸奔
 */
export function toUser(raw: RawUser): User {
  return {
    id: raw.ID,
    username: raw.username,
    phone: raw.phone,
    email: raw.email,
    createdAt: raw.CreatedAt,
  }
}

export function toUserList(raw: RawUser[]): User[] {
  return raw.map(toUser)
}

export function toNullableUser(raw?: RawUser | null): User | null {
  if (!raw || raw.ID === 0) return null
  return toUser(raw)
}
