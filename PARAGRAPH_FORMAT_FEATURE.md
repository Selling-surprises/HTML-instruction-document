# 首行缩进功能说明

## 功能概述

为离线Word文档编辑器添加了首行缩进功能，提供专业的文档排版能力。

## 功能特性

### 首行缩进

**功能描述**：
- 为段落设置首行缩进，符合中文排版规范
- 缩进距离：2个字符（2em）
- 支持切换开关：点击一次开启，再点击一次关闭

**使用方法**：
1. 将光标放在需要设置首行缩进的段落中
2. 点击工具栏中的"首行缩进"按钮（段落图标）
3. 段落首行将自动缩进2个字符
4. 再次点击可取消首行缩进

**适用元素**：
- 段落（P标签）
- DIV元素
- 标题（H1-H6）

**视觉反馈**：
- 设置成功：显示"已设置首行缩进 - 段落首行缩进2个字符"
- 取消成功：显示"已取消首行缩进 - 段落首行缩进已移除"

## 技术实现

### 工具栏按钮

**位置**：在缩进按钮组后面，对齐按钮组前面

**图标**：
- 首行缩进：`PilcrowSquare`（段落符号）

### 实现原理

#### 首行缩进
```javascript
// 使用CSS的text-indent属性
paragraph.style.textIndent = '2em'; // 开启
paragraph.style.textIndent = '0';   // 关闭
```

### 段落查找逻辑

1. 获取当前光标位置的元素
2. 如果是文本节点，获取其父元素
3. 向上遍历DOM树，查找段落元素（P、DIV、H1-H6）
4. 对找到的段落元素应用样式
5. 如果未找到段落元素，提示用户将光标放在段落中

### 选区处理

**自动创建选区**：
- 检查当前是否有选区
- 如果没有选区，自动在编辑器的第一个子元素创建默认选区
- 确保即使用户没有先点击编辑器，功能也能正常工作

```javascript
let selection = window.getSelection();
if (!selection || selection.rangeCount === 0) {
  const firstChild = editor.firstChild;
  if (firstChild) {
    const range = document.createRange();
    range.setStart(firstChild, 0);
    range.setEnd(firstChild, 0);
    selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
```

### 状态切换

**首行缩进**：
- 检查当前`textIndent`值
- 如果是`2em`，切换为`0`
- 否则，设置为`2em`

## 修改的文件

### 1. src/components/editor/EditorToolbar.tsx

**导入图标**：
```typescript
import {
  // ... 其他图标
  PilcrowSquare,  // 首行缩进图标
} from 'lucide-react';
```

**添加按钮**：
```tsx
{/* 段落格式 */}
<div className="flex items-center gap-1">
  <Button
    variant="ghost"
    size="icon"
    onClick={() => onCommand('textIndent')}
    title="首行缩进"
  >
    <PilcrowSquare className="h-4 w-4" />
  </Button>
</div>
```

### 2. src/pages/Editor.tsx

**在handleCommand函数中添加命令处理**：

- `textIndent`命令：处理首行缩进

**实现细节**：
- 查找当前段落元素
- 应用或切换CSS样式
- 更新编辑器内容
- 显示操作反馈
- 自动创建选区（如果不存在）

## 使用场景

### 首行缩进
- 中文文章排版
- 正式文档编写
- 书籍章节内容
- 论文正文部分

## 注意事项

1. **段落识别**
   - 功能仅对段落元素（P、DIV、H1-H6）生效
   - 如果光标不在段落中，会提示用户

2. **样式保留**
   - 设置的样式会保存在HTML中
   - 导出的文档会保留这些格式

3. **兼容性**
   - 使用标准CSS属性，兼容所有现代浏览器
   - 导出的HTML在其他编辑器中也能正确显示

4. **与其他格式的关系**
   - 首行缩进不影响其他文本格式（字体、颜色等）
   - 不影响段落对齐方式

## 快捷操作建议

1. **批量设置**
   - 可以逐段设置首行缩进
   - 建议先完成内容编写，再统一调整格式

2. **格式预览**
   - 设置后立即生效，可实时查看效果
   - 不满意可以立即调整

3. **格式清除**
   - 首行缩进：再次点击按钮即可清除

## 问题修复

### 选区丢失问题（已修复）

**问题描述**：
- 点击首行缩进按钮时可能完全没有反应，没有任何反馈

**问题原因**：
- 当用户点击工具栏按钮时，焦点从编辑器移到按钮
- 虽然代码中有`editor.focus()`，但选区可能已经丢失
- 导致`window.getSelection()`返回null或rangeCount为0
- 无法找到当前段落元素，功能完全失效

**修复方案**：
- 在处理命令前检查是否有选区
- 如果没有选区，自动在编辑器的第一个子元素创建一个默认选区
- 确保即使用户没有先点击编辑器，功能也能正常工作

**修复后的逻辑**：
```javascript
// 检查并创建选区
let selection = window.getSelection();
if (!selection || selection.rangeCount === 0) {
  const firstChild = editor.firstChild;
  if (firstChild) {
    const range = document.createRange();
    range.setStart(firstChild, 0);
    range.setEnd(firstChild, 0);
    selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
```

## 版本历史

### v1.1 - 移除段落间距功能
- 移除段落间距按钮和相关代码
- 保留首行缩进功能
- 简化工具栏布局

### v1.0 - 初始版本
- 添加首行缩进功能
- 修复选区丢失问题

## 未来改进方向

1. **批量操作**
   - 支持选中多个段落同时设置
   - 提供"全文应用"功能

2. **格式刷**
   - 复制一个段落的格式
   - 应用到其他段落

3. **样式模板**
   - 预设多种段落样式
   - 一键应用常用格式组合

4. **自定义缩进**
   - 提供输入框自定义缩进值
   - 保存常用缩进预设
