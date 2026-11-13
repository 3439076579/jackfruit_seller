package service

import (
	"errors"
	"software_project_design/global"
	"software_project_design/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type OrderService struct{}

func (o *OrderService) GetOrderListService() ([]*model.OrderModel, error) {
	var orders []*model.OrderModel
	err := global.GlobalDB.Preload("Jackfruit").Find(&orders).Error
	return orders, err
}
func (o *OrderService) CreateOrderService(order *model.OrderModel) (*model.OrderModel, error) {
	err := global.GlobalDB.Transaction(func(tx *gorm.DB) error {
		var searchedJackfruit model.JackfruitModel
		err := tx.Where("id=?", order.JackfruitId).
			Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&searchedJackfruit).Error
		if err != nil {
			return errors.New("商品不存在")
		}
		if order.Quantity > searchedJackfruit.Storage {
			return errors.New("超出库存")
		}
		err = tx.Create(order).Error
		if err != nil {
			return err
		}
		searchedJackfruit.Storage -= order.Quantity
		err = tx.Save(&searchedJackfruit).Error
		if err != nil {
			return err
		}
		order.Jackfruit = searchedJackfruit
		return nil
	})
	if err != nil {
		return nil, err
	}
	return order, nil
}
func (o *OrderService) GetPersonalOrders(UserId uint) ([]*model.OrderModel, error) {
	var orders []*model.OrderModel
	err := global.GlobalDB.Where("order_user_id=?", UserId).
		Preload("Jackfruit").
		Find(&orders).Error
	return orders, err
}
