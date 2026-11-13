package service

import (
	"errors"
	"software_project_design/global"
	"software_project_design/model"
)

type JackfruitService struct{}

func (j *JackfruitService) AddProductService(jackfruit *model.JackfruitModel) (*model.JackfruitModel, error) {
	err := global.GlobalDB.Create(jackfruit).Error
	if err != nil {
		return nil, err
	}
	err = global.GlobalDB.Preload("Category").
		Where("id=?", jackfruit.ID).
		First(&jackfruit).Error
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
	searchedJackfruit.CategoryId = jackfruit.CategoryId
	err = global.GlobalDB.Save(&searchedJackfruit).Error
	if err != nil {
		return nil, err
	}
	err = global.GlobalDB.Preload("Category").
		Where("id=?", searchedJackfruit.ID).
		First(&searchedJackfruit).Error
	return searchedJackfruit, err
}
func (j *JackfruitService) GetProductsAll() ([]*model.JackfruitModel, error) {
	var products []*model.JackfruitModel
	err := global.GlobalDB.Preload("Category").Find(&products).Error
	return products, err
}
func (j *JackfruitService) DeleteJackfruitService(id uint) error {
	err := global.GlobalDB.Where("id=?", id).
		Delete(&model.JackfruitModel{}).Error
	return err
}

func (j *JackfruitService) GetCategoriesService() ([]*model.CategoryModel, error) {
	var categories []*model.CategoryModel
	err := global.GlobalDB.Find(&categories).Error
	return categories, err
}

func (j *JackfruitService) AddCategoryService(name string) (*model.CategoryModel, error) {
	if name == "" {
		return nil, errors.New("分类名不能为空")
	}
	category := &model.CategoryModel{CategoryName: name}
	err := global.GlobalDB.Create(category).Error
	return category, err
}
