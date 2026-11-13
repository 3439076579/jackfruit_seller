package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"log"
	"net/http"
	"software_project_design/global"
	"software_project_design/model"
	"software_project_design/service"
	"strconv"
)

//const (
//	PasswordRegString = ""
//)

type userController struct{}

func (u *userController) Register(c *gin.Context) {

	var user *model.UserModel = new(model.UserModel)
	var err error

	user.Username = c.Query("username")
	user.Password = c.Query("password")

	_, err = service.ServiceApi.RegisterService(user)
	if err != nil {
		global.Logger.Error("Register failed",
			zap.Error(err))
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    user,
	})
}

func (u *userController) Login(c *gin.Context) {
	var user *model.UserModel = new(model.UserModel)

	user.Username = c.Query("username")
	user.Password = c.Query("password")

	user, err := service.ServiceApi.LoginService(user)
	if err != nil {
		global.Logger.Error("Login failed",
			zap.Error(err))
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    user,
	})
}

func (u *userController) UpdateUser(c *gin.Context) {

	var user = new(model.UserModel)

	user.Username = c.Query("username")
	user.Password = c.Query("password")
	user.Phone = c.Query("phone")
	user.Email = c.Query("email")

	userModel, err := service.ServiceApi.UpdateUserService(user)
	if err != nil {
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    userModel,
	})
}
func (u *userController) GetUsers(c *gin.Context) {
	users, err := service.ServiceApi.GetUsersService()
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    users,
	})
}
func (u *userController) GetUser(c *gin.Context) {
	var user = new(model.UserModel)

	user.Username = c.Query("username")
	userModel, err := service.ServiceApi.GetUserService(user)
	if err != nil {
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    userModel,
	})
}
func (u *userController) UpdateUserById(c *gin.Context) {

	var user = new(model.UserModel)
	fmt.Println(c.Query("id"))
	id, _ := strconv.ParseUint(c.Query("id"), 10, 64)
	user.ID = uint(id)
	user.Username = c.Query("username")
	user.Password = c.Query("password")
	user.Phone = c.Query("phone")
	user.Email = c.Query("email")

	userModel, err := service.ServiceApi.UpdateUserByIdService(user)
	if err != nil {
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    userModel,
	})
}
func (u *userController) AddUser(c *gin.Context) {
	var user = new(model.UserModel)
	user.Username = c.Query("username")
	user.Password = c.Query("password")
	user.Phone = c.Query("phone")
	user.Email = c.Query("email")

	_, err := service.ServiceApi.AddUserService(user)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    user,
	})
}

func (u *userController) DeleteUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Query("id"), 10, 64)
	err := service.ServiceApi.DeleteUserService(uint(id))
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
	})
}
