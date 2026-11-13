package middleware

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func Cors(ctx *gin.Context) {
	method := ctx.Request.Method
	ctx.Header("Access-Control-Allow-Origin", ctx.GetHeader("Origin"))
	fmt.Println(ctx.GetHeader("Origin"))
	ctx.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
	// 服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段
	ctx.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Token")

	if method == "OPTIONS" {
		ctx.AbortWithStatus(http.StatusNoContent)
		return
	}
	ctx.Next()
}
