import type { RawCategoryRevenue, RawHighRatingProduct, RawSalesRanking } from '@/types/raw'
import type { CategoryRevenueItem, HighRatingProductItem, SalesRankingItem } from '@/types/models'

export function toSalesRankingList(raw: RawSalesRanking[]): SalesRankingItem[] {
  return raw.map((item) => ({
    productId: item.jackfruit_id,
    productName: item.product_name,
    totalSales: item.total_sales,
    totalRevenue: item.total_revenue,
  }))
}

export function toCategoryRevenueList(raw: RawCategoryRevenue[]): CategoryRevenueItem[] {
  return raw.map((item) => ({
    categoryName: item.category_name,
    totalRevenue: item.total_revenue,
    orderCount: item.order_count,
  }))
}

export function toHighRatingList(raw: RawHighRatingProduct[]): HighRatingProductItem[] {
  return raw.map((item) => ({
    productId: item.product_id,
    productName: item.product_name,
    avgRating: item.avg_rating,
    reviewCount: item.review_count,
  }))
}
