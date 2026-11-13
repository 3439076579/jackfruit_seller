package controller

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"software_project_design/model"
	"software_project_design/service"
)

type notifyController struct{}

func (n *notifyController) AddMessage(c *gin.Context) {
	var notify = new(model.NotifyModel)
	notify.Message = c.PostForm("message")
	if notify.Message == "" {
		return
	}
	_, err := service.ServiceApi.AddMessageService(notify)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    notify,
	})
}
func (n *notifyController) GetLastNotify(ctx *gin.Context) {
	notify, err := service.ServiceApi.GetLastNotifyService()
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
		Data:    notify,
	})
}
