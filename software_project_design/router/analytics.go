package router

import (
	"software_project_design/controller"
	"software_project_design/middleware"

	"github.com/gin-gonic/gin"
)

type AnalyticsGroup struct{}

func (a *AnalyticsGroup) register(engine *gin.Engine) {
	group := engine.Group("/analytics", middleware.Cors)
	{
		group.GET("/sales_ranking", controller.Api.GetSalesRanking)
		group.GET("/category_revenue", controller.Api.GetCategoryRevenue)
		group.GET("/high_rating", controller.Api.GetHighRatingProducts)
	}
}
