import { get } from '@/utils/request'
import {
  toCategoryRevenueList,
  toHighRatingList,
  toSalesRankingList,
} from '@/adapters/analytics'
import type { CategoryRevenueItem, HighRatingProductItem, SalesRankingItem } from '@/types/models'
import type { RawCategoryRevenue, RawHighRatingProduct, RawSalesRanking } from '@/types/raw'

export const fetchSalesRanking = (): Promise<SalesRankingItem[]> =>
  get<RawSalesRanking[]>('/analytics/sales_ranking').then(toSalesRankingList)

export const fetchCategoryRevenue = (): Promise<CategoryRevenueItem[]> =>
  get<RawCategoryRevenue[]>('/analytics/category_revenue').then(toCategoryRevenueList)

export const fetchHighRating = (minRating = 4): Promise<HighRatingProductItem[]> =>
  get<RawHighRatingProduct[]>('/analytics/high_rating', { min_rating: minRating }).then(
    toHighRatingList,
  )
