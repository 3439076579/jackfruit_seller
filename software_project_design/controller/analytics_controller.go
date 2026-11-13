package controller

import (
	"log"
	"net/http"
	"software_project_design/model"
	"software_project_design/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type analyticsController struct{}

func (a *analyticsController) GetSalesRanking(ctx *gin.Context) {
	rankings, err := service.ServiceApi.GetSalesRankingService()
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    rankings,
	})
}

func (a *analyticsController) GetCategoryRevenue(ctx *gin.Context) {
	revenues, err := service.ServiceApi.GetCategoryRevenueService()
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    revenues,
	})
}

func (a *analyticsController) GetHighRatingProducts(ctx *gin.Context) {
	minRating, err := strconv.ParseFloat(ctx.DefaultQuery("min_rating", "4"), 64)
	if err != nil {
		minRating = 4
	}
	products, err := service.ServiceApi.GetHighRatingProductsService(minRating)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    products,
	})
}
