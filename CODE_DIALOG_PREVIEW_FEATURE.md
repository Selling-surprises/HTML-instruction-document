# 插入代码对话框实时预览功能

## 功能概述

在插入代码对话框中新增了实时预览和主题切换功能，用户可以在输入代码的同时查看高亮效果，并即时切换不同的代码主题，实现所见即所得的编辑体验。

## 主要特性

### 1. 实时代码预览
- **左右分栏布局**：左侧输入代码，右侧实时预览
- **即时高亮渲染**：使用highlight.js实时渲染代码高亮
- **语言自动识别**：根据选择的编程语言自动应用对应的语法高亮
- **预览同步**：输入内容变化时预览区域自动更新

### 2. 主题即时切换
- **对话框内切换**：在插入代码对话框中直接选择主题
- **预览即时更新**：切换主题后预览区域立即显示新主题效果
- **全局同步应用**：选择的主题自动应用到整个编辑器
- **8种主题可选**：支持浅色和深色多种主题风格

### 3. 优化的用户体验
- **所见即所得**：预览效果与插入后的显示完全一致
- **直观对比**：可以快速切换主题对比不同效果
- **更大对话框**：扩展至max-w-4xl，提供更舒适的编辑空间
- **响应式布局**：预览区域自动适应内容高度

## 使用流程

1. **打开对话框**
   - 点击工具栏中的"插入代码"按钮（`</>` 图标）

2. **选择语言和主题**
   - 左上方：选择编程语言（JavaScript、Python等）
   - 右上方：选择代码主题（Atom One Dark、GitHub等）

3. **输入代码并预览**
   - 在左侧文本框输入代码
   - 右侧预览区域实时显示高亮效果

4. **调整主题（可选）**
   - 切换不同主题查看效果
   - 选择最满意的主题

5. **插入代码**
   - 点击"插入代码"按钮
   - 代码以选择的主题插入到文档中

## 技术实现

### 核心技术
```typescript
// 实时预览实现
useEffect(() => {
  if (code.trim() && language) {
    try {
      const highlighted = hljs.highlight(code, { language }).value;
      setPreviewHtml(highlighted);
    } catch (error) {
      // 降级处理：使用纯文本
      setPreviewHtml(code.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }
  } else {
    setPreviewHtml('');
  }
}, [code, language]);
```

### 布局结构
```tsx
<DialogContent className="max-w-4xl">
  {/* 顶部：语言和主题选择器 */}
  <div className="grid grid-cols-2 gap-4">
    <Select value={language} onValueChange={setLanguage}>...</Select>
    <Select value={currentTheme} onValueChange={onThemeChange}>...</Select>
  </div>
  
  {/* 主体：输入和预览区域 */}
  <div className="grid grid-cols-2 gap-4">
    <Textarea value={code} onChange={...} />
    <div className="preview">
      <pre><code dangerouslySetInnerHTML={{ __html: previewHtml }} /></pre>
    </div>
  </div>
</DialogContent>
```

### 状态管理
- **本地状态**：`code`（代码内容）、`language`（编程语言）、`previewHtml`（预览HTML）
- **全局状态**：`currentTheme`（当前主题）通过props传递
- **状态同步**：主题变化通过`onThemeChange`回调同步到全局

## 修改的文件

### src/components/editor/CodeDialog.tsx
- 添加`currentTheme`和`onThemeChange` props
- 导入`CODE_THEMES`和`hljs`
- 新增`previewHtml`状态和实时预览逻辑
- 扩展对话框宽度至`max-w-4xl`
- 实现左右分栏布局
- 添加主题选择器

### src/components/editor/EditorToolbar.tsx
- 接口添加`currentCodeTheme`和`onCodeThemeChange`属性
- 将主题相关props传递给CodeDialog

### src/pages/Editor.tsx
- 传递`settings.codeTheme`和主题切换回调给EditorToolbar
- 确保主题状态在整个应用中同步

## 用户价值

### 提升效率
- ✅ 无需插入后再调整主题
- ✅ 实时预览减少试错成本
- ✅ 一次性完成代码输入和主题选择

### 改善体验
- ✅ 所见即所得，直观可靠
- ✅ 即时反馈，操作流畅
- ✅ 对比方便，选择轻松

### 增强功能
- ✅ 预览功能补充了主题切换的完整性
- ✅ 对话框成为独立的代码编辑环境
- ✅ 降低了主题选择的学习成本

## 兼容性

- ✅ 所有现代浏览器（Chrome、Firefox、Safari、Edge）
- ✅ 支持所有24种编程语言
- ✅ 兼容所有8种代码主题
- ✅ 响应式布局适配不同屏幕尺寸

## 注意事项

1. **预览准确性**
   - 预览效果与插入后的显示完全一致
   - 使用相同的highlight.js渲染引擎
   - 应用相同的主题CSS

2. **性能优化**
   - 使用useEffect避免不必要的重新渲染
   - 预览仅在代码或语言变化时更新
   - 主题CSS通过CDN缓存加速加载

3. **错误处理**
   - 高亮失败时自动降级为纯文本显示
   - 确保预览区域始终有内容显示
   - 避免因语法错误导致预览崩溃

## 版本信息

- **版本号**：v1.1
- **发布日期**：2025-12-06
- **更新类型**：功能增强
- **向后兼容**：完全兼容v1.0
