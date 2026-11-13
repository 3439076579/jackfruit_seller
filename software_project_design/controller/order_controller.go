package controller

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"software_project_design/model"
	"software_project_design/service"
	"strconv"
)

type orderController struct{}

func (o *orderController) CreateOrder(ctx *gin.Context) {

	var order *model.OrderModel = new(model.OrderModel)

	id, _ := strconv.ParseUint(ctx.PostForm("user_id"), 10, 64)
	order.OrderUserId = uint(id)
	id, _ = strconv.ParseUint(ctx.PostForm("jackfruit_id"), 10, 64)
	order.JackfruitId = uint(id)
	order.UserAddress = ctx.PostForm("address")
	order.Quantity, _ = strconv.ParseUint(ctx.PostForm("quantity"), 10, 64)
	order.TotalCost, _ = strconv.ParseFloat(ctx.PostForm("total"), 64)

	_, err := service.ServiceApi.CreateOrderService(order)
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
		Data:    order,
	})
}
func (o *orderController) GetOrderList(ctx *gin.Context) {
	orders, err := service.ServiceApi.GetOrderListService()
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
		Data:    orders,
	})
}
func (o *orderController) GetPersonalOrder(ctx *gin.Context) {

	id, _ := strconv.ParseUint(ctx.Query("user_id"), 10, 64)
	orders, err := service.ServiceApi.GetPersonalOrders(uint(id))
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
		Data:    orders,
	})
}
