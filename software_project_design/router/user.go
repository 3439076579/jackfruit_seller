package router

import (
	"github.com/gin-gonic/gin"
	"software_project_design/controller"
	"software_project_design/middleware"
)

type UserGroup struct{}

func (user *UserGroup) register(engine *gin.Engine) {
	group := engine.Group("/user", middleware.Cors)
	{
		group.POST("/register", controller.Api.Register)
		group.POST("/login", controller.Api.Login)
		group.POST("/update_user", controller.Api.UpdateUser)
		group.GET("/user_list", controller.Api.GetUsers)
		group.GET("/user", controller.Api.GetUser)
		group.POST("/delete", controller.Api.DeleteUser)
		group.POST("/update_id", controller.Api.UpdateUserById)
		group.POST("/add", controller.Api.AddUser)
		group.GET("/delete", controller.Api.DeleteUser)
	}
}
