# 代码块功能更新说明

## 更新内容

### 1. 代码主题切换功能（最新 - v1.2）
- 提供**23种**代码高亮主题供用户选择（从8种扩展到23种）
- **新增**：主题分类功能（经典、现代、复古、明亮、特殊5大类）
- **新增**：15种全新主题，包括Solarized、Gruvbox、Night Owl、Shades of Purple、Rainbow等
- **新增**：A11y无障碍高对比度主题，符合WCAG标准
- **新增**：插入代码对话框内置实时预览功能
- **新增**：在对话框中可直接切换主题并查看效果
- 支持在设置面板中切换主题，立即生效
- 导出HTML时自动应用选择的主题
- 详细说明请查看 [CODE_THEME_FEATURE.md](./CODE_THEME_FEATURE.md)

### 2. 新增 VBScript 语言支持
- 在代码插入对话框中新增了 VBScript 语言选项
- 支持 VBScript 代码的语法高亮显示
- 适用于 Windows 脚本编程场景

### 3. 新增 PowerShell 语言支持
- 在代码插入对话框中新增了 PowerShell 语言选项
- 支持 PowerShell 代码的语法高亮显示

### 4. 修复语言名称显示问题
- 修复了语言名称前面出现多余空格的问题
- 所有语言现在都显示正确的格式化名称（如 "JavaScript"、"PowerShell"、"VBScript" 等）

### 5. 代码块交互功能
#### 编辑模式
- **删除按钮**：在文档编辑时，每个代码块右上角显示红色"删除"按钮
  - 点击后会弹出确认对话框
  - 确认后删除整个代码块
  
- **复制按钮**：每个代码块右上角显示蓝色"复制"按钮
  - 点击后自动复制代码到剪贴板
  - 复制成功后按钮会短暂显示"已复制"并变为绿色
  - 修复了"复制失败"的误报问题

#### 导出模式
- **删除按钮**：导出的 HTML 文件中不显示删除按钮（类似链接卡片的处理方式）
- **复制按钮**：导出的 HTML 文件中保留复制按钮，方便读者复制代码
  - 包含完整的复制功能实现
  - 支持现代浏览器的 Clipboard API
  - 提供降级方案支持旧版浏览器
  - 复制成功后按钮会显示视觉反馈

### 6. 代码高亮增强
- 支持动态切换代码高亮主题（8种主题可选）
- 使用 highlight.js 进行语法高亮
- 支持 24 种编程语言的语法高亮：
  - JavaScript, TypeScript, Python, Java
  - C++, C#, PHP, Ruby, Go, Rust
  - Swift, Kotlin, HTML, CSS, SQL
  - Bash, PowerShell, VBScript, JSON, XML, YAML
  - Markdown, 纯文本

### 7. 导出功能优化
- 导出的 HTML 文件包含完整的代码高亮样式
- 导出的 HTML 文件包含代码复制功能的 JavaScript 实现
- 导出时自动应用用户选择的代码主题
- 确保导出的文档可以独立使用，无需额外依赖

## 修复的问题

### 问题：复制成功但提示"复制失败"
**原因**：在 Promise 回调中无法正确访问 `event.target` 对象

**解决方案**：
1. 修改按钮的 `onclick` 事件，将按钮元素 `this` 作为参数传递给 `copyCodeBlock` 函数
2. 在 `copyCodeBlock` 函数中接受 `buttonElement` 参数
3. 使用传入的按钮元素来更新按钮状态，而不是依赖 `event.target`
4. 添加错误日志输出，方便调试

**技术细节**：
```javascript
// 修改前（有问题）
onclick="window.copyCodeBlock('code-id')"
// 在函数内部使用 event.target（可能不可用）

// 修改后（正确）
onclick="window.copyCodeBlock('code-id', this)"
// 显式传递按钮元素
```

## 支持的语言列表

| 语言 | 显示名称 | 语法高亮 |
|------|---------|---------|
| javascript | JavaScript | ✅ |
| typescript | TypeScript | ✅ |
| python | Python | ✅ |
| java | Java | ✅ |
| cpp | C++ | ✅ |
| csharp | C# | ✅ |
| php | PHP | ✅ |
| ruby | Ruby | ✅ |
| go | Go | ✅ |
| rust | Rust | ✅ |
| swift | Swift | ✅ |
| kotlin | Kotlin | ✅ |
| html | HTML | ✅ |
| css | CSS | ✅ |
| sql | SQL | ✅ |
| bash | Bash | ✅ |
| powershell | PowerShell | ✅ |
| vbscript | VBScript | ✅ |
| json | JSON | ✅ |
| xml | XML | ✅ |
| yaml | YAML | ✅ |
| markdown | Markdown | ✅ |
| plaintext | 纯文本 | - |

## 使用方法

### 切换代码主题

**方法一：在插入代码对话框中切换（推荐）**
1. 点击工具栏中的"插入代码"按钮
2. 在对话框右上方选择"代码主题"
3. 左侧输入代码，右侧实时预览高亮效果
4. 切换主题立即看到预览变化
5. 选择的主题自动应用到整个编辑器

**方法二：在设置面板中切换**
1. 打开右侧设置面板
2. 在"基本设置"部分找到"代码高亮主题"
3. 从下拉菜单中选择喜欢的主题
4. 编辑器中的代码块立即应用新主题
5. 导出的HTML文件也会使用选择的主题

### 插入代码块
1. 点击工具栏中的代码图标（`</>`）
2. 在对话框中选择编程语言
3. 输入或粘贴代码
4. 点击"插入代码"按钮

### 复制代码
- **编辑模式**：点击代码块右上角的蓝色"复制"按钮
- **导出后**：在导出的 HTML 文件中点击"复制"按钮
- 复制成功后，按钮会短暂变为绿色并显示"已复制"

### 删除代码块
- **编辑模式**：点击代码块右上角的红色"删除"按钮，确认后删除
- **导出后**：导出的 HTML 文件中不显示删除按钮

## 技术实现

### 代码主题
- 动态加载主题CSS，避免打包所有主题
- 使用CDN加速主题资源加载
- 支持8种精选主题（浅色和深色）
- 主题切换时自动清理旧样式

### 代码高亮
- 使用 highlight.js 库进行语法高亮
- 采用 Atom One Dark 配色方案
- 支持按需加载语言模块

### 代码存储
- 代码内容存储在 `data-code` 属性中
- 语言类型存储在 `data-language` 属性中
- 确保特殊字符正确转义

### 复制功能实现
- 按钮元素通过 `this` 参数显式传递
- 避免依赖 `event.target`（在异步回调中可能不可用）
- 提供清晰的视觉反馈（按钮颜色和文本变化）

### 浏览器兼容性
- 现代浏览器：使用 Clipboard API
- 旧版浏览器：使用 document.execCommand 降级方案
- 支持 Chrome、Firefox、Safari、Edge 等主流浏览器
