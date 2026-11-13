package service

import (
	"errors"
	"gorm.io/gorm"
	"software_project_design/global"
	"software_project_design/model"
)

var (
	ErrDuplicateRegistered = errors.New("username has been registered")
	ErrIncorrectPassword   = errors.New("incorrect password")
)

type UserService struct{}

func (u *UserService) RegisterService(user *model.UserModel) (*model.UserModel, error) {
	var searchedUser *model.UserModel = new(model.UserModel)
	err := global.GlobalDB.
		Where("username=?", user.Username).
		First(searchedUser).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrDuplicateRegistered
	}
	err = global.GlobalDB.Create(&user).Error
	return searchedUser, err
}

func (u *UserService) LoginService(user *model.UserModel) (*model.UserModel, error) {
	var searchedUser *model.UserModel = new(model.UserModel)

	if err := global.GlobalDB.
		Where("username=?", user.Username).
		First(searchedUser).Error; err != nil {
		return nil, err
	}
	// compare password
	if searchedUser.Password == user.Password {
		return searchedUser, nil
	}
	return nil, ErrIncorrectPassword
}
func (u *UserService) UpdateUserService(user *model.UserModel) (*model.UserModel, error) {
	var searchedUser = new(model.UserModel)
	err := global.GlobalDB.Where("username=?", user.Username).
		First(searchedUser).Error
	if err != nil {
		return nil, err
	}
	if user.Password != "" {
		searchedUser.Password = user.Password
	}
	if user.Phone != "" {
		searchedUser.Phone = user.Phone
	}
	if user.Email != "" {
		searchedUser.Email = user.Email
	}
	err = global.GlobalDB.Save(&searchedUser).Error
	return searchedUser, err
}

func (u *UserService) GetUserService(user *model.UserModel) (*model.UserModel, error) {
	var searchedUser = new(model.UserModel)
	err := global.GlobalDB.Where("username=?", user.Username).
		First(searchedUser).Error
	if err != nil {
		return nil, err
	}
	return searchedUser, nil
}

func (u *UserService) GetUsersService() ([]*model.UserModel, error) {
	var users []*model.UserModel
	err := global.GlobalDB.Find(&users).Error
	return users, err
}
func (u *UserService) DeleteUserService(id uint) error {
	err := global.GlobalDB.Where("id=?", id).
		Delete(&model.UserModel{}).Error
	return err
}
func (u *UserService) UpdateUserByIdService(user *model.UserModel) (*model.UserModel, error) {
	var searchedUser = new(model.UserModel)
	err := global.GlobalDB.Where("id=?", user.ID).
		First(searchedUser).Error
	if err != nil {
		return nil, err
	}
	if user.Password != "" {
		searchedUser.Password = user.Password
	}
	if user.Phone != "" {
		searchedUser.Phone = user.Phone
	}
	if user.Email != "" {
		searchedUser.Email = user.Email
	}
	err = global.GlobalDB.Save(&searchedUser).Error
	return searchedUser, err
}
func (u *UserService) AddUserService(user *model.UserModel) (*model.UserModel, error) {
	var searchedUser *model.UserModel = new(model.UserModel)
	err := global.GlobalDB.
		Where("username=?", user.Username).
		First(searchedUser).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrDuplicateRegistered
	}
	err = global.GlobalDB.Create(&user).Error
	return searchedUser, err
}
