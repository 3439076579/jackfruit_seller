import { get, postForm } from '@/utils/request'
import { toNotify, toNullableNotify } from '@/adapters/notify'
import type { Notify } from '@/types/models'
import type { RawNotify } from '@/types/raw'

/**
 * notify 表为空时后端返回 status_code = -1，
 * 这是"还没有任何公告"的正常空态，用 silent 吞掉错误提示。
 */
export const fetchLastNotify = async (): Promise<Notify | null> => {
  try {
    const raw = await get<RawNotify>('/notify/last', undefined, { silent: true })
    return toNullableNotify(raw)
  } catch {
    return null
  }
}

export const publishNotify = (message: string): Promise<Notify> =>
  postForm<RawNotify>('/notify/add', { message }).then(toNotify)
