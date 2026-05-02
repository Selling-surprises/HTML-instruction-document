# 代码主题切换功能说明

## 功能概述

为离线Word文档编辑器添加了代码高亮主题切换功能，用户可以根据个人喜好选择不同的代码配色方案，提升代码阅读体验。

## 功能特性

### 多种主题选择

提供**23种**精心挑选的代码高亮主题，按风格分为5大类：

#### 经典主题（6种）
| 主题名称 | 类型 | 特点描述 |
|---------|------|---------|
| **Atom One Dark** | 深色 | 柔和对比，护眼舒适（默认） |
| **GitHub** | 浅色 | 清新简洁，GitHub风格 |
| **Monokai** | 深色 | 经典配色，高对比度 |
| **Dracula** | 深色 | 紫色调，优雅神秘 |
| **Visual Studio** | 浅色 | 专业风格，VS经典配色 |
| **VS 2015** | 深色 | 专业风格，VS深色主题 |

#### 现代主题（4种）
| 主题名称 | 类型 | 特点描述 |
|---------|------|---------|
| **Nord** | 深色 | 冷色调，北欧风格 |
| **Tokyo Night** | 深色 | 夜间主题，护眼舒适 |
| **Night Owl** | 深色 | 夜猫子主题，蓝紫色调 |
| **Shades of Purple** | 深色 | 紫色渐变，独特炫彩 |

#### 复古主题（5种）
| 主题名称 | 类型 | 特点描述 |
|---------|------|---------|
| **Solarized Light** | 浅色 | 经典Solarized浅色 |
| **Solarized Dark** | 深色 | 经典Solarized深色 |
| **Gruvbox Light** | 浅色 | 复古暖色调浅色 |
| **Gruvbox Dark** | 深色 | 复古暖色调深色 |
| **Zenburn** | 深色 | 低对比度，护眼舒适 |

#### 明亮主题（3种）
| 主题名称 | 类型 | 特点描述 |
|---------|------|---------|
| **Tomorrow Night Bright** | 深色 | 明亮的深色主题 |
| **Xcode** | 浅色 | Apple Xcode风格 |
| **Android Studio** | 浅色 | Android Studio风格 |

#### 特殊主题（5种）
| 主题名称 | 类型 | 特点描述 |
|---------|------|---------|
| **A11y Light** | 浅色 | 高对比度浅色，无障碍 |
| **A11y Dark** | 深色 | 高对比度深色，无障碍 |
| **Rainbow** | 彩色 | 彩虹配色，多彩炫丽 |
| **Gradient Light** | 浅色 | 渐变浅色，现代时尚 |
| **Gradient Dark** | 深色 | 渐变深色，现代时尚 |

### 实时预览（新增）

- **插入代码对话框内置预览**：输入代码时右侧实时显示高亮效果
- **主题即时切换**：在对话框中切换主题立即看到预览变化
- **所见即所得**：预览效果与插入后的显示完全一致
- **编辑器同步更新**：选择主题后编辑器中的所有代码块同步更新
- **无需刷新页面**：所有操作实时生效

### 导出保留

- 导出的HTML文件自动应用选择的主题
- 确保导出文档的代码显示与编辑器一致
- 导出文件可独立使用，无需额外配置

## 使用方法

### 方法一：在插入代码对话框中切换主题（推荐）

1. 点击工具栏中的"插入代码"按钮（`</>` 图标）
2. 在弹出的对话框中：
   - **左上方**：选择"编程语言"（JavaScript、Python等）
   - **右上方**：选择"代码主题"（Atom One Dark、GitHub等）
3. 在左侧文本框输入代码内容
4. **右侧实时预览区域**会立即显示应用主题后的效果
5. 切换不同主题可即时看到预览效果变化
6. 选择的主题会自动保存并应用到整个编辑器

**优势**：
- ✅ 实时预览效果，所见即所得
- ✅ 边输入代码边调整主题
- ✅ 直观对比不同主题的显示效果

### 方法二：在设置面板中切换主题

1. 打开右侧设置面板
2. 在"基本设置"部分找到"代码高亮主题"选项
3. 点击下拉菜单查看所有可用主题
4. 选择喜欢的主题
5. 编辑器中的所有代码块立即应用新主题

**优势**：
- ✅ 统一调整所有代码块的主题
- ✅ 快速切换查看整体效果

### 主题选择建议

#### 浅色主题（适合白天使用）
- **GitHub**：简洁清爽，适合长时间阅读
- **Visual Studio**：专业规范，适合正式文档
- **Solarized Light**：经典配色，护眼舒适
- **Gruvbox Light**：复古暖色，温馨柔和
- **Xcode**：Apple风格，简洁优雅
- **Android Studio**：现代风格，清晰明了
- **A11y Light**：高对比度，视觉清晰
- **Gradient Light**：渐变效果，时尚现代

#### 深色主题（适合夜间使用）
- **Atom One Dark**：柔和舒适，默认推荐
- **Tokyo Night**：护眼配色，夜间首选
- **Night Owl**：蓝紫色调，夜猫子最爱
- **Dracula**：独特紫调，个性鲜明
- **Monokai**：经典配色，高对比度
- **VS 2015**：专业深色，VS用户熟悉
- **Nord**：冷色调，清新淡雅
- **Solarized Dark**：经典深色，护眼舒适
- **Gruvbox Dark**：复古暖色，温馨护眼
- **Zenburn**：低对比度，长时间编码首选
- **Tomorrow Night Bright**：明亮深色，清晰可读
- **A11y Dark**：高对比度，视觉清晰
- **Gradient Dark**：渐变效果，时尚现代

#### 特殊风格主题
- **Shades of Purple**：紫色渐变，独特炫彩，适合追求个性的用户
- **Rainbow**：彩虹配色，多彩炫丽，适合演示和展示
- **Gradient Light/Dark**：渐变效果，现代时尚，适合追求视觉效果的用户

#### 无障碍主题
- **A11y Light/Dark**：高对比度设计，符合WCAG无障碍标准，适合视力障碍用户

## 技术实现

### 动态主题加载

使用动态CSS加载技术，避免打包所有主题文件：

```javascript
// 动态加载代码主题CSS
useEffect(() => {
  // 移除旧的主题样式
  const oldThemeLink = document.getElementById('hljs-theme');
  if (oldThemeLink) {
    oldThemeLink.remove();
  }

  // 添加新的主题样式
  const link = document.createElement('link');
  link.id = 'hljs-theme';
  link.rel = 'stylesheet';
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${settings.codeTheme}.min.css`;
  document.head.appendChild(link);
}, [settings.codeTheme]);
```

### 导出HTML集成

导出的HTML文件自动引入选择的主题：

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${settings.codeTheme}.min.css">
```

### 类型安全

使用TypeScript类型定义确保主题选择的安全性：

```typescript
export type CodeTheme = 
  | 'atom-one-dark'
  | 'github'
  | 'monokai'
  | 'dracula'
  | 'vs'
  | 'vs2015'
  | 'nord'
  | 'tokyo-night';
```

## 修改的文件

### 1. src/types/editor.ts

**新增类型定义**：
- `CodeTheme` 类型：定义所有可用的主题值
- `CODE_THEMES` 常量：主题列表配置，包含值、标签和描述
- `EditorSettings` 接口：添加 `codeTheme` 字段

### 2. src/pages/Editor.tsx

**主题加载**：
- 移除静态导入的 `atom-one-dark.css`
- 添加 `useEffect` 动态加载主题CSS
- 主题切换时自动清理旧样式并加载新样式

**导出功能**：
- 在导出的HTML `<head>` 中添加主题CSS链接
- 确保导出文档使用选择的主题

**默认设置**：
- 设置默认主题为 `atom-one-dark`

### 3. src/components/editor/SettingsPanel.tsx

**UI组件**：
- 导入 `Select` 组件和 `CODE_THEMES` 配置
- 在基本设置部分添加代码主题选择器
- 显示主题名称和描述信息
- 绑定主题切换事件

### 4. src/components/editor/CodeDialog.tsx（新增）

**实时预览功能**：
- 添加 `currentTheme` 和 `onThemeChange` props
- 导入 `CODE_THEMES` 和 `hljs` 用于代码高亮
- 添加 `previewHtml` 状态存储预览内容
- 使用 `useEffect` 监听代码和语言变化，实时生成高亮预览

**UI增强**：
- 对话框宽度扩大至 `max-w-4xl`，容纳预览区域
- 采用左右分栏布局：左侧输入，右侧预览
- 顶部添加主题选择器，与语言选择器并排
- 预览区域使用 `hljs` 类名和动态HTML渲染

### 5. src/components/editor/EditorToolbar.tsx

**接口更新**：
- `EditorToolbarProps` 添加 `currentCodeTheme` 和 `onCodeThemeChange` 属性
- 函数参数中接收并传递主题相关props

**组件传递**：
- 将主题相关props传递给 `CodeDialog` 组件
- 确保工具栏和对话框的主题状态同步

## 兼容性

### 浏览器支持
- 所有现代浏览器（Chrome、Firefox、Safari、Edge）
- 需要支持动态CSS加载
- 需要网络连接以加载CDN资源

### 离线使用
- 编辑器需要网络连接以加载主题CSS
- 导出的HTML文件也需要网络连接以显示代码高亮
- 如需完全离线使用，可考虑将主题CSS内联到HTML中

## 注意事项

1. **网络依赖**
   - 主题CSS从CDN加载，需要网络连接
   - 首次切换主题时可能有短暂延迟

2. **主题切换**
   - 切换主题后立即生效
   - 不影响已有代码内容，仅改变显示样式

3. **导出一致性**
   - 导出的HTML使用当前选择的主题
   - 确保导出前选择合适的主题

4. **性能优化**
   - 使用CDN加速主题加载
   - 动态加载避免打包体积增大
   - 主题切换时自动清理旧样式

## 未来改进方向

1. **更多主题**
   - 添加更多流行的代码主题
   - 支持自定义主题配置

2. **离线支持**
   - 提供主题CSS内联选项
   - 支持完全离线使用

3. **主题预览**（已实现 ✅）
   - ~~添加主题预览功能~~
   - ~~在选择前查看主题效果~~
   - 已在插入代码对话框中实现实时预览

4. **自动切换**
   - 根据系统深色模式自动切换主题
   - 支持定时切换（白天/夜间）

## 版本历史

### v1.2 - 主题扩展版本（当前版本）
- **新增**：15种全新代码高亮主题，总数达到23种
- **新增**：主题分类功能，按经典、现代、复古、明亮、特殊5大类组织
- **新增**：Solarized、Gruvbox、Night Owl、Shades of Purple等流行主题
- **新增**：A11y无障碍高对比度主题
- **新增**：Rainbow彩虹主题和Gradient渐变主题
- **优化**：主题选择器支持分类显示，更易查找
- **优化**：显示主题总数，方便用户了解选择范围

### v1.1 - 实时预览版本
- **新增**：插入代码对话框内置实时预览功能
- **新增**：在对话框中可直接切换主题并查看效果
- **优化**：对话框布局改为左右分栏（输入区+预览区）
- **优化**：使用highlight.js实时渲染代码高亮
- **改进**：主题切换体验更加直观和便捷

### v1.0 - 初始版本
- 添加8种代码高亮主题
- 实现动态主题切换
- 支持导出HTML时应用主题
- 在设置面板中添加主题选择器
