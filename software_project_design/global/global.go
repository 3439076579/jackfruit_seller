package global

import (
	"os"
	"software_project_design/model"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	ServerAddr = "http://localhost:8082/"
	defaultDSN = "root:wjb20031205@tcp(localhost:3306)/sf_project?charset=utf8mb4&parseTime=True&loc=Local"
)

var (
	GlobalDB *gorm.DB
	Logger   *zap.Logger
)

func GlobalInit() {
	Logger, _ = zap.NewProduction()
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = defaultDSN
	}
	OpenMySQL(dsn)
	if GlobalDB != nil {
		GlobalDB.AutoMigrate(&model.UserModel{}, &model.JackfruitModel{}, &model.OrderModel{}, &model.NotifyModel{}, &model.CategoryModel{}, &model.ReviewModel{})
	}
}

func OpenMySQL(dsn string) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		Logger.Fatal("Connect to MySQL failed",
			zap.Error(err))
		return
	}
	s, err := db.DB()
	if err != nil {
		Logger.Fatal("Failed to retrieve underlying sql.DB",
			zap.Error(err))
		return
	}
	s.SetMaxOpenConns(10)
	s.SetMaxIdleConns(5)
	GlobalDB = db
}
func ShutDown() {
	Logger.Sync()
}
