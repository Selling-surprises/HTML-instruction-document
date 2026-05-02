# Bug修复记录

## 修复1：移除未使用的handleInsertToc函数

### 问题描述
在移除目录按钮功能时，虽然从EditorToolbar中移除了onInsertToc prop和相关按钮，但在Editor.tsx中仍保留了handleInsertToc函数的定义。这导致运行时出现 `Uncaught ReferenceError: onInsertToc is not defined` 错误。

### 错误信息
```
Uncaught ReferenceError: onInsertToc is not defined
    at onInsertToc (/src/components/editor/EditorToolbar.tsx:312:21)
```

### 根本原因
在Editor.tsx的第344-386行中，handleInsertToc函数仍然存在，但由于我们已经移除了工具栏中的目录按钮，这个函数不再被使用，却仍然在依赖项中引用了一些变量，导致React在渲染时出现问题。

### 解决方案
从Editor.tsx中完全删除handleInsertToc函数（第344-386行），因为：
1. 工具栏中已经移除了插入目录按钮
2. 导出功能已改为自动生成悬浮目录
3. 不再需要手动插入目录到文档中

### 修改文件
- `src/pages/Editor.tsx`: 删除handleInsertToc函数

### 验证
- ✅ 代码通过lint检查
- ✅ 没有TypeScript错误
- ✅ 应用可以正常运行

---

## 修复2：导出的HTML文件没有生成目录

### 问题描述
用户报告导出的HTML文件中没有生成目录，即使文档中已经添加了H1-H3标题。

### 根本原因
导出函数直接使用了`content`变量和`headings`状态，但存在两个问题：
1. `content`中的标题元素可能没有id属性
2. `headings`状态中的id与导出内容中的标题id不匹配
3. JavaScript代码在条件判断外，当没有标题时会导致错误

### 解决方案
在导出时重新处理内容：
1. 创建临时DOM元素来解析content
2. 提取所有H1-H3标题并为它们设置id
3. 生成新的`exportHeadings`数组
4. 使用处理后的内容和标题生成HTML
5. 将JavaScript代码也放在条件判断内，只在有标题时生成

### 修改文件
- `src/pages/Editor.tsx`: 
  - 在handleExport函数开头添加内容处理逻辑
  - 使用`exportHeadings`替代`headings`
  - 使用`processedContent`替代`content`
  - 更新依赖项数组，移除`headings`
  - 将JavaScript代码移到条件判断内

### 代码变更
```typescript
// 创建临时div来处理内容
const tempDiv = document.createElement('div');
tempDiv.innerHTML = content;

// 提取并设置标题ID
const headingElements = tempDiv.querySelectorAll('h1, h2, h3');
const exportHeadings: HeadingItem[] = [];

headingElements.forEach((element, index) => {
  const id = `heading-${index}`;
  element.id = id;
  
  exportHeadings.push({
    id,
    level: parseInt(element.tagName[1]),
    text: element.textContent || '',
    element: element as HTMLElement,
  });
});

const processedContent = tempDiv.innerHTML;

// JavaScript代码也放在条件判断内
${exportHeadings.length > 0 ? `
  <script>
    // 目录相关JavaScript代码
  </script>
` : ''}
```

### 验证
- ✅ 导出的HTML包含正确的目录结构
- ✅ 目录链接可以正确跳转到对应标题
- ✅ 没有标题时不会生成目录和相关JavaScript
- ✅ 代码通过lint检查

---

## 修复3：插入图片按钮的选择文件按钮没有边框

### 问题描述
在ImageDialog组件中，文件选择按钮与背景融合，没有明显的边框和样式，用户体验不佳。

### 根本原因
文件输入框使用了默认的Input组件样式，没有为file类型的input添加特殊样式。

### 解决方案
为文件输入框添加自定义样式：
1. 添加`flex items-center`容器确保垂直对齐
2. 使用Tailwind的`file:`伪类选择器美化文件选择按钮
3. 添加主题色背景和悬停效果

### 修改文件
- `src/components/editor/ImageDialog.tsx`: 
  - 为文件输入框添加容器div
  - 添加完整的file按钮样式类

### 代码变更
```tsx
<div className="flex items-center">
  <Input
    id="image-file"
    type="file"
    accept="image/*"
    onChange={handleFileUpload}
    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
  />
</div>
```

### 验证
- ✅ 文件选择按钮有明显的主题色背景
- ✅ 按钮有悬停效果
- ✅ 与SettingsPanel中的文件选择按钮样式一致
- ✅ 代码通过lint检查

---

## 修复4：改进表格选择和工具栏显示逻辑

### 问题描述
用户报告表格工具栏显示逻辑不够精确，希望只有在选中表格单元格时才显示工具栏，并且能够清空选中的单元格内容。

### 根本原因
原来的实现只检查是否在表格内，没有检查是否真正选中了单元格。

### 解决方案
改进选择检测逻辑：
1. 检查选中的节点是否在表格单元格内
2. 确保找到了cell元素才显示工具栏
3. 添加"清空选中单元格"功能
4. 保留"删除整个表格"功能

### 修改文件
- `src/components/editor/TableToolbar.tsx`:
  - 改进handleSelectionChange函数，检查cell元素
  - 添加deleteSelected函数清空单元格内容
  - 更新UI，添加"清空"按钮

### 代码变更
```typescript
// 查找选中内容是否在表格内
let node = selection.anchorNode;
let table: HTMLTableElement | null = null;
let cell: HTMLTableCellElement | null = null;

while (node && node !== editor) {
  if (!cell && (node instanceof HTMLTableCellElement)) {
    cell = node;
  }
  if (node instanceof HTMLTableElement) {
    table = node;
    break;
  }
  node = node.parentNode;
}

// 只有当在表格单元格内时才显示工具栏
if (table && cell) {
  setSelectedTable(table);
  setVisible(true);
}
```

### 验证
- ✅ 只有选中表格单元格时才显示工具栏
- ✅ 可以清空选中单元格的内容
- ✅ 可以删除整个表格
- ✅ 代码通过lint检查

---

## 修复5：修复所有文件选择按钮的文字居中问题

### 问题描述
SettingsPanel中的文件选择按钮的"选择文件"文字没有垂直居中。

### 根本原因
`flex items-center`类错误地添加在Input组件上，而不是容器div上。

### 解决方案
将`flex items-center`从Input组件移到外层容器div：
1. 为每个文件输入添加容器div
2. 在容器div上应用`flex items-center`
3. 从Input组件的className中移除`flex items-center`

### 修改文件
- `src/components/editor/SettingsPanel.tsx`:
  - Favicon文件输入添加容器div
  - 背景图片文件输入添加容器div

### 代码变更
```tsx
<TabsContent value="local" className="space-y-2">
  <div className="flex items-center">
    <Input
      id="favicon"
      type="file"
      accept="image/*"
      onChange={(e) => handleFileUpload('favicon', e)}
      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
    />
  </div>
</TabsContent>
```

### 验证
- ✅ 所有文件选择按钮的文字都垂直居中
- ✅ 样式统一一致
- ✅ 代码通过lint检查

---

## 修复时间
2025-12-06

## 状态
✅ 所有问题已修复
