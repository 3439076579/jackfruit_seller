package model

import "gorm.io/gorm"

type NotifyModel struct {
	gorm.Model
	Message string
}

func (n *NotifyModel) TableName() string {
	return "notify"
}
