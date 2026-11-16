import type { RawNotify } from '@/types/raw'
import type { Notify } from '@/types/models'

/**
 * 全项目唯一一个 PascalCase 的自定义业务字段。
 * 旧前端就是这么取的：result.data.data.Message —— 不是写错。
 */
export function toNotify(raw: RawNotify): Notify {
  return {
    id: raw.ID,
    message: raw.Message,
    createdAt: raw.CreatedAt,
  }
}

export function toNullableNotify(raw?: RawNotify | null): Notify | null {
  if (!raw || raw.ID === 0) return null
  return toNotify(raw)
}
