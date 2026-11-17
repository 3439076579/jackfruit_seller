import type { RawOrder } from '@/types/raw'
import type { Order } from '@/types/models'
import { toNullableProduct } from './product'
import { toNullableUser } from './user'

/**
 * Order 的关联字段是 Go 值类型（不是指针），后端没 Preload 时不会返回 null，
 * 而是返回一个 ID = 0 的空对象。所以这里靠 ID 判断有值与否，
 * 否则页面上会渲染出一张"有订单、没商品、没买家"的空白卡片。
 */
export function toOrder(raw: RawOrder): Order {
  return {
    id: raw.ID,
    address: raw.address,
    total: raw.total,
    quantity: raw.quantity,
    product: toNullableProduct(raw.jackfruit),
    buyer: toNullableUser(raw.user),
    createdAt: raw.CreatedAt,
  }
}

export function toOrderList(raw: RawOrder[]): Order[] {
  return raw.map(toOrder)
}
