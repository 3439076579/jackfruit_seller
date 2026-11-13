package model

import "gorm.io/gorm"

type UserModel struct {
	gorm.Model

	Username string `json:"username" gorm:"uniqueIndex;not null;type:varchar(20)"`
	Password string `json:"password" gorm:"not null;type:varchar(20)"`

	Phone string `json:"phone" gorm:"type:varchar(17)"`
	Email string `json:"email" gorm:"type:varchar(25)"`
}

func (UserModel) TableName() string {
	return "user"
}
