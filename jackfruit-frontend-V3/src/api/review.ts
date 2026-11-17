import { get, postForm } from '@/utils/request'
import { toReview, toReviewList } from '@/adapters/review'
import type { Review } from '@/types/models'
import type { RawReview } from '@/types/raw'

export const fetchReviews = (productId: number): Promise<Review[]> =>
  get<RawReview[]>('/review/list', { jackfruit_id: productId }).then(toReviewList)

export interface ReviewPayload {
  userId: number
  productId: number
  /** 后端校验区间 1–5，越界返回 -1 */
  rating: number
  content: string
}

/** 同一用户对同一商品只能评价一次，靠 review 表的联合唯一索引兜底 */
export const addReview = (payload: ReviewPayload): Promise<Review> =>
  postForm<RawReview>('/review/add', {
    user_id: payload.userId,
    jackfruit_id: payload.productId,
    rating: payload.rating,
    content: payload.content,
  }).then(toReview)
