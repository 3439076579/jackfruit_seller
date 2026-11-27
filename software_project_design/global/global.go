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
	// defaultDSN 是兜底连接串：本机 root 无密码。仓库是公开的，不再内置任何真实密码，
	// 有密码时请通过环境变量 DB_DSN 传入。
	defaultDSN = "root:@tcp(localhost:3306)/sf_project?charset=utf8mb4&parseTime=True&loc=Local"
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

	if shouldAutoMigrate() {
		Logger.Info("Running GORM AutoMigrate")
		if err := GlobalDB.AutoMigrate(&model.UserModel{}, &model.JackfruitModel{}, &model.OrderModel{}, &model.NotifyModel{}, &model.CategoryModel{}, &model.ReviewModel{}); err != nil {
			Logger.Fatal("AutoMigrate failed", zap.Error(err))
		}
	} else {
		Logger.Info("Skipping GORM AutoMigrate; database/schema.sql is the source of truth")
	}
}

// shouldAutoMigrate 决定是否执行 GORM AutoMigrate。
// 用 database/schema.sql 建好的库若再跑 AutoMigrate，会被改写列类型
// （如 orders.user_address 变成可空 LONGTEXT）、丢掉 NOT NULL / DEFAULT，
// 并多建重复索引。所以：表已存在就跳过；空库（只建了 database）照旧自动建表。
// 环境变量 DB_AUTO_MIGRATE=true/false 可强制开或关。
func shouldAutoMigrate() bool {
	switch os.Getenv("DB_AUTO_MIGRATE") {
	case "true", "1":
		return true
	case "false", "0":
		return false
	}
	return !GlobalDB.Migrator().HasTable(&model.UserModel{})
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
	s, err := db.DB()
	if err != nil {
		Logger.Fatal("Failed to retrieve underlying sql.DB", zap.Error(err))
	}
	s.SetMaxOpenConns(10)
	s.SetMaxIdleConns(5)
	GlobalDB = db
}
func ShutDown() {
	Logger.Sync()
}
