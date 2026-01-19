@echo off
REM install.bat
echo [1/3] Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found in PATH. Please install Python 3.8+
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found in PATH. Please install Node.js 16+
    pause
    exit /b 1
)

echo [2/3] Setting up environment...
if not exist venv (
    python -m venv venv
)

echo [3/3] Running installation script...
call venv\Scripts\activate.bat
python scripts\install.py

if errorlevel 1 (
    echo Installation failed!
    pause
    exit /b 1
)

echo.
echo Installation successful!
pause
