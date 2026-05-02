# 目录多层级折叠功能说明

## 功能概述

在悬浮目录中实现了多层级折叠功能，不仅H1标题可以折叠其子标题，H2标题也可以折叠其下的H3、H4等子标题。这使得复杂文档的目录结构更加清晰，用户可以根据需要灵活控制各层级的展开/折叠状态。

## 功能特性

### 1. 多层级折叠控制

- **H1标题控制**：可以折叠/展开其下的所有H2、H3、H4等子标题
- **H2标题控制**：可以折叠/展开其下的H3、H4、H5等子标题
- **独立状态**：每个可折叠标题的展开/折叠状态互不影响
- **级联隐藏**：当H1折叠时，其下的所有子标题（包括H2的子标题）都会隐藏
- **默认展开**：所有标题默认展开状态，方便查看完整结构

### 2. 智能识别

- **自动检测**：只有包含子标题的H1和H2才显示折叠图标
- **动态判断**：根据文档结构自动识别父子关系
- **避免干扰**：没有子标题的标题不显示折叠按钮

### 3. 视觉反馈

- **图标指示**：清晰的箭头图标（▼展开 / ▶折叠）
- **位置固定**：折叠图标固定在标题右侧
- **悬停效果**：图标悬停时显示背景高亮
- **颜色适配**：图标颜色根据目录样式自动调整

### 3. 交互设计

- **点击标题**：点击标题文本，跳转到对应位置
- **点击图标**：点击折叠图标，展开/折叠子目录
- **事件隔离**：折叠图标点击不会触发标题跳转
- **智能识别**：只有包含子标题的H1和H2才显示折叠图标

## 使用场景

### 适用情况

1. **复杂文档导航**
   - 文档包含多个章节（H1）和小节（H2）
   - 每个小节还有更细的子节（H3、H4）
   - 需要灵活控制不同层级的显示

2. **层次化内容**
   - 技术文档：章节 → 主题 → 子主题 → 细节
   - 教程：课程 → 章节 → 小节 → 知识点
   - 手册：部分 → 章节 → 条目 → 说明

3. **提升可读性**
   - 隐藏暂时不需要的章节和小节
   - 聚焦当前阅读的内容层级
   - 减少目录视觉干扰

### 使用方法

#### 在编辑器中

1. **查看目录**
   - 左侧自动显示悬浮目录
   - H1和H2标题右侧显示折叠图标（如有子标题）

2. **折叠H1的子目录**
   - 点击H1标题右侧的 ▼ 图标
   - 该H1下的所有子标题（H2、H3等）将被隐藏
   - 图标变为 ▶

3. **折叠H2的子目录**
   - 点击H2标题右侧的 ▼ 图标
   - 该H2下的所有子标题（H3、H4等）将被隐藏
   - 图标变为 ▶
   - 注意：H2本身仍然显示（除非其父H1被折叠）

4. **展开子目录**
   - 点击折叠的标题右侧的 ▶ 图标
   - 该标题下的直接子标题重新显示
   - 图标变为 ▼

5. **级联效果**
   - 当H1折叠时，其下的所有H2、H3等都会隐藏
   - 即使某个H2是展开状态，也会因为H1折叠而隐藏
   - 展开H1后，H2会恢复到之前的展开/折叠状态

6. **跳转到标题**
   - 点击任意标题文本（非图标区域）
   - 页面平滑滚动到对应位置

#### 在导出的HTML中

导出的HTML文件同样支持多层级目录折叠功能：

1. **打开目录**
   - 点击页面左侧的 ☰ 按钮
   - 悬浮目录从左侧滑出

2. **折叠/展开**
   - 操作方式与编辑器中完全相同
   - 点击H1或H2标题右侧的折叠图标
   - 支持多层级的独立控制

3. **关闭目录**
   - 点击目录右上角的 ✕ 按钮
   - 目录滑回左侧隐藏

### 使用示例

#### 示例1：章节式文档

```
▼ 第一章：基础知识          (H1 - 展开)
  ▼ 1.1 概述               (H2 - 展开)
    1.1.1 定义            (H3)
    1.1.2 历史            (H3)
  ▶ 1.2 原理               (H2 - 折叠)
    [H3内容已隐藏]
▶ 第二章：进阶内容          (H1 - 折叠)
  [所有H2、H3内容已隐藏]
```

#### 示例2：技术文档

```
▼ API参考                  (H1 - 展开)
  ▼ 用户管理API            (H2 - 展开)
    创建用户              (H3)
    更新用户              (H3)
    删除用户              (H3)
  ▼ 订单管理API            (H2 - 展开)
    ▶ 订单查询            (H3 - 折叠，如果H3下还有H4)
      [H4内容已隐藏]
    创建订单              (H3)
```

## 技术实现

### 编辑器组件（TableOfContents.tsx）

#### 状态管理

```typescript
// 记录每个可折叠标题（H1、H2）的展开/折叠状态
const [expandedHeadings, setExpandedHeadings] = useState<Record<string, boolean>>(() => {
  const initial: Record<string, boolean> = {};
  headings.forEach(h => {
    if (h.level === 1 || h.level === 2) {
      initial[h.id] = true; // 默认展开
    }
  });
  return initial;
});
```

#### 折叠控制

```typescript
// 切换标题的展开/折叠状态（支持H1和H2）
const toggleHeading = (headingId: string, e: React.MouseEvent) => {
  e.stopPropagation(); // 阻止事件冒泡
  setExpandedHeadings(prev => ({
    ...prev,
    [headingId]: !prev[headingId]
  }));
};
```

#### 显示逻辑（多层级支持）

```typescript
// 检查某个标题是否应该显示
const shouldShowHeading = (heading: HeadingItem, index: number): boolean => {
  if (heading.level === 1) return true; // H1始终显示
  
  // 找到这个标题的所有父标题，检查是否都是展开状态
  let currentLevel = heading.level;
  for (let i = index - 1; i >= 0; i--) {
    const parentHeading = headings[i];
    
    // 找到直接父标题
    if (parentHeading.level < currentLevel) {
      // 如果父标题是折叠状态，则当前标题不显示
      if (expandedHeadings[parentHeading.id] === false) {
        return false;
      }
      // 继续向上查找更高层级的父标题
      currentLevel = parentHeading.level;
      if (currentLevel === 1) break; // 已经到H1，不需要再向上查找
    }
  }
  return true;
};
```

#### 子标题检测

```typescript
// 检查标题是否有子标题（支持H1和H2）
const hasChildren = (headingIndex: number): boolean => {
  if (headingIndex >= headings.length - 1) return false;
  const currentHeading = headings[headingIndex];
  const nextHeading = headings[headingIndex + 1];
  return nextHeading && nextHeading.level > currentHeading.level;
};
```

### 导出HTML（Editor.tsx）

#### HTML结构

```html
<!-- H1标题（有子标题） -->
<li class="level-1" data-level="1" data-id="heading-0">
  <a href="#heading-0" onclick="scrollToHeading('heading-0')">
    第一章
    <span class="toggle-icon" onclick="toggleHeadingChildren(event, 'heading-0', 1)">▼</span>
  </a>
</li>

<!-- H2标题（有子标题） -->
<li class="level-2" data-level="2" data-id="heading-1">
  <a href="#heading-1" onclick="scrollToHeading('heading-1')">
    第一节
    <span class="toggle-icon" onclick="toggleHeadingChildren(event, 'heading-1', 2)">▼</span>
  </a>
</li>

<!-- H3标题（无子标题，无折叠图标） -->
<li class="level-3" data-level="3" data-id="heading-2">
  <a href="#heading-2" onclick="scrollToHeading('heading-2')">第一小节</a>
</li>
```

#### JavaScript控制（多层级支持）

```javascript
function toggleHeadingChildren(event, headingId, headingLevel) {
  event.preventDefault();
  event.stopPropagation();
  
  const allItems = document.querySelectorAll('.floating-toc li');
  const toggleIcon = event.target;
  let foundHeading = false;
  let isCollapsed = toggleIcon.textContent === '▶';
  
  // 遍历所有目录项
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const level = parseInt(item.getAttribute('data-level'));
    const itemId = item.getAttribute('data-id');
    
    // 找到对应的标题
    if (itemId === headingId) {
      foundHeading = true;
      continue;
    }
    
    // 如果已经找到标题，处理其子项
    if (foundHeading) {
      // 如果遇到同级或更高级的标题，停止
      if (level <= headingLevel) {
        break;
      }
      
      // 切换子项的显示状态
      if (isCollapsed) {
        item.classList.remove('collapsed');
      } else {
        item.classList.add('collapsed');
      }
    }
  }
  
  // 切换图标
  toggleIcon.textContent = isCollapsed ? '▼' : '▶';
  
  return false;
}
```

#### CSS样式（多层级支持）

```css
/* H1和H2的折叠图标样式 */
.floating-toc .level-1 a,
.floating-toc .level-2 a {
  position: relative;
  padding-right: 28px; /* 为折叠图标留出空间 */
}

.floating-toc .level-1 .toggle-icon,
.floating-toc .level-2 .toggle-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: background 0.2s;
  font-size: 10px;
}

/* H1的图标颜色（立体色块模式下为白色） */
.floating-toc .level-1 .toggle-icon {
  color: white; /* 或根据主题颜色 */
}

/* H2的图标颜色 */
.floating-toc .level-2 .toggle-icon {
  color: #4361ee; /* 或根据主题颜色 */
}

.floating-toc .level-1 .toggle-icon:hover,
.floating-toc .level-2 .toggle-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.floating-toc .collapsed {
  display: none; /* 隐藏折叠的子项 */
}
```

## 兼容性

### 浏览器支持

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 功能兼容

- ✅ 与目录样式（普通文本/立体色块）完全兼容
- ✅ 与目录颜色设置完全兼容
- ✅ 与导出HTML功能完全兼容
- ✅ 与移动端适配完全兼容

## 用户体验优化

### 1. 智能识别

- 只有包含子标题的H1才显示折叠图标
- 避免无意义的折叠按钮干扰

### 2. 默认展开

- 所有子目录默认展开
- 用户可以看到完整的文档结构
- 根据需要选择性折叠

### 3. 独立控制

- 每个H1的折叠状态独立
- 可以同时展开多个章节
- 也可以只展开当前关注的章节

### 4. 视觉反馈

- 清晰的图标指示状态
- 悬停时的高亮效果
- 平滑的显示/隐藏动画

### 5. 事件隔离

- 点击标题文本：跳转到对应位置
- 点击折叠图标：展开/折叠子目录
- 两种操作互不干扰

## 最佳实践

### 文档结构建议

1. **使用H1作为章节标题**
   - 每个主要章节使用H1
   - H1下使用H2作为小节
   - H2下使用H3、H4作为更细的子节

2. **保持层级清晰**
   - 推荐结构：H1 → H2 → H3 → H4
   - 避免跳级（如H1直接到H3）
   - 保持层级的逻辑性和一致性

3. **合理的章节数量**
   - 建议每个H1下包含2-8个H2
   - 建议每个H2下包含2-6个H3
   - 过多子标题可以考虑拆分章节

### 使用技巧

1. **长文档导航**
   - 折叠已阅读的章节（H1）
   - 展开当前阅读的章节
   - 在章节内折叠已读的小节（H2）
   - 快速定位到目标位置

2. **演示展示**
   - 折叠所有章节和小节
   - 逐个展开讲解内容
   - 保持听众注意力集中
   - 控制信息展示的节奏

3. **文档编辑**
   - 折叠无关章节和小节
   - 聚焦当前编辑的内容
   - 减少视觉干扰
   - 提高编辑效率

4. **多层级控制**
   - 使用H1折叠控制整个章节
   - 使用H2折叠控制章节内的小节
   - 灵活组合实现最佳导航体验

## 未来计划

### v1.1 计划

- [ ] 添加"全部展开/折叠"按钮
- [ ] 记住用户的折叠状态（localStorage）
- [ ] 支持键盘快捷键控制折叠
- [ ] 添加折叠层级深度设置（只折叠到H2或H3）

### v1.2 计划

- [ ] 支持H3标题的折叠（控制H4、H5等）
- [ ] 添加折叠动画效果
- [ ] 支持拖拽调整目录宽度
- [ ] 目录项右键菜单（展开所有子项、折叠所有子项）

### 长期计划

- [ ] 目录搜索功能（搜索时自动展开相关章节）
- [ ] 目录书签功能
- [ ] 目录导出为独立文件
- [ ] 目录视图切换（树形视图、列表视图）

## 版本信息

- **版本号**：v1.1
- **发布日期**：2025-12-06
- **功能类型**：交互增强（多层级支持）
- **向后兼容**：完全兼容v1.0版本
- **新增功能**：H2标题折叠支持
- **依赖组件**：TableOfContents、Editor

## 相关文档

- [离线Word文档编辑器需求文档](./README.md)
- [代码主题功能说明](./CODE_THEME_FEATURE.md)
- [代码块功能说明](./CODE_BLOCK_FEATURES.md)
