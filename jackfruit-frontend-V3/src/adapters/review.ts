import type { RawReview } from '@/types/raw'
import type { Review } from '@/types/models'
import { toNullableUser } from './user'

export function toReview(raw: RawReview): Review {
  return {
    id: raw.ID,
    userId: raw.user_id,
    productId: raw.jackfruit_id,
    rating: raw.rating,
    content: raw.content,
    user: toNullableUser(raw.user),
    createdAt: raw.CreatedAt,
  }
}

export function toReviewList(raw: RawReview[]): Review[] {
  return raw.map(toReview)
}
