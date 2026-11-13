package router

import (
	"software_project_design/controller"
	"software_project_design/middleware"

	"github.com/gin-gonic/gin"
)

type ReviewGroup struct{}

func (r ReviewGroup) register(e *gin.Engine) {
	group := e.Group("/review", middleware.Cors)
	{
		group.GET("/list", controller.Api.GetReviews)
		group.POST("/add", controller.Api.AddReview)
	}
}
