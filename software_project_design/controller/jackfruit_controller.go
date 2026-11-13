package controller

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"software_project_design/model"
	"software_project_design/service"
	"software_project_design/utils"
	"strconv"
)

type jackfruitController struct{}

func (j *jackfruitController) AddProduct(c *gin.Context) {
	var jackfruit *model.JackfruitModel = new(model.JackfruitModel)
	jackfruit.ProductName = c.PostForm("name")
	jackfruit.Storage, _ = strconv.ParseUint(c.PostForm("storage"), 10, 64)
	jackfruit.Price, _ = strconv.ParseFloat(c.PostForm("price"), 64)
	jackfruit.ManagementInfo = c.PostForm("management_info")
	jackfruit.JackfruitFeature = c.PostForm("feature")
	jackfruit.PlantIntro = c.PostForm("plant_intro")
	categoryId, _ := strconv.ParseUint(c.PostForm("category_id"), 10, 64)
	jackfruit.CategoryId = uint(categoryId)
	image, err := c.FormFile("image")
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusOK, &model.Response{
			Code:    -1,
			Message: err.Error(),
		})
		return
	}
	if image != nil {
		file, _ := image.Open()
		jackfruit.Image, err = utils.UploadFile(image.Filename, file, image.Size)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusOK, &model.Response{
				Code:    -1,
				Message: err.Error(),
			})
			return
		}
	}
	//if jackfruit.ProductName == "" ||
	//	jackfruit.Storage == 0 ||
	//	jackfruit.Price == 0.0 {
	//
	//}
	jackfruit, err = service.ServiceApi.AddProductService(jackfruit)
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
		Data:    jackfruit,
	})
}

func (j *jackfruitController) UpdateProduct(c *gin.Context) {
	var jackfruit *model.JackfruitModel = new(model.JackfruitModel)
	jackfruit.ProductName = c.PostForm("name")
	jackfruit.Storage, _ = strconv.ParseUint(c.PostForm("storage"), 10, 64)
	jackfruit.Price, _ = strconv.ParseFloat(c.PostForm("price"), 64)
	jackfruit.ManagementInfo = c.PostForm("management_info")
	jackfruit.JackfruitFeature = c.PostForm("feature")
	jackfruit.PlantIntro = c.PostForm("plant_intro")
	categoryId, _ := strconv.ParseUint(c.PostForm("category_id"), 10, 64)
	jackfruit.CategoryId = uint(categoryId)
	image, err := c.FormFile("image")
	if image != nil {
		file, _ := image.Open()
		jackfruit.Image, err = utils.UploadFile(image.Filename, file, image.Size)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusOK, &model.Response{
				Code:    -1,
				Message: err.Error(),
			})
			return
		}
	}
	product, err := service.ServiceApi.UpdateProductService(jackfruit)
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
		Data:    product,
	})
}

func (j *jackfruitController) GetAllProducts(c *gin.Context) {
	products, err := service.ServiceApi.GetProductsAll()
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
		Data:    products,
	})
}
func (j *jackfruitController) DeleteJackfruit(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Query("id"), 10, 64)
	err := service.ServiceApi.DeleteJackfruitService(uint(id))
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
	})
}

func (j *jackfruitController) GetAllCategories(c *gin.Context) {
	categories, err := service.ServiceApi.GetCategoriesService()
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
		Data:    categories,
	})
}

func (j *jackfruitController) AddCategory(c *gin.Context) {
	category, err := service.ServiceApi.AddCategoryService(c.PostForm("category_name"))
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
		Data:    category,
	})
}
