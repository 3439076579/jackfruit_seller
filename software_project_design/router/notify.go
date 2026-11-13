package router

import (
	"github.com/gin-gonic/gin"
	"software_project_design/controller"
	"software_project_design/middleware"
)

type NotifyGroup struct{}

func (j NotifyGroup) register(e *gin.Engine) {
	group := e.Group("/notify", middleware.Cors)
	{
		group.POST("/add", controller.Api.AddMessage)
		group.GET("/last", controller.Api.GetLastNotify)
	}
}
