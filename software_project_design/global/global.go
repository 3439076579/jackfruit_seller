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
	// Local default without credentials; set DB_DSN to connect with a password.
	defaultDSN = "root:@tcp(127.0.0.1:3306)/sf_project?charset=utf8mb4&parseTime=True&loc=Local"
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
	if shouldAutoMigrate() {
		Logger.Info("Running GORM AutoMigrate")
		if err := GlobalDB.AutoMigrate(&model.UserModel{}, &model.JackfruitModel{}, &model.OrderModel{}, &model.NotifyModel{}, &model.CategoryModel{}, &model.ReviewModel{}); err != nil {
			Logger.Fatal("AutoMigrate failed", zap.Error(err))
		}
	} else {
		Logger.Info("Skipping GORM AutoMigrate; database/schema.sql is the source of truth")
	}
}

// shouldAutoMigrate keeps database/schema.sql authoritative: AutoMigrate would
// otherwise rewrite its column types, drop NOT NULL/DEFAULT clauses and add
// duplicate indexes. DB_AUTO_MIGRATE=true|false forces the choice; when unset,
// AutoMigrate only runs on an empty database (no `user` table yet).
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
		Logger.Fatal("Connect to MySQL failed", zap.Error(err))
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
