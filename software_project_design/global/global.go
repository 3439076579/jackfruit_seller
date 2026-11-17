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
	// defaultDSN 是兜底连接串：没设 DB_DSN 时按原样连接，保证不配环境变量也能跑。
	defaultDSN = "root:wjb20031205@tcp(localhost:3306)/sf_project?charset=utf8&parseTime=True&loc=Local"
)

var (
	GlobalDB *gorm.DB
	Logger   *zap.Logger
)

// dsn 优先取环境变量 DB_DSN，便于在不改源码的前提下切换本地数据库账号。
// 注意：这里只影响“连哪个库”，不改任何接口契约。
func dsn() (value string, source string) {
	if v := os.Getenv("DB_DSN"); v != "" {
		return v, "env:DB_DSN"
	}
	return defaultDSN, "built-in default"
}

func GlobalInit() {
	Logger, _ = zap.NewProduction()

	connection, source := dsn()
	Logger.Info("MySQL DSN source", zap.String("source", source))
	OpenMySQL(connection)

	GlobalDB.AutoMigrate(&model.UserModel{}, &model.JackfruitModel{}, &model.OrderModel{}, &model.NotifyModel{}, &model.CategoryModel{}, &model.ReviewModel{})
}

func OpenMySQL(dsn string) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		// 连接串现在可能来自外部配置，填错概率变高；
		// 这里直接退出，避免继续对 nil 的 db 调用 DB() 触发 panic。
		Logger.Fatal("Connect to MySQL failed",
			zap.Error(err))
	}
	s, _ := db.DB()
	s.SetMaxOpenConns(10)
	s.SetMaxIdleConns(5)
	GlobalDB = db
}
func ShutDown() {
	Logger.Sync()
}
