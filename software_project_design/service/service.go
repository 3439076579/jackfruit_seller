package service

var ServiceApi = new(Service)

type Service struct {
	UserService
	JackfruitService
	OrderService
	NotifyService
}
