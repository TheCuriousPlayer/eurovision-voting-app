@echo off
echo Eurovision 2023 Vote Calculator
echo ===============================
echo.
echo Choose an option:
echo 1. Run once and exit
echo 2. Run continuously (every 15 seconds)
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Running calculator once...
    dist\calculate_cumulative.exe --once
    echo.
    pause
) else if "%choice%"=="2" (
    echo.
    echo Starting continuous calculator...
    echo Press Ctrl+C to stop
    echo.
    dist\calculate_cumulative.exe
) else if "%choice%"=="3" (
    echo Goodbye!
    exit /b
) else (
    echo Invalid choice. Please try again.
    pause
    goto :eof
)
