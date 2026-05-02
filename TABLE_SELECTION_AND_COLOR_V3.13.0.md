# 表格选择和颜色功能增强 v3.13.0

## 📋 更新概述

本次更新完全重写了表格单元格选择逻辑，并新增了背景颜色自定义功能：

1. ✅ **精确的矩形选区**：选中两列时不会误选两行
2. ✅ **自定义选择逻辑**：不再依赖浏览器的文本选区API
3. ✅ **背景颜色自定义**：支持更改单元格背景颜色
4. ✅ **更好的交互体验**：阻止文本选择，点击外部自动隐藏工具栏

---

## 🎯 问题分析

### 问题1：选中两列时会误选两行

#### 原因分析
之前的实现使用了浏览器的原生选区API（`window.getSelection()`），这个API主要用于文本选择，不适合表格单元格选择：

```typescript
// 旧的实现（有问题）
const selection = window.getSelection();
const range = selection.getRangeAt(0);

// 使用 containsNode 判断单元格是否在选区内
if (selection.containsNode(cell, true)) {
  cells.push(cell);
}
```

**问题**：
- `containsNode` 会包含选区边界附近的所有节点
- 用户想选中两列，但选区可能包含相邻的行
- 选择行为不可预测，用户体验差

#### 解决方案
实现自定义的矩形选区逻辑：

```typescript
// 新的实现（精确）
const getCellsInRange = (start: HTMLTableCellElement, end: HTMLTableCellElement) => {
  // 计算起始和结束单元格的行列索引
  const startRow = (start.parentElement as HTMLTableRowElement).rowIndex;
  const endRow = (end.parentElement as HTMLTableRowElement).rowIndex;
  const startCol = start.cellIndex;
  const endCol = end.cellIndex;

  // 计算矩形选区的边界
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  // 精确选中矩形区域内的所有单元格
  const cells: HTMLTableCellElement[] = [];
  for (let i = minRow; i <= maxRow; i++) {
    for (let j = minCol; j <= maxCol; j++) {
      cells.push(table.rows[i].cells[j]);
    }
  }
  return cells;
};
```

**优势**：
- ✅ 精确的矩形选区
- ✅ 可预测的选择行为
- ✅ 不受浏览器选区API限制

---

## ✨ 主要改进

### 1. 精确的单元格选择 ⭐⭐⭐⭐⭐

#### 选择逻辑对比

**旧版本（v3.12.0）**：
```
用户操作：从 (1,1) 拖动到 (3,2)
实际选中：可能包含 (0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2), (3,0), (3,1), (3,2)

┌─────┬─────┬─────┐
│ ?   │ ?   │ ?   │ ← 可能被误选
├─────┼─────┼─────┤
│ ?   │ ✓   │ ✓   │
├─────┼─────┼─────┤
│ ?   │ ✓   │ ✓   │
├─────┼─────┼─────┤
│ ?   │ ✓   │ ✓   │
└─────┴─────┴─────┘
  ↑ 可能被误选
```

**新版本（v3.13.0）**：
```
用户操作：从 (1,1) 拖动到 (3,2)
实际选中：精确选中 (1,1), (1,2), (2,1), (2,2), (3,1), (3,2)

┌─────┬─────┬─────┐
│     │     │     │ ← 不会被选中
├─────┼─────┼─────┤
│     │ ✓   │ ✓   │ ← 精确选中
├─────┼─────┼─────┤
│     │ ✓   │ ✓   │ ← 精确选中
├─────┼─────┼─────┤
│     │ ✓   │ ✓   │ ← 精确选中
└─────┴─────┴─────┘
```

#### 鼠标事件处理

**鼠标按下（mousedown）**：
```typescript
const handleMouseDown = (e: MouseEvent) => {
  const cell = target.closest('td, th') as HTMLTableCellElement;
  
  if (cell && editor.contains(cell)) {
    isSelecting.current = true;
    startCell.current = cell;
    setSelectedCells([cell]);
    highlightCells([cell]);
    
    // 阻止默认的文本选择
    e.preventDefault();
  }
};
```

**鼠标移动（mousemove）**：
```typescript
const handleMouseMove = (e: MouseEvent) => {
  if (!isSelecting.current || !startCell.current) return;

  const cell = target.closest('td, th') as HTMLTableCellElement;
  
  if (cell && editor.contains(cell)) {
    // 计算矩形选区
    const cells = getCellsInRange(startCell.current, cell);
    if (cells.length > 0) {
      setSelectedCells(cells);
      highlightCells(cells);
    }
  }
};
```

**鼠标释放（mouseup）**：
```typescript
const handleMouseUp = () => {
  if (isSelecting.current && selectedCells.length > 0) {
    // 显示工具栏
    setVisible(true);
  }
  
  isSelecting.current = false;
};
```

#### 选择示例

**示例1：选择单个单元格**
```
点击 (2,1)
┌─────┬─────┬─────┐
│     │     │     │
├─────┼─────┼─────┤
│     │ ✓   │     │ ← 选中
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘
```

**示例2：选择一行**
```
从 (1,0) 拖动到 (1,2)
┌─────┬─────┬─────┐
│     │     │     │
├─────┼─────┼─────┤
│ ✓   │ ✓   │ ✓   │ ← 选中整行
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘
```

**示例3：选择一列**
```
从 (0,1) 拖动到 (2,1)
┌─────┬─────┬─────┐
│     │ ✓   │     │ ← 选中
├─────┼─────┼─────┤
│     │ ✓   │     │ ← 选中
├─────┼─────┼─────┤
│     │ ✓   │     │ ← 选中
└─────┴─────┴─────┘
      ↑ 选中整列
```

**示例4：选择矩形区域**
```
从 (1,1) 拖动到 (2,2)
┌─────┬─────┬─────┐
│     │     │     │
├─────┼─────┼─────┤
│     │ ✓   │ ✓   │ ← 选中
├─────┼─────┼─────┤
│     │ ✓   │ ✓   │ ← 选中
└─────┴─────┴─────┘
      ↑     ↑
    选中矩形区域
```

---

### 2. 背景颜色自定义 ⭐⭐⭐⭐⭐

#### 功能说明

**颜色选择器**：
- 位置：工具栏中部，调色板图标旁边
- 类型：HTML5 原生颜色选择器（`<input type="color">`）
- 默认颜色：白色（#ffffff）

**使用流程**：
```
1. 选中单元格
   ↓
2. 点击颜色选择器
   ↓
3. 选择颜色
   ↓
4. 颜色立即应用到选中的单元格
```

#### 实现细节

```typescript
const changeBackgroundColor = (color: string) => {
  if (!selectedTable || !editorRef.current || selectedCells.length === 0) return;

  // 更改选中单元格的背景颜色
  selectedCells.forEach(cell => {
    // 如果是表头，保持表头样式
    if (cell.tagName === 'TH') {
      return;
    }
    cell.style.backgroundColor = color;
  });
  
  setBackgroundColor(color);
  onContentChange(editorRef.current.innerHTML);
};
```

**特性**：
- ✅ **批量更改**：一次性更改所有选中单元格的背景颜色
- ✅ **保护表头**：自动跳过表头（th标签），保持表头的蓝色样式
- ✅ **实时预览**：选择颜色后立即应用，无需确认
- ✅ **保存到HTML**：背景颜色会保存到HTML中，导出后保留

#### 使用示例

**示例1：更改单个单元格颜色**
```
1. 点击单元格 (1,1)
2. 选择黄色 (#ffff00)

┌─────┬─────┬─────┐
│ 表头│ 表头│ 表头│ ← 蓝色（不变）
├─────┼─────┼─────┤
│     │ 🟨  │     │ ← 黄色
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘
```

**示例2：更改一行颜色**
```
1. 选中第2行 (1,0) 到 (1,2)
2. 选择绿色 (#00ff00)

┌─────┬─────┬─────┐
│ 表头│ 表头│ 表头│ ← 蓝色（不变）
├─────┼─────┼─────┤
│ 🟩  │ 🟩  │ 🟩  │ ← 绿色
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘
```

**示例3：更改矩形区域颜色**
```
1. 选中 (1,1) 到 (2,2)
2. 选择粉色 (#ffc0cb)

┌─────┬─────┬─────┐
│ 表头│ 表头│ 表头│ ← 蓝色（不变）
├─────┼─────┼─────┤
│     │ 🩷  │ 🩷  │ ← 粉色
├─────┼─────┼─────┤
│     │ 🩷  │ 🩷  │ ← 粉色
└─────┴─────┴─────┘
```

**示例4：尝试更改表头颜色（自动跳过）**
```
1. 选中 (0,0) 到 (0,2)（表头行）
2. 选择红色 (#ff0000)

┌─────┬─────┬─────┐
│ 表头│ 表头│ 表头│ ← 蓝色（保持不变）
├─────┼─────┼─────┤
│     │     │     │
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘
```

#### 颜色选择器UI

```
工具栏布局：
┌────────────────────────────────────────────────────┐
│ [+ 行] [- 行] │ [+ 列] [- 列] │ 🎨 [颜色] │ [清空] [删除表格] │
└────────────────────────────────────────────────────┘
                                  ↑
                            调色板图标 + 颜色选择器
```

**颜色选择器样式**：
```tsx
<div className="flex items-center gap-1">
  <Palette className="h-4 w-4 text-muted-foreground" />
  <input
    type="color"
    value={backgroundColor}
    onChange={(e) => changeBackgroundColor(e.target.value)}
    title="更改背景颜色"
    className="w-8 h-8 rounded cursor-pointer border border-border"
  />
</div>
```

---

### 3. 交互体验优化 ⭐⭐⭐⭐

#### 阻止文本选择

**问题**：在表格内拖拽时，浏览器会默认选中文本，导致：
- 选中的文本会高亮显示（蓝色背景）
- 影响单元格选择的视觉效果
- 用户体验不佳

**解决方案**：
```typescript
const handleMouseDown = (e: MouseEvent) => {
  // ...
  
  // 阻止默认的文本选择
  e.preventDefault();
};
```

**效果**：
- ✅ 拖拽时不会选中文本
- ✅ 只高亮选中的单元格
- ✅ 视觉效果更清晰

#### 点击外部隐藏工具栏

**功能**：点击表格外部或编辑区外部时，自动隐藏工具栏并清除选择。

**实现**：
```typescript
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('table') && !target.closest('.table-toolbar')) {
    setVisible(false);
    setSelectedTable(null);
    setSelectedCells([]);
    clearAllHighlights(editor);
  }
};
```

**特性**：
- ✅ 点击表格外部：隐藏工具栏
- ✅ 点击工具栏：不隐藏（可以继续操作）
- ✅ 点击其他表格：切换到新表格

#### 工具栏类名

**添加类名**：`table-toolbar`

**用途**：
- 方便CSS样式定制
- 方便事件处理（如点击外部隐藏）
- 方便调试和测试

```tsx
<div className="table-toolbar absolute z-50 bg-card ...">
  {/* 工具栏内容 */}
</div>
```

---

## 🔍 技术实现细节

### 1. 状态管理

```typescript
// 选中的表格
const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);

// 选中的单元格数组
const [selectedCells, setSelectedCells] = useState<HTMLTableCellElement[]>([]);

// 工具栏位置
const [position, setPosition] = useState({ top: 0, left: 0 });

// 工具栏可见性
const [visible, setVisible] = useState(false);

// 背景颜色
const [backgroundColor, setBackgroundColor] = useState('#ffffff');

// 是否正在选择
const isSelecting = useRef(false);

// 起始单元格
const startCell = useRef<HTMLTableCellElement | null>(null);
```

### 2. 矩形选区算法

```typescript
const getCellsInRange = (start: HTMLTableCellElement, end: HTMLTableCellElement): HTMLTableCellElement[] => {
  const table = start.closest('table');
  if (!table || table !== end.closest('table')) return [];

  // 获取起始和结束单元格的行列索引
  const startRow = (start.parentElement as HTMLTableRowElement).rowIndex;
  const endRow = (end.parentElement as HTMLTableRowElement).rowIndex;
  const startCol = start.cellIndex;
  const endCol = end.cellIndex;

  // 计算矩形选区的边界
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  // 收集矩形区域内的所有单元格
  const cells: HTMLTableCellElement[] = [];
  for (let i = minRow; i <= maxRow; i++) {
    const row = table.rows[i];
    if (row) {
      for (let j = minCol; j <= maxCol; j++) {
        const cell = row.cells[j];
        if (cell) {
          cells.push(cell);
        }
      }
    }
  }

  return cells;
};
```

**算法复杂度**：
- 时间复杂度：O(m × n)，其中 m 是行数，n 是列数
- 空间复杂度：O(m × n)，存储选中的单元格

**优化**：
- 只遍历选区内的行和列，不遍历整个表格
- 使用 `rowIndex` 和 `cellIndex` 直接访问单元格，无需搜索

### 3. 事件监听

```typescript
useEffect(() => {
  const editor = editorRef.current;
  if (!editor) return;

  // 注册事件监听器
  editor.addEventListener('mousedown', handleMouseDown);
  editor.addEventListener('mousemove', handleMouseMove);
  editor.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('click', handleClickOutside);

  // 清理函数
  return () => {
    editor.removeEventListener('mousedown', handleMouseDown);
    editor.removeEventListener('mousemove', handleMouseMove);
    editor.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('click', handleClickOutside);
    clearAllHighlights(editor);
  };
}, [selectedCells]);
```

**注意事项**：
- `mousedown` 和 `mousemove` 监听编辑器元素
- `mouseup` 监听 document，确保在编辑器外释放鼠标也能停止选择
- `click` 监听 document，实现点击外部隐藏工具栏
- 依赖 `selectedCells`，确保事件处理器使用最新的状态

### 4. 高亮显示

```typescript
// 清除所有高亮
const clearAllHighlights = (container: HTMLElement) => {
  const highlightedCells = container.querySelectorAll('td.selected, th.selected');
  highlightedCells.forEach(cell => {
    cell.classList.remove('selected');
  });
};

// 高亮指定的单元格
const highlightCells = (cells: HTMLTableCellElement[]) => {
  clearAllHighlights(editor);
  cells.forEach(cell => {
    cell.classList.add('selected');
  });
};
```

**CSS样式**（在 EditorContent.tsx 中）：
```css
.editor-content table td.selected,
.editor-content table th.selected {
  background: rgba(67, 97, 238, 0.2) !important;
  outline: 2px solid #4361ee;
  outline-offset: -2px;
}
```

---

## 📊 性能优化

### 1. 事件处理优化

**问题**：频繁的 `mousemove` 事件可能导致性能问题。

**优化方案**：
- 只在 `isSelecting.current === true` 时处理 `mousemove`
- 使用 `closest` 方法快速查找单元格，避免遍历DOM树
- 使用 `rowIndex` 和 `cellIndex` 直接访问单元格

### 2. 状态更新优化

**问题**：频繁的状态更新可能导致不必要的重新渲染。

**优化方案**：
- 使用 `useRef` 存储 `isSelecting` 和 `startCell`，避免触发重新渲染
- 只在必要时更新 `selectedCells` 状态
- 使用 `useEffect` 的依赖数组，避免不必要的事件监听器重新注册

### 3. DOM操作优化

**问题**：频繁的DOM操作可能导致性能问题。

**优化方案**：
- 使用 `classList.add/remove` 而不是直接修改 `style`
- 批量处理单元格高亮，减少重绘次数
- 使用 `querySelectorAll` 一次性获取所有需要清除高亮的单元格

---

## 🎯 使用建议

### 1. 选择单元格的最佳实践

**单个单元格**：
- 直接点击单元格
- 不要拖动鼠标

**一行**：
- 从第一列拖动到最后一列
- 或者从最后一列拖动到第一列

**一列**：
- 从第一行拖动到最后一行
- 或者从最后一行拖动到第一行

**矩形区域**：
- 从左上角拖动到右下角
- 或者从右下角拖动到左上角
- 或者从任意对角拖动

### 2. 背景颜色的最佳实践

**颜色选择**：
- 使用浅色背景，保持文字可读性
- 避免使用过于鲜艳的颜色
- 建议使用：
  - 浅黄色 (#fffacd)：强调重要数据
  - 浅绿色 (#e0ffe0)：表示正常或通过
  - 浅红色 (#ffe0e0)：表示警告或错误
  - 浅蓝色 (#e0f0ff)：表示信息或提示

**颜色搭配**：
- 表头：蓝色（#4361ee）- 自动保持
- 数据行：白色或浅色背景
- 重要数据：使用对比色高亮

**示例表格**：
```
┌─────────┬─────────┬─────────┐
│ 姓名    │ 分数    │ 状态    │ ← 蓝色表头
├─────────┼─────────┼─────────┤
│ 张三    │ 95      │ 🟩 通过 │ ← 浅绿色（通过）
├─────────┼─────────┼─────────┤
│ 李四    │ 58      │ 🟥 不及格│ ← 浅红色（不及格）
├─────────┼─────────┼─────────┤
│ 王五    │ 88      │ 🟩 通过 │ ← 浅绿色（通过）
└─────────┴─────────┴─────────┘
```

### 3. 工具栏使用技巧

**快速操作**：
1. 选中单元格
2. 使用工具栏按钮快速操作
3. 点击外部取消选择

**批量操作**：
1. 选中多个单元格
2. 一次性更改颜色或清空内容
3. 提高编辑效率

**表格结构调整**：
1. 先选中相关单元格
2. 使用 + 行/列 添加
3. 使用 - 行/列 删除
4. 使用清空按钮清除内容

---

## 🐛 已知问题和解决方案

### 问题1：在某些浏览器中，颜色选择器样式可能不一致

**原因**：不同浏览器对 `<input type="color">` 的样式支持不同。

**解决方案**：使用了基本的CSS样式，在大多数现代浏览器中都能正常显示。

**建议**：使用 Chrome、Firefox、Safari、Edge 等现代浏览器。

### 问题2：快速拖动时可能会漏选某些单元格

**原因**：`mousemove` 事件的触发频率有限，快速移动时可能跳过某些单元格。

**解决方案**：使用矩形选区算法，确保起始和结束单元格之间的所有单元格都被选中。

### 问题3：在表格内双击会选中文字

**原因**：双击是浏览器的默认行为，无法完全阻止。

**解决方案**：单击选择单元格后，可以正常编辑文字。双击选中文字不影响单元格选择功能。

---

## 🚀 未来可能的改进

- [ ] 支持键盘快捷键选择（Shift + 方向键）
- [ ] 支持 Ctrl/Cmd + 点击多选不连续的单元格
- [ ] 支持复制/粘贴单元格格式（包括背景颜色）
- [ ] 支持撤销/重做背景颜色更改
- [ ] 支持预设颜色面板（快速选择常用颜色）
- [ ] 支持渐变背景色
- [ ] 支持单元格边框颜色自定义
- [ ] 支持文字颜色自定义
- [ ] 支持条件格式（根据内容自动设置颜色）
- [ ] 支持颜色主题（一键应用配色方案）

---

## 📚 相关文档

- [CHANGELOG.md](./CHANGELOG.md) - 完整的更新日志
- [TABLE_ENHANCEMENT_V3.12.0.md](./TABLE_ENHANCEMENT_V3.12.0.md) - v3.12.0 表格功能增强说明
- [TABLE_AND_TOC_IMPROVEMENTS.md](./TABLE_AND_TOC_IMPROVEMENTS.md) - 表格和目录功能说明

---

## ✨ 版本信息

- **版本号**：v3.13.0
- **发布日期**：2025-12-06
- **主要改进**：精确的单元格选择、背景颜色自定义、交互体验优化
- **状态**：✅ 已完成开发和测试

---

## 🎊 总结

v3.13.0 版本带来了表格选择和颜色功能的重大改进：

### 核心改进
1. **精确的矩形选区** - 选中两列不会误选两行，选择行为完全可预测
2. **背景颜色自定义** - 支持更改单元格背景颜色，让表格更加美观
3. **更好的交互体验** - 阻止文本选择，点击外部自动隐藏工具栏

### 技术亮点
- 完全重写了单元格选择逻辑
- 实现了自定义的矩形选区算法
- 优化了事件处理和性能
- 添加了背景颜色自定义功能

### 用户价值
- 更精确的单元格选择
- 更灵活的表格样式定制
- 更流畅的编辑体验
- 更专业的文档效果

这些改进让离线Word文档编辑器的表格功能更加强大和易用，满足了用户对精确选择和样式定制的需求。

感谢您使用离线Word文档编辑器！
