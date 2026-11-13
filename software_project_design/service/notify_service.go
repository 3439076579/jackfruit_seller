package service

import (
	"software_project_design/global"
	"software_project_design/model"
)

type NotifyService struct{}

func (n *NotifyService) AddMessageService(notify *model.NotifyModel) (*model.NotifyModel, error) {
	err := global.GlobalDB.Create(notify).Error
	return notify, err
}
func (n *NotifyService) GetLastNotifyService() (*model.NotifyModel, error) {
	var notifies []*model.NotifyModel
	err := global.GlobalDB.Find(&notifies).Error
	return notifies[len(notifies)-1], err
}
