package router

import (
	"github.com/gin-gonic/gin"
)

type router interface {
	register(e *gin.Engine)
}
type Router struct {
	UserGroup
	JackfruitGroup
	OrderGroup
	NotifyGroup
	AnalyticsGroup
	ReviewGroup
}

func InitRouter(engine *gin.Engine) {
	var r = new(Router)
	r.UserGroup.register(engine)
	r.JackfruitGroup.register(engine)
	r.OrderGroup.register(engine)
	r.NotifyGroup.register(engine)
	r.AnalyticsGroup.register(engine)
	r.ReviewGroup.register(engine)
	engine.Static("/static/", "./data/")
	//engine.Group("*", middleware.Cors)
}
