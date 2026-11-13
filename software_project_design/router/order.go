package router

import (
	"github.com/gin-gonic/gin"
	"software_project_design/controller"
	"software_project_design/middleware"
)

type OrderGroup struct{}

func (o OrderGroup) register(e *gin.Engine) {
	group := e.Group("/order", middleware.Cors)
	{
		group.GET("/order_list", controller.Api.GetOrderList)
		group.POST("/create", controller.Api.CreateOrder)
		group.GET("/personal", controller.Api.GetPersonalOrder)
	}
}
