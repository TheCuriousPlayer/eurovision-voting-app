@echo off
title Eurovision Voting Server Controller
color 0A

:MENU
cls
echo.
echo  ███████╗██╗   ██╗██████╗  ██████╗ ██╗   ██╗██╗███████╗██╗ ██████╗ ███╗   ██╗
echo  ██╔════╝██║   ██║██╔══██╗██╔═══██╗██║   ██║██║██╔════╝██║██╔═══██╗████╗  ██║
echo  █████╗  ██║   ██║██████╔╝██║   ██║██║   ██║██║███████╗██║██║   ██║██╔██╗ ██║
echo  ██╔══╝  ██║   ██║██╔══██╗██║   ██║╚██╗ ██╔╝██║╚════██║██║██║   ██║██║╚██╗██║
echo  ███████╗╚██████╔╝██║  ██║╚██████╔╝ ╚████╔╝ ██║███████║██║╚██████╔╝██║ ╚████║
echo  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo                           🌟 TURKIYE VOTING SERVER 🌟
echo.
echo  ╔══════════════════════════════════════════════════════════════════════════╗
echo  ║                            SERVER MANAGEMENT                             ║
echo  ╠══════════════════════════════════════════════════════════════════════════╣
echo  ║  1. Start Web Server Only                                                ║
echo  ║  2. Start Vote Calculator Only                                           ║
echo  ║  3. Start Both Services (Recommended)                                    ║
echo  ║  4. Check Server Status                                                  ║
echo  ║  5. Get Network IP Address                                               ║
echo  ║  6. Open Website in Browser                                              ║
echo  ║  7. Exit                                                                 ║
echo  ╚══════════════════════════════════════════════════════════════════════════╝
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto START_WEB
if "%choice%"=="2" goto START_CALC
if "%choice%"=="3" goto START_BOTH
if "%choice%"=="4" goto CHECK_STATUS
if "%choice%"=="5" goto GET_IP
if "%choice%"=="6" goto OPEN_BROWSER
if "%choice%"=="7" goto EXIT

echo Invalid choice. Please try again.
pause
goto MENU

:START_WEB
echo.
echo Starting Web Server...
start "Eurovision Web Server" cmd /c "start-server.bat"
echo Web server started in new window!
echo Available at: http://localhost:3000
pause
goto MENU

:START_CALC
echo.
echo Starting Vote Calculator...
start "Eurovision Calculator" cmd /c "start-calculator.bat"
echo Vote calculator started in new window!
pause
goto MENU

:START_BOTH
echo.
echo Starting both services...
echo.
echo 1. Starting Vote Calculator...
start "Eurovision Calculator" cmd /c "start-calculator.bat"
timeout /t 2 /nobreak >nul

echo 2. Starting Web Server...
start "Eurovision Web Server" cmd /c "start-server.bat"

echo.
echo ✅ Both services started!
echo.
echo Vote Calculator: Running in background
echo Web Server: http://localhost:3000
echo.
echo Check individual windows for logs and status.
pause
goto MENU

:CHECK_STATUS
echo.
echo Checking server status...
netstat -an | findstr :3000 >nul
if %ERRORLEVEL%==0 (
    echo ✅ Web Server: RUNNING on port 3000
) else (
    echo ❌ Web Server: NOT RUNNING
)

tasklist | findstr "python.exe" >nul
if %ERRORLEVEL%==0 (
    echo ✅ Python Calculator: RUNNING
) else (
    echo ❌ Python Calculator: NOT RUNNING
)
echo.
pause
goto MENU

:GET_IP
echo.
echo Your computer's IP addresses:
echo =============================
ipconfig | findstr "IPv4"
echo.
echo Use these IPs to access from other devices on your network:
echo Example: http://192.168.1.100:3000
echo.
pause
goto MENU

:OPEN_BROWSER
echo.
echo Opening website in default browser...
start http://localhost:3000
pause
goto MENU

:EXIT
echo.
echo Goodbye! 👋
exit /b 0
