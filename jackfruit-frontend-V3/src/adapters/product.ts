import type { RawProduct } from '@/types/raw'
import type { Product } from '@/types/models'
import { toNullableCategory } from './category'

/**
 * 注意语义重命名：后端叫 jackfruit（波罗蜜），前端统一叫 product。
 * 商品即波罗蜜，只是领域语汇更通用，避免组件里出现 "杰克果" 这类直译。
 */
export function toProduct(raw: RawProduct): Product {
  return {
    id: raw.ID,
    categoryId: raw.category_id,
    category: toNullableCategory(raw.category),
    name: raw.name,
    storage: raw.storage,
    price: raw.price,
    image: raw.image,
    managementInfo: raw.management_info,
    feature: raw.feature,
    plantIntro: raw.plant_intro,
    createdAt: raw.CreatedAt,
  }
}

export function toProductList(raw: RawProduct[]): Product[] {
  return raw.map(toProduct)
}

/** 关联字段是值类型时，未 Preload 会得到全零对象，用 ID 判断而不是判空 */
export function toNullableProduct(raw?: RawProduct | null): Product | null {
  if (!raw || raw.ID === 0) return null
  return toProduct(raw)
}
