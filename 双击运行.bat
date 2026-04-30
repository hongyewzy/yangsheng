@echo off
chcp 65001 >nul
title 食材养生文章生成工具
echo.
echo =====================================
echo    食材养生公众号文章生成工具
echo =====================================
echo.

:: 检查 Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装！
    echo 下载地址：https://nodejs.org/
    echo.
    pause
    exit
)

echo [✓] Node.js 已安装

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [警告] 未检测到 Python，图片生成功能将无法使用！
    echo 如需图片功能，请访问 https://www.python.org/downloads/ 下载安装
    echo.
    choice /C YN /M "是否继续运行（仅生成文字，不生成图片）"
    if errorlevel 2 exit
    if errorlevel 1 goto skip_python
)

echo [✓] Python 已安装

:: 检查 Python 依赖
echo [提示] 检查 Python 依赖...
python -c "import requests, PIL" >nul 2>&1
if errorlevel 1 (
    echo [提示] 首次使用，正在安装 Python 依赖...
    python -m pip install -r zimage-skill/requirements.txt
    if errorlevel 1 (
        echo [错误] Python 依赖安装失败，请检查网络连接
        pause
        exit
    )
    echo [✓] Python 依赖安装完成
) else (
    echo [✓] Python 依赖已安装
)

:skip_python

:: 检查 Node.js 依赖
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装 Node.js 依赖...
    npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络连接
        pause
        exit
    )
    echo [✓] Node.js 依赖安装完成
)

:: 检查 config.json
if not exist "config.json" (
    echo [错误] 未找到 config.json 配置文件！
    pause
    exit
)

echo.
echo ------------------------------------
echo [✓] 开始生成文章...
echo ------------------------------------
echo.

:: 运行程序
node run.js

if errorlevel 1 (
    echo.
    echo [错误] 程序运行出错，请查看上方错误信息
    pause
    exit
)

echo.
echo ------------------------------------
echo.
echo 生成完成！文件保存在 outputs 文件夹中
echo.
pause
