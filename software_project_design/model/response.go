package model

type Response struct {
	Code    int         `json:"status_code"`
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
}
