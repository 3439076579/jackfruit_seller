package service

import (
	"software_project_design/global"
	"software_project_design/model"
)

type AnalyticsService struct{}

type SalesRanking struct {
	JackfruitId  uint    `json:"jackfruit_id"`
	ProductName  string  `json:"product_name"`
	TotalSales   uint64  `json:"total_sales"`
	TotalRevenue float64 `json:"total_revenue"`
}

type CategoryRevenue struct {
	CategoryName string  `json:"category_name"`
	TotalRevenue float64 `json:"total_revenue"`
	OrderCount   int64   `json:"order_count"`
}

type HighRatingProduct struct {
	ProductId   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	AvgRating   float64 `json:"avg_rating"`
	ReviewCount int64   `json:"review_count"`
}

func (a *AnalyticsService) GetSalesRankingService() ([]*SalesRanking, error) {
	var rankings []*SalesRanking
	err := global.GlobalDB.Model(&model.OrderModel{}).
		Select("orders.jackfruit_id, jackfruit.product_name, SUM(orders.quantity) AS total_sales, SUM(orders.total_cost) AS total_revenue").
		Joins("JOIN jackfruit ON jackfruit.id = orders.jackfruit_id").
		Where("orders.deleted_at IS NULL").
		Group("orders.jackfruit_id, jackfruit.product_name").
		Order("total_sales DESC").
		Limit(10).
		Scan(&rankings).Error
	return rankings, err
}

func (a *AnalyticsService) GetCategoryRevenueService() ([]*CategoryRevenue, error) {
	var revenues []*CategoryRevenue
	err := global.GlobalDB.Model(&model.OrderModel{}).
		Select("category.category_name, SUM(orders.total_cost) AS total_revenue, COUNT(*) AS order_count").
		Joins("JOIN jackfruit ON jackfruit.id = orders.jackfruit_id").
		Where("orders.deleted_at IS NULL").
		Joins("JOIN category ON category.id = jackfruit.category_id").
		Group("category.category_name").
		Order("total_revenue DESC").
		Scan(&revenues).Error
	return revenues, err
}

func (a *AnalyticsService) GetHighRatingProductsService(minRating float64) ([]*HighRatingProduct, error) {
	var products []*HighRatingProduct
	err := global.GlobalDB.Model(&model.ReviewModel{}).
		Select("review.jackfruit_id AS product_id, jackfruit.product_name, AVG(review.rating) AS avg_rating, COUNT(*) AS review_count").
		Joins("JOIN jackfruit ON jackfruit.id = review.jackfruit_id").
		Group("review.jackfruit_id, jackfruit.product_name").
		Having("AVG(review.rating) >= ?", minRating).
		Order("avg_rating DESC").
		Scan(&products).Error
	return products, err
}
