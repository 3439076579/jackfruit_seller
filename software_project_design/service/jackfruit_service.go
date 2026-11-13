package service

import (
	"software_project_design/global"
	"software_project_design/model"
)

type JackfruitService struct{}

func (j *JackfruitService) AddProductService(jackfruit *model.JackfruitModel) (*model.JackfruitModel, error) {
	err := global.GlobalDB.Create(jackfruit).Error
	return jackfruit, err
}
func (j *JackfruitService) UpdateProductService(jackfruit *model.JackfruitModel) (*model.JackfruitModel, error) {
	var searchedJackfruit *model.JackfruitModel = new(model.JackfruitModel)
	err := global.GlobalDB.Where("product_name=?", jackfruit.ProductName).
		First(&searchedJackfruit).Error
	if err != nil {
		return nil, err
	}
	if jackfruit.Storage != 0 {
		searchedJackfruit.Storage = jackfruit.Storage
	}
	if jackfruit.Price != 0.0 {
		searchedJackfruit.Price = jackfruit.Price
	}
	if jackfruit.PlantIntro != "" {
		searchedJackfruit.PlantIntro = jackfruit.PlantIntro
	}
	if jackfruit.Image != "" {
		searchedJackfruit.Image = jackfruit.Image
	}
	if jackfruit.JackfruitFeature != "" {
		searchedJackfruit.JackfruitFeature = jackfruit.JackfruitFeature
	}
	if jackfruit.ManagementInfo != "" {
		searchedJackfruit.ManagementInfo = jackfruit.ManagementInfo
	}
	err = global.GlobalDB.Save(&searchedJackfruit).Error
	return searchedJackfruit, err
}
func (j *JackfruitService) GetProductsAll() ([]*model.JackfruitModel, error) {
	var products []*model.JackfruitModel
	err := global.GlobalDB.Find(&products).Error
	return products, err
}
func (j *JackfruitService) DeleteJackfruitService(id uint) error {
	err := global.GlobalDB.Where("id=?", id).
		Delete(&model.JackfruitModel{}).Error
	return err
}
