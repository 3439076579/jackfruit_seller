package utils

import (
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"software_project_design/global"
)

const (
	path        = "./data"
	GeneralFile = "image"
)

func UploadFile(filename string, file multipart.File, size int64) (string, error) {
	absPath, _ := filepath.Abs(path)
	targetPath := filepath.Join(absPath, filename)
	data := make([]byte, size)
	file.Read(data)

	err := os.WriteFile(targetPath, data, 0666)
	if err != nil {
		log.Println(err)
		return "", err
	}
	fmt.Println(filename)
	return global.ServerAddr + "static/" + filename, nil
}
func SnowFlake() {

}
