package model

import "gorm.io/gorm"

type JackfruitModel struct {
	gorm.Model
	CategoryId  uint          `json:"category_id" gorm:"index"`
	Category    *CategoryModel `json:"category" gorm:"foreignKey:CategoryId;references:ID"`
	ProductName string        `json:"name" gorm:"index;not null;type:VARCHAR(100)"`

	//
	Storage uint64  `json:"storage" gorm:"not null;type:INT"`
	Price   float64 `json:"price" gorm:"not null;type:FLOAT"`

	//
	Image            string `json:"image" gorm:"type:VARCHAR(255)"`
	ManagementInfo   string `json:"management_info" gorm:"type:TEXT"`
	JackfruitFeature string `json:"feature" gorm:"type:TEXT"`
	PlantIntro       string `json:"plant_intro" gorm:"type:TEXT"`
}

func (j *JackfruitModel) TableName() string {
	return "jackfruit"
}
