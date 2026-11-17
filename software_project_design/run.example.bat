@echo off
setlocal

rem ===========================================================
rem  Copy this file to run.bat, then set DB_PASSWORD below.
rem  run.bat is git-ignored, so your password stays local.
rem  Avoid & % ^ ! @ : in the password, they break the DSN.
rem ===========================================================

set "DB_PASSWORD=CHANGE_ME"

if "%DB_PASSWORD%"=="CHANGE_ME" (
    echo [ERROR] Open run.bat and set DB_PASSWORD to your MySQL root password.
    echo.
    pause
    exit /b 1
)

set "DB_DSN=root:%DB_PASSWORD%@tcp(localhost:3306)/sf_project?charset=utf8&parseTime=True&loc=Local"

echo [INFO] Database : sf_project @ localhost:3306
echo [INFO] Backend  : http://localhost:8082
echo.

go run main.go

echo.
echo [INFO] Backend stopped.
pause
