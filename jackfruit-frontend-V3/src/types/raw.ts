/**
 * 后端原始契约 —— 与 Go model 的 json tag 逐字段对应。
 *
 * 两条硬规则：
 * 1. 不要为了前端好写而在此改名。这一层的唯一职责是"如实描述后端吐了什么"。
 * 2. 命名有两种风格并存，这是后端既有事实，不是笔误：
 *    - 显式写了 json tag 的字段 → 小写 / snake_case，如 category_name、plant_intro
 *    - gorm.Model 的四个字段和 NotifyModel.Message 没写 tag → Go 导出字段名原样输出
 *      即 ID、CreatedAt、UpdatedAt、DeletedAt、Message
 *    src/adapters/ 负责把这两种风格统一成前端模型。
 */

/** gorm.Model 内嵌字段的公共部分（无 json tag → PascalCase） */
interface GormMeta {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  /** gorm.DeletedAt 零值序列化为 { Time, Valid }，前端用不到 */
  DeletedAt?: unknown
}

export interface RawUser extends GormMeta {
  username: string
  password: string
  phone: string
  email: string
}

export interface RawCategory extends GormMeta {
  category_name: string
}

export interface RawProduct extends GormMeta {
  category_id: number
  category?: RawCategory | null
  name: string
  storage: number
  price: number
  image: string
  management_info: string
  feature: string
  plant_intro: string
}

export interface RawOrder extends GormMeta {
  /** json:"user"，值类型而非指针：未 Preload 时是零值对象，ID 为 0 */
  user: RawUser
  address: string
  total: number
  quantity: number
  /** json:"jackfruit"，同上 */
  jackfruit: RawProduct
}

export interface RawReview extends GormMeta {
  user_id: number
  jackfruit_id: number
  rating: number
  content: string
  /** json:"user"，指针，未 Preload 时为 null */
  user?: RawUser | null
}

export interface RawNotify extends GormMeta {
  /** 无 json tag，前端旧代码就是读 result.data.data.Message */
  Message: string
}

/** 统计分析：这三个是 service 层的聚合结构体，字段本身就有 tag */
export interface RawSalesRanking {
  jackfruit_id: number
  product_name: string
  total_sales: number
  total_revenue: number
}

export interface RawCategoryRevenue {
  category_name: string
  total_revenue: number
  order_count: number
}

export interface RawHighRatingProduct {
  product_id: number
  product_name: string
  avg_rating: number
  review_count: number
}
