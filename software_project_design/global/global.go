package global

import (
	"software_project_design/model"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	ServerAddr = "http://localhost:8082/"
)

var (
	GlobalDB *gorm.DB
	Logger   *zap.Logger
)

func GlobalInit() {
	Logger, _ = zap.NewProduction()
	OpenMySQL("root:wjb20031205@tcp(localhost:3306)/sf_project?charset=utf8&parseTime=True&loc=Local")
	GlobalDB.AutoMigrate(&model.UserModel{}, &model.JackfruitModel{}, &model.OrderModel{}, &model.NotifyModel{}, &model.CategoryModel{}, &model.ReviewModel{})
}

func OpenMySQL(dsn string) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		Logger.Error("Connect to MySQL failed",
			zap.Error(err))
	}
	s, _ := db.DB()
	s.SetMaxOpenConns(10)
	s.SetMaxIdleConns(5)
	GlobalDB = db
	return
}
func ShutDown() {
	Logger.Sync()
}
