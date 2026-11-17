@echo off
setlocal

set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

if not exist "%MYSQL%" (
    echo [ERROR] mysql.exe not found at:
    echo         %MYSQL%
    echo         Edit the MYSQL variable in this file if MySQL is installed elsewhere.
    echo.
    pause
    exit /b 1
)

echo ============================================================
echo  Import seed data into database: sf_project
echo ============================================================
echo.

set /p DB_PASSWORD=MySQL root password: 

set "MYSQL_PWD=%DB_PASSWORD%"

echo.
echo [INFO] Importing seed.sql ...
echo.

"%MYSQL%" -u root --default-character-set=utf8mb4 sf_project < "%~dp0seed.sql"

if errorlevel 1 (
    echo.
    echo [ERROR] Import failed.
    echo         - Wrong password?  - Database sf_project missing?
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Done. Check the row counts printed above.
echo.
pause
