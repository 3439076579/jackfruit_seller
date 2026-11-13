package controller

var Api = new(Controller)

type Controller struct {
	userController
	jackfruitController
	orderController
	notifyController
	analyticsController
}
