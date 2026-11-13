package model

import "gorm.io/gorm"

type OrderModel struct {
	gorm.Model

	OrderUser   UserModel `json:"user" gorm:"foreignKey:OrderUserId;references:ID"`
	OrderUserId uint      `json:"-" gorm:"index"`

	UserAddress string  `json:"address"`
	TotalCost   float64 `json:"total"`
	Quantity    uint64  `json:"quantity"`

	Jackfruit   JackfruitModel `json:"jackfruit" gorm:"foreignKey:JackfruitId;references:ID"`
	JackfruitId uint           `json:"-" gorm:"index"`
}

func (o *OrderModel) TableName() string {
	return "orders"
}
