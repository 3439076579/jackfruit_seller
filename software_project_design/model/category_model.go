package model

import "gorm.io/gorm"

type CategoryModel struct {
	gorm.Model
	CategoryName string `json:"category_name" gorm:"uniqueIndex;not null;type:varchar(50)"`
}

func (CategoryModel) TableName() string {
	return "category"
}
