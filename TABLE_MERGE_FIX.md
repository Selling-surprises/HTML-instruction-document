# 表格合并单元格列宽修复文档

## 问题描述

**原始问题**：
- 一行有 3 个单元格，每列宽度相等（比如各 100px，总宽 300px）
- 合并第 1 行的第 1、2 个单元格（rowSpan=1, colSpan=2）
- **Bug 现象**：合并后的单元格宽度变成 150px（总宽 1/2），而不是 200px（100+100）
- **连锁反应**：第 2、3 行的第 1、2 列单元格宽度也变成各 75px（合并后宽度的一半），第 3 列变成 150px

## 根本原因

合并单元格时，代码没有正确处理列宽的累加逻辑：
1. **错误逻辑**：合并后直接使用平均宽度（总宽 / 列数）
2. **正确逻辑**：合并单元格的宽度 = 所跨逻辑列的宽度之和

## 修复方案

### 1. 表格初始化修复（Editor.tsx）

**修改位置**：`handleInsertTable` 函数

**修复内容**：
```typescript
// ✅ 使用 table-layout: fixed 确保列宽稳定
let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1em 0; table-layout: fixed;"><tbody>';

// ✅ 计算每列初始百分比宽度（平均分配）
const colWidth = (100 / cols).toFixed(2) + '%';

// ✅ 给每个单元格设置初始百分比宽度
tableHtml += `<td style="border: 1px solid #333; padding: 10px; width: ${colWidth}; overflow-wrap: break-word; word-break: break-all; vertical-align: top;">&nbsp;</td>`;
```

**关键点**：
- 使用 `table-layout: fixed` 固定表格布局算法
- 使用百分比宽度而非固定像素值
- 每个单元格明确设置初始宽度

### 2. 合并单元格修复（EnhancedTableToolbar.tsx）

**修改位置**：`handleMerge` 函数

**修复内容**：
```typescript
// ✅ 累加宽度属性（如果存在）
if (firstCell.style.width) {
  const widthMatch = firstCell.style.width.match(/^([\d.]+)(%|px)$/);
  if (widthMatch) {
    const value = parseFloat(widthMatch[1]);
    const unit = widthMatch[2];
    // 累加所跨逻辑列的宽度之和
    firstCell.style.width = (value * colSpan).toFixed(2) + unit;
    firstCell.style.maxWidth = (value * colSpan).toFixed(2) + unit;
  }
}

// ✅ 隐藏其他单元格并清除其宽度，以免干扰布局
selectedCells.slice(1).forEach(cell => {
  cell.style.display = 'none';
  cell.style.width = '0'; // 关键：被隐藏的单元格宽度清零
});
```

**关键点**：
- 合并单元格的宽度 = 单列宽度 × colSpan
- 被隐藏的单元格宽度设为 0，避免占用空间

### 3. 拆分单元格修复（EnhancedTableToolbar.tsx）

**修改位置**：`handleSplit` 函数

**修复内容**：
```typescript
const colSpan = cell.colSpan;
const rowSpan = cell.rowSpan;

// ✅ 记录原始列宽以便恢复
let originalUnitWidth = '';
if (cell.style.width) {
  const widthMatch = cell.style.width.match(/^([\d.]+)(%|px)$/);
  if (widthMatch) {
    const value = parseFloat(widthMatch[1]);
    const unit = widthMatch[2];
    // 恢复单列宽度 = 合并宽度 / colSpan
    originalUnitWidth = (value / colSpan).toFixed(2) + unit;
    cell.style.width = originalUnitWidth;
    cell.style.maxWidth = originalUnitWidth;
  }
}

// ✅ 显示被隐藏的单元格并恢复其属性
hiddenCells.forEach(cellElement => {
  cellElement.style.display = '';
  cellElement.style.height = 'auto';
  if (originalUnitWidth) {
    cellElement.style.width = originalUnitWidth;
    cellElement.style.maxWidth = originalUnitWidth;
  }
});
```

**关键点**：
- 拆分时恢复单列宽度 = 合并宽度 / colSpan
- 所有被隐藏的单元格恢复相同的单列宽度

### 4. 插入行修复（EnhancedTableToolbar.tsx）

**修改位置**：`handleInsertRow` 函数

**修复内容**：
```typescript
// ✅ 计算表格的总逻辑列数（累加第一行各单元格的 colSpan）
const firstRow = currentTable.querySelector('tr');
if (!firstRow) return;
const totalCols = Array.from(firstRow.children).reduce((acc, cell) => 
  acc + ((cell as HTMLTableCellElement).colSpan || 1), 0);
const cellWidth = (100 / totalCols).toFixed(2) + '%';

// ✅ 新行的每个单元格使用相同的单列宽度
for (let i = 0; i < totalCols; i++) {
  const newCell = document.createElement('td');
  newCell.style.width = cellWidth;
  newCell.style.maxWidth = cellWidth;
  // ...
}
```

**关键点**：
- 计算总逻辑列数（考虑 colSpan）
- 新行的每个单元格使用单列宽度

### 5. 插入列修复（EnhancedTableToolbar.tsx）

**修改位置**：`handleInsertColumn` 函数

**修复内容**：
```typescript
rows.forEach(row => {
  const cells = Array.from(row.children);
  
  // ✅ 重新计算并设置新行宽比例
  const newCellCount = cells.length + 1;
  const newWidth = (100 / newCellCount).toFixed(2) + '%';
  
  // ✅ 设置新列中各单元格的基础样式
  newCell.style.width = newWidth;
  newCell.style.maxWidth = newWidth;
  
  // ✅ 更新同行的所有单元格宽度
  cells.forEach(c => {
    const ce = c as HTMLElement;
    ce.style.width = newWidth;
    ce.style.maxWidth = newWidth;
  });
  
  // 插入新单元格
  // ...
});
```

**关键点**：
- 插入列后重新计算所有列的宽度
- 更新同行所有单元格的宽度，保持一致

## 验证测试

### 测试场景 1：3×3 表格合并前两列

**初始状态**：
```
┌─────────┬─────────┬─────────┐
│  A列    │  B列    │  C列    │
│ 33.33%  │ 33.33%  │ 33.33%  │
├─────────┼─────────┼─────────┤
│  单元格 │  单元格 │  单元格 │
├─────────┼─────────┼─────────┤
│  单元格 │  单元格 │  单元格 │
└─────────┴─────────┴─────────┘
```

**合并第 1 行前两列后**：
```
┌───────────────────┬─────────┐
│   合并单元格       │  C列    │
│   66.66%          │ 33.33%  │  ✅ 正确：66.66% = 33.33% × 2
├─────────┬─────────┼─────────┤
│  单元格 │  单元格 │  单元格 │
│ 33.33%  │ 33.33%  │ 33.33%  │  ✅ 正确：保持原始宽度
├─────────┼─────────┼─────────┤
│  单元格 │  单元格 │  单元格 │
│ 33.33%  │ 33.33%  │ 33.33%  │  ✅ 正确：保持原始宽度
└─────────┴─────────┴─────────┘
```

### 测试场景 2：拆分合并单元格

**拆分后**：
```
┌─────────┬─────────┬─────────┐
│  A列    │  B列    │  C列    │
│ 33.33%  │ 33.33%  │ 33.33%  │  ✅ 正确：恢复原始宽度
├─────────┼─────────┼─────────┤
│  单元格 │  单元格 │  单元格 │
├─────────┼─────────┼─────────┤
│  单元格 │  单元格 │  单元格 │
└─────────┴─────────┴─────────┘
```

## 核心原则

### 逻辑列宽管理原则

1. **colWidths 数组代表"逻辑列"的宽度，不因合并而改变**
2. **合并单元格的渲染宽度 = 所跨逻辑列的宽度之和**
3. **被合并的单元格（display: none）宽度设为 0，不占用空间**

### 对比图

```
❌ 错误理解（修复前的逻辑）：
合并后 → 单元格宽度变成平均值（总宽 / 2）
渲染时 → 合并单元格宽度 = 150px（错误！）

✅ 正确理解（修复后的逻辑）：
合并后 → 单元格宽度 = 单列宽度 × colSpan
渲染时 → 合并单元格宽度 = 33.33% × 2 = 66.66%（正确！）
```

## 技术要点

### 1. 使用 table-layout: fixed

```css
table {
  table-layout: fixed;
  width: 100%;
}
```

**优点**：
- 列宽由第一行单元格决定，后续行遵循相同宽度
- 避免浏览器自动调整列宽导致的布局混乱

### 2. 使用百分比宽度

```typescript
const colWidth = (100 / cols).toFixed(2) + '%';
```

**优点**：
- 响应式布局，适应不同屏幕宽度
- 避免固定像素值导致的溢出问题

### 3. 宽度累加算法

```typescript
// 合并时累加
firstCell.style.width = (value * colSpan).toFixed(2) + unit;

// 拆分时平均分配
originalUnitWidth = (value / colSpan).toFixed(2) + unit;
```

**关键**：
- 合并：宽度 × colSpan
- 拆分：宽度 / colSpan

## 修复效果

### 修复前

- ❌ 合并单元格宽度错误（平均分配）
- ❌ 下方行的单元格宽度被影响
- ❌ 表格布局混乱

### 修复后

- ✅ 合并单元格宽度正确（累加逻辑列宽）
- ✅ 下方行的单元格宽度保持不变
- ✅ 表格布局稳定

## 相关文件

- `/src/pages/Editor.tsx` - 表格插入逻辑
- `/src/components/editor/EnhancedTableToolbar.tsx` - 表格操作逻辑（合并、拆分、插入行列）

## 版本信息

- **修复版本**：v3.8 增强版
- **修复日期**：2026-03-03
- **修复内容**：表格合并单元格列宽计算逻辑
