package router

import (
	"github.com/gin-gonic/gin"
	"software_project_design/controller"
	"software_project_design/middleware"
)

type JackfruitGroup struct{}

func (j JackfruitGroup) register(e *gin.Engine) {
	group := e.Group("/jackfruit", middleware.Cors)
	{
		group.POST("/add", controller.Api.AddProduct)
		group.POST("/update", controller.Api.UpdateProduct)
		group.GET("/list", controller.Api.GetAllProducts)
		group.GET("/delete", controller.Api.DeleteJackfruit)
	}
}
