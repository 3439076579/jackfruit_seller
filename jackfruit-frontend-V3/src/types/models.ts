/**
 * 前端领域模型 —— 页面与组件只认这一层。
 *
 * 与 raw.ts 的差异就是 adapters 的全部工作量：
 * - 字段统一 camelCase（category_name → name，management_info → managementInfo）
 * - 语义重命名（jackfruit → product，user → buyer，定位更清楚）
 * - 丢弃前端用不到的字段（DeletedAt、password）
 * - 抹平 ID / CreatedAt 的大小写差异
 *
 * 这样即便将来后端补了 json tag 或换框架，改动也只落在 adapters 里。
 */

export interface User {
  id: number
  username: string
  phone: string
  email: string
  createdAt: string
}

export interface Category {
  id: number
  name: string
  createdAt: string
}

export interface Product {
  id: number
  categoryId: number
  category: Category | null
  name: string
  storage: number
  price: number
  image: string
  managementInfo: string
  feature: string
  plantIntro: string
  createdAt: string
}

export interface Order {
  id: number
  address: string
  total: number
  quantity: number
  product: Product | null
  buyer: User | null
  createdAt: string
}

export interface Review {
  id: number
  userId: number
  productId: number
  rating: number
  content: string
  user: User | null
  createdAt: string
}

export interface Notify {
  id: number
  message: string
  createdAt: string
}

export interface SalesRankingItem {
  productId: number
  productName: string
  totalSales: number
  totalRevenue: number
}

export interface CategoryRevenueItem {
  categoryName: string
  totalRevenue: number
  orderCount: number
}

export interface HighRatingProductItem {
  productId: number
  productName: string
  avgRating: number
  reviewCount: number
}
