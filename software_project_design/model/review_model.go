package model

import "gorm.io/gorm"

type ReviewModel struct {
	gorm.Model
	UserID      uint   `json:"user_id" gorm:"index;uniqueIndex:idx_user_jackfruit"`
	JackfruitID uint   `json:"jackfruit_id" gorm:"index;uniqueIndex:idx_user_jackfruit"`
	Rating      int    `json:"rating" gorm:"not null;type:TINYINT"`
	Content     string `json:"content" gorm:"type:varchar(255)"`
	User        *UserModel `json:"user" gorm:"foreignKey:UserID;references:ID"`
}

func (ReviewModel) TableName() string {
	return "review"
}
