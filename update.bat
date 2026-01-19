@echo off
setlocal enabledelayedexpansion

echo [UPDATE] Checking for repository updates...
git pull origin main

echo.
echo [UPDATE] Installing dependencies...
call npm install

echo.
echo [UPDATE] Building the project...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Update and build completed successfully!
    echo [INFO] You can now use start.bat to run the application.
) else (
    echo.
    echo [ERROR] Build failed. Please check the error messages above.
)

pause
