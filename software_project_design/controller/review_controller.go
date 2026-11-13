package controller

import (
	"log"
	"net/http"
	"software_project_design/model"
	"software_project_design/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type reviewController struct{}

func (r *reviewController) GetReviews(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Query("jackfruit_id"), 10, 64)
	reviews, err := service.ServiceApi.GetReviewsService(uint(id))
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    reviews,
	})
}

func (r *reviewController) AddReview(ctx *gin.Context) {
	review := new(model.ReviewModel)
	id, _ := strconv.ParseUint(ctx.PostForm("jackfruit_id"), 10, 64)
	review.JackfruitID = uint(id)
	id, _ = strconv.ParseUint(ctx.PostForm("user_id"), 10, 64)
	review.UserID = uint(id)
	review.Rating, _ = strconv.Atoi(ctx.PostForm("rating"))
	review.Content = ctx.PostForm("content")
	review, err := service.ServiceApi.AddReviewService(review)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, &model.Response{
		Code:    0,
		Message: "success",
		Data:    review,
	})
}
