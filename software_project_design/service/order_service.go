package service

import (
	"errors"
	"software_project_design/global"
	"software_project_design/model"
)

type OrderService struct{}

func (o *OrderService) GetOrderListService() ([]*model.OrderModel, error) {
	var orders []*model.OrderModel
	err := global.GlobalDB.Preload("Jackfruit").Find(&orders).Error
	return orders, err
}
func (o *OrderService) CreateOrderService(order *model.OrderModel) (*model.OrderModel, error) {
	var searchedJackfruit = new(model.JackfruitModel)
	err := global.GlobalDB.Create(order).Error
	err = global.GlobalDB.Where("id=?", order.JackfruitId).First(searchedJackfruit).Error
	if order.Quantity > searchedJackfruit.Storage {
		return nil, errors.New("超出库存")
	}
	searchedJackfruit.Storage -= order.Quantity
	global.GlobalDB.Save(searchedJackfruit)
	order.Jackfruit = *searchedJackfruit
	return order, err
}
func (o *OrderService) GetPersonalOrders(UserId uint) ([]*model.OrderModel, error) {
	var orders []*model.OrderModel
	err := global.GlobalDB.Where("order_user_id=?", UserId).
		Preload("Jackfruit").
		Find(&orders).Error
	return orders, err
}
