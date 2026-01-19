@echo off
REM start.bat
if not exist venv (
    echo Error: Environment not set up. Please run install.bat first.
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
python scripts\start.py
pause
