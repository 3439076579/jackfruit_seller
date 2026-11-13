package main

import (
	"github.com/gin-gonic/gin"
	"software_project_design/global"
	"software_project_design/middleware"
	"software_project_design/router"
)

func main() {
	engine := gin.Default()

	router.InitRouter(engine)

	engine.Use(middleware.Cors)

	global.GlobalInit()
	defer global.ShutDown()

	engine.Run("localhost:8082")

}
