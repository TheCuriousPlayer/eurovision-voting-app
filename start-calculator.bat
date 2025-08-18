@echo off
echo Starting Eurovision Vote Calculator Service...
echo ===========================================
echo.

cd "src\app\eurovision2023\votes"

echo Checking Python environment...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH!
    echo Please install Python 3.7+ and try again.
    pause
    exit /b 1
)

echo.
echo Starting continuous vote calculation...
echo Updates every 15 seconds (configurable in calculate_cumulative.ini)
echo Press Ctrl+C to stop
echo.

REM Start the Python calculator
python calculate_cumulative.py
