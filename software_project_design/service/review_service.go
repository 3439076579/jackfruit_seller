package service

import (
	"errors"
	"software_project_design/global"
	"software_project_design/model"
)

type ReviewService struct{}

func (r *ReviewService) GetReviewsService(jackfruitId uint) ([]*model.ReviewModel, error) {
	var reviews []*model.ReviewModel
	err := global.GlobalDB.Preload("User").
		Where("jackfruit_id=?", jackfruitId).
		Order("created_at DESC").
		Find(&reviews).Error
	return reviews, err
}

func (r *ReviewService) AddReviewService(review *model.ReviewModel) (*model.ReviewModel, error) {
	if review.Rating < 1 || review.Rating > 5 {
		return nil, errors.New("评分必须在1到5之间")
	}
	var count int64
	global.GlobalDB.Model(&model.JackfruitModel{}).
		Where("id=?", review.JackfruitID).
		Count(&count)
	if count == 0 {
		return nil, errors.New("商品不存在")
	}
	err := global.GlobalDB.Create(review).Error
	if err != nil {
		return nil, errors.New("该用户已评价过此商品")
	}
	err = global.GlobalDB.Preload("User").
		Where("id=?", review.ID).
		First(review).Error
	return review, err
}
