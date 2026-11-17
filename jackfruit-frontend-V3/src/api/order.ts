import { get, postForm } from '@/utils/request'
import { toOrder, toOrderList } from '@/adapters/order'
import type { Order } from '@/types/models'
import type { RawOrder } from '@/types/raw'

export interface CreateOrderPayload {
  userId: number
  productId: number
  address: string
  quantity: number
  /**
   * 后端不做任何金额校验，total 算多少就存多少（旧前端写的是 quantity × price）。
   * 这里由调用方传入并保持同一公式，否则统计报表会与历史订单对不上。
   */
  total: number
}

export const createOrder = (payload: CreateOrderPayload): Promise<Order> =>
  postForm<RawOrder>('/order/create', {
    user_id: payload.userId,
    jackfruit_id: payload.productId,
    address: payload.address,
    quantity: payload.quantity,
    total: payload.total,
  }).then(toOrder)

export const fetchAllOrders = (): Promise<Order[]> =>
  get<RawOrder[]>('/order/order_list').then(toOrderList)

export const fetchMyOrders = (userId: number): Promise<Order[]> =>
  get<RawOrder[]>('/order/personal', { user_id: userId }).then(toOrderList)
