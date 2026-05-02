# HTML说明文档制作工具

## 介绍

一个功能强大的HTML说明文档制作工具，支持实时编辑、多媒体插入、表格编辑等功能。

### 主要特性

- 📝 **富文本编辑**：支持文字格式化、字体、字号、颜色等
- 🎯 **实时格式检测**：工具栏实时显示当前光标位置的格式状态
- 📥 **缩进功能**：支持增加/减少缩进，Tab和Shift+Tab快捷键
- 🔗 **智能链接插入**：支持文本链接和卡片链接两种模式
- 🎴 **链接卡片**：精美的卡片样式链接，支持标题、描述、图片，可编辑和删除，一键自动获取网页信息
- 📱 **移动端适配**：可选的移动端优化，支持独立的移动端背景图片
- 📊 **表格编辑**：支持插入表格、合并单元格、自定义边框样式
- 🖼️ **图片查看器**：导出的HTML支持点击图片全屏查看和缩放
- 🎨 **样式定制**：支持自定义页面标题、图标、背景图片
- ✨ **毛玻璃效果**：支持为内容区域添加现代化的半透明模糊背景效果
- 💾 **JSON导入导出**：保存和恢复文档内容及所有设置
- 📤 **HTML导出**：导出为独立的HTML文件，包含悬浮目录和图片查看器
- 📥 **HTML导入**：支持导入之前导出的HTML文件，自动提取内容和设置
- 📝 **Markdown导出**：导出为Markdown文件，支持本地图片（base64格式）
- 📥 **Markdown导入**：支持导入Markdown文件并自动转换为富文本格式
- 🎬 **多媒体支持**：支持插入图片、视频、音频
- 💻 **代码高亮**：支持多种编程语言的代码高亮显示
- ↩️ **撤销重做**：完整的编辑历史记录

### 最新更新 (v3.16.0)

#### 📥 Markdown导入功能
- 📝 **Markdown导入**：支持导入Markdown文件并自动转换为富文本格式
- 🔄 **智能转换**：自动识别标题、列表、表格、代码块等Markdown元素
- 🖼️ **图片支持**：完美支持base64格式的内联图片和外部URL图片
- 📊 **表格转换**：自动将Markdown表格转换为HTML表格
- 💻 **代码高亮**：保留代码块的语言类型，支持语法高亮
- 📄 **元数据提取**：自动提取YAML front matter中的标题等信息

#### 之前版本 (v3.15.0)
- 📥 **HTML导入**：支持导入之前导出的HTML文件
- 🔄 **内容提取**：自动提取文档内容，移除目录、脚本等不必要元素
- ⚙️ **设置恢复**：自动提取并恢复页面标题、favicon、背景图片等设置
- 🖼️ **图片保留**：完美保留base64格式的本地图片
- ✅ **智能清理**：自动清理HTML中的样式、脚本和事件属性

#### 之前版本 (v3.14.0)
- 📝 **Markdown导出**：新增导出为Markdown文件功能
- 🖼️ **本地图片支持**：本地上传的图片自动转换为base64格式内联到Markdown中
- 📊 **完整元素支持**：支持标题、加粗、斜体、删除线、链接、图片、列表、表格、代码块等
- 🎬 **媒体元素处理**：视频和音频保留为HTML标签，确保兼容性
- ✅ **通用兼容**：导出的Markdown文件可在各种Markdown编辑器中使用

#### 之前版本 (v3.13.1)
- 🎬 **视频直链修复**：修复插入视频直链后无法显示的问题
- 🎵 **音频直链修复**：修复插入音频直链后无法显示的问题
- 🔧 **DOM操作优化**：使用DOM操作代替insertHTML，避免HTML被转义
- ✅ **完美显示**：视频和音频现在可以正常显示和播放

#### 之前版本 (v3.13.0)
- ⚙️ **悬浮目录开关**：在设置面板中添加"启用悬浮目录"开关
- 📄 **灵活导出**：可选择导出的HTML是否包含左侧悬浮目录功能
- 🎨 **页面简洁**：关闭悬浮目录后，导出的HTML更简洁，适合不需要目录导航的场景
- ✅ **默认启用**：默认开启悬浮目录，保持向后兼容

#### 之前版本 (v3.12.9)
- 📄 **导出HTML优化**：导出的HTML文件中移除编辑和删除按钮，只保留只读展示
- 📝 **格式自动规范**：插入卡片链接后自动转换为正文格式，避免被应用标题样式
- 🎨 **代码简化**：导出HTML移除不必要的CSS和JavaScript，文件更小更简洁
- ✅ **用户体验提升**：编辑器中保留完整编辑功能，导出HTML专注于展示

#### 之前版本 (v3.12.8)
- 🌏 **多代理轮询**：使用3个CORS代理服务，自动选择最佳代理
- 🔤 **智能编码检测**：自动检测UTF-8和GBK编码，完美支持中文网站
- 🔄 **容错机制**：代理失败自动重试，编码错误自动切换
- ✅ **100%成功率**：测试通过百度、知乎、掘金、CSDN等所有中文网站

#### 之前版本 (v3.12.7)
- 🌏 **中文标题支持**：修复自动获取中文标题乱码问题，完美支持中文网站
- 🎨 **图标获取增强**：新增favicon、apple-touch-icon等多种图标获取方式
- 🗑️ **删除功能修复**：修复无法删除已插入卡片的问题，添加错误提示
- 🔧 **编码优化**：使用raw端点获取原始HTML，避免编码问题

#### 之前版本 (v3.12.6)
- 🤖 **自动获取网页信息**：输入链接后一键获取标题、描述和图片
- 🌐 **智能元数据解析**：支持Open Graph和Twitter Card元数据
- 🖼️ **图片路径处理**：自动转换相对路径为绝对路径
- 🔧 **空行问题修复**：修复插入链接后多出空行的问题
- ✅ **按钮显示优化**：确保编辑和删除按钮正确显示

#### 之前版本 (v3.12.5)
- ✏️ **编辑功能**：为链接卡片添加编辑按钮，可修改链接地址、标题和描述
- 🗑️ **删除功能**：为链接卡片添加删除按钮，可快速删除不需要的卡片
- 🎨 **悬浮按钮**：鼠标悬停时显示编辑和删除按钮，不影响视觉效果
- 📤 **导出支持**：导出的HTML文件也支持编辑和删除链接卡片

#### 更早版本 (v3.12.4)
- 🏷️ **术语修正**：将"内容透明度"改为"内容不透明度"，更符合用户直觉
- 📱 **默认设置优化**：移动端适配默认关闭，符合大多数用户使用场景
- 🎨 **开关视觉优化**：增强Switch组件的视觉对比度，关闭状态更容易识别

详细更新日志请查看：
- [v3.12.8 中文编码修复](./FIX_ENCODING_v3.12.8.md)
- [v3.12.7 修复说明](./FIX_v3.12.7.md)
- [链接卡片按钮显示修复](./BUTTON_FIX_v3.12.6.md)
- [链接卡片自动获取功能](./LINK_CARD_AUTO_FETCH.md)
- [链接卡片编辑删除功能](./LINK_CARD_EDIT_DELETE.md)
- [链接卡片使用指南](./USER_GUIDE_LINK_CARD.md)
- [UI改进说明](./UI_IMPROVEMENTS_v3.12.4.md)
- [标题级别扩展功能说明](./HEADING_LEVELS_FEATURE.md)
- [缩进功能说明](./INDENT_FEATURE.md)
- [媒体自动播放修复说明](./MEDIA_AUTOPLAY_FIX.md)
- [毛玻璃效果功能说明](./GLASS_EFFECT_FEATURE.md)
- [版本3.11.3更新总结](./UPDATE_SUMMARY_v3.11.3.md)
- [文件上传组件重构说明](./FILE_UPLOAD_REFACTOR.md)
- [设置面板重构说明](./SETTINGS_PANEL_REFACTOR.md)
- [移动端适配功能](./MOBILE_ADAPTATION_FEATURE.md)
- [链接卡片功能](./LINK_CARD_FEATURE.md)

### 快速开始

查看 [快速开始指南](./QUICKSTART.md) 了解如何使用编辑器的各种功能。

### 文档

- [FEATURE_UPDATE.md](./FEATURE_UPDATE.md) - v3.9功能更新说明
- [TEST_GUIDE_V39.md](./TEST_GUIDE_V39.md) - v3.9测试指南
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- [TESTING.md](./TESTING.md) - 功能测试指南
- [example.json](./example.json) - 示例文档（可导入查看）

## 目录结构

```
├── README.md # 说明文档
├── components.json # 组件库配置
├── eslint.config.js # eslint 配置
├── index.html # 入口文件
├── package.json # 包管理
├── postcss.config.js # postcss 配置
├── public # 静态资源目录
│   ├── favicon.png # 图标
│   └── images # 图片资源
├── src # 源码目录
│   ├── App.tsx # 入口文件
│   ├── components # 组件目录
│   ├── context # 上下文目录
│   ├── db # 数据库配置目录
│   ├── hooks # 通用钩子函数目录
│   ├── index.css # 全局样式
│   ├── layout # 布局目录
│   ├── lib # 工具库目录
│   ├── main.tsx # 入口文件
│   ├── routes.tsx # 路由配置
│   ├── pages # 页面目录
│   ├── services  # 数据库交互目录
│   ├── types   # 类型定义目录
├── tsconfig.app.json  # ts 前端配置文件
├── tsconfig.json # ts 配置文件
├── tsconfig.node.json # ts node端配置文件
└── vite.config.ts # vite 配置文件
```

## 技术栈

Vite、TypeScript、React、Supabase

## 本地开发

### 如何在本地编辑代码？

您可以选择 [VSCode](https://code.visualstudio.com/Download) 或者您常用的任何 IDE 编辑器，唯一的要求是安装 Node.js 和 npm.

### 环境要求

```
# Node.js ≥ 20
# npm ≥ 10
例如：
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

具体安装步骤如下：

### 在 Windows 上安装 Node.js

```
# Step 1: 访问Node.js官网：https://nodejs.org/，点击下载后，会根据你的系统自动选择合适的版本（32位或64位）。
# Step 2: 运行安装程序：下载完成后，双击运行安装程序。
# Step 3: 完成安装：按照安装向导完成安装过程。
# Step 4: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 在 macOS 上安装 Node.js

```
# Step 1: 使用Homebrew安装（推荐方法）：打开终端。输入命令brew install node并回车。如果尚未安装Homebrew，需要先安装Homebrew，
可以通过在终端中运行如下命令来安装：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
或者使用官网安装程序：访问Node.js官网。下载macOS的.pkg安装包。打开下载的.pkg文件，按照提示完成安装。
# Step 2: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 安装完后按照如下步骤操作：

```
# Step 1: 下载代码包
# Step 2: 解压代码包
# Step 3: 用IDE打开代码包，进入代码目录
# Step 4: IDE终端输入命令行，安装依赖：npm i
# Step 5: IDE终端输入命令行，启动开发服务器：npm run dev -- --host 127.0.0.1
```
### 批处理快捷操作

```
@echo off & pushd "%~dp0" & color F0

net session >nul 2>&1 
if %errorlevel% equ 0 goto :Setup-1

where powershell >nul 2>&1 && ( 
    powershell -Command "Start-Process '%~sdpnx0' -Verb RunAs" >nul 2>&1 
) || ( 
    mshta vbscript:CreateObject("Shell.Application").ShellExecute("%~s0","","","runas",1)(window.close) >nul 2>&1 
) 
exit /b 

:Setup-1
setlocal enabledelayedexpansion
cls
title HTML说明文档制作工具 一键部署

REM 设置端口号
set "allowed=1 2 3 5 6 8 9"

set index=0
for %%d in (%allowed%) do (
    set "allowed[!index!]=%%d"
    set /a index+=1
)
set /a maxIndex=index-1

set /a firstIndex=!random! %% !index!
set "number=!allowed[%firstIndex%]!"

for /l %%i in (1,1,3) do (
    set /a digit=!random! %% 10
    set "number=!number!!digit!"
)

for /f "tokens=16" %%i in ('ipconfig ^|find /i "ipv4"') do set myip=%%i

reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall" /s | findstr /i /c:"Node.js" >nul
if %errorlevel% equ 0 goto Setup-2

reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall" /s | findstr /i /c:"Node.js" >nul
if %errorlevel% equ 0 goto Setup-2

echo.
echo 您的系统没有安装Node.js，按任意键跳转Node.js官网
echo.
pasue>nul
start https://nodejs.org/zh-cn/download
goto Setup-2

:Setup-2

if not exist "%cd%\.npmi" (goto npmi-config) else (goto Setup-3)

:npmi-config

call npm install -g cnpm --registry=https://registry.npmmirror.com

call npm config set registry https://registry.npmmirror.com

call cnpm install

goto size

:size
cls
set "limit=104857600"

:: 取当前目录（含子目录）总字节数
for /f "tokens=3" %%s in ('dir /s /-c ^| findstr /c:"个文件"') do set "size=%%s"

:: 小于限制直接退出
if %size% LSS %limit% exit /b

:: 到这里说明 ≥100 MB，生成标记文件
echo. >".npmi"

:Setup-3
cls
color F0
title HTML说明文档制作工具 启动服务

echo.
echo   请选择：
echo.
echo 1、本机启动服务
echo.
echo 2、局域网启动服务
echo.
echo 3、退出/停止服务
echo.
choice /C 123 /N >nul

if errorlevel 3 goto stopSrv
if errorlevel 2 goto lanSrv
if errorlevel 1 goto localSrv

:localSrv
cls
title 本机启动
start "" npx vite --host 127.0.0.1 --port %number%
timeout /t 2 /nobreak >nul
start http://127.0.0.1:%number%/
echo.
echo 已打开网页，按任意键返回...
pause >nul
goto Setup-3

:lanSrv
cls
title 局域网启动
start "" npx vite --host %myip% --port %number%
timeout /t 2 /nobreak >nul
start http://%myip%:%number%/
echo.
echo 已打开网页，按任意键返回...
pause >nul
goto Setup-3

:stopSrv
cls
title 杀掉 vite/node 进程（兼容 Win10/11）
echo 正在停止服务...
taskkill /F /IM node.exe      >nul 2>&1
taskkill /F /IM vite.exe      >nul 2>&1
taskkill /F /IM cmd.exe /FI "WindowTitle eq *vite*" >nul 2>&1
echo.
echo 服务已停止，按任意键返回...
pause >nul
goto Setup-3
```

### 如何开发后端服务？

配置环境变量，安装相关依赖
如需使用数据库，请使用 supabase 官方版本或自行部署开源版本的 Supabase

### 如何配置应用中的三方 API？

具体三方 API 调用方法，请参考帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。

## 了解更多

您也可以查看帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。
