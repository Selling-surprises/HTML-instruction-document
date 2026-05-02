# 右键菜单系统 - 快速集成指南

## 一、5分钟快速集成

### 步骤 1: 导入必要的组件和 Hook

```tsx
import { useRef } from 'react';
import { useContextMenu } from '@/hooks/useContextMenu';
import { ContextMenu } from '@/components/editor/ContextMenu';
import { ParagraphDialog } from '@/components/editor/ParagraphDialog';
import { TablePropertiesDialog } from '@/components/editor/TablePropertiesDialog';
```

### 步骤 2: 在编辑器组件中使用

```tsx
function YourEditor() {
  // 1. 创建编辑器引用
  const editorRef = useRef<HTMLDivElement>(null);
  
  // 2. 使用右键菜单 Hook
  const {
    menuState,
    closeMenu,
    executeCommand,
    paragraphDialogOpen,
    setParagraphDialogOpen,
    applyParagraphSettings,
    tablePropertiesDialogOpen,
    setTablePropertiesDialogOpen,
    applyTableSettings
  } = useContextMenu({
    editorRef,
    onCommand: (command, item, context) => {
      // 可选：处理自定义命令
      console.log('命令:', command, '上下文:', context);
    }
  });

  return (
    <div>
      {/* 3. 编辑器内容区域 */}
      <div
        ref={editorRef}
        contentEditable
        className="editor-content p-8 min-h-[500px] border rounded-lg"
      >
        <p>在这里右键点击试试！</p>
      </div>

      {/* 4. 右键菜单 */}
      {menuState.visible && (
        <ContextMenu
          items={menuState.items}
          position={menuState.position}
          onClose={closeMenu}
          onCommand={executeCommand}
        />
      )}

      {/* 5. 段落对话框 */}
      <ParagraphDialog
        open={paragraphDialogOpen}
        onClose={() => setParagraphDialogOpen(false)}
        onApply={applyParagraphSettings}
      />

      {/* 6. 表格属性对话框 */}
      <TablePropertiesDialog
        open={tablePropertiesDialogOpen}
        onClose={() => setTablePropertiesDialogOpen(false)}
        onApply={applyTableSettings}
      />
    </div>
  );
}
```

### 步骤 3: 完成！

现在你的编辑器已经支持完整的右键菜单功能了！

---

## 二、功能演示

### 测试段落菜单

1. 在编辑器中输入一些文字
2. 右键点击文字
3. 选择"段落(P)..."打开段落对话框
4. 调整缩进、间距、对齐等设置
5. 点击"确定"应用设置

### 测试表格菜单

1. 在编辑器中插入一个表格：
```html
<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <td style="border: 1px solid #333; padding: 8px;">单元格 1</td>
    <td style="border: 1px solid #333; padding: 8px;">单元格 2</td>
  </tr>
  <tr>
    <td style="border: 1px solid #333; padding: 8px;">单元格 3</td>
    <td style="border: 1px solid #333; padding: 8px;">单元格 4</td>
  </tr>
</table>
```

2. 右键点击表格单元格
3. 尝试以下操作：
   - 插入行/列
   - 删除行/列
   - 选择多个单元格后合并
   - 打开表格属性对话框

### 测试图片菜单

1. 在编辑器中插入图片：
```html
<img src="https://via.placeholder.com/300x200" alt="测试图片" />
```

2. 右键点击图片
3. 尝试以下操作：
   - 环绕文字（选择不同的环绕方式）
   - 旋转图片（±90°）
   - 翻转图片（水平/垂直）
   - 对齐图片（左/中/右）

---

## 三、常用命令速查表

### 基本编辑命令

| 命令 | 快捷键 | 说明 |
|------|--------|------|
| cut | Ctrl+X | 剪切 |
| copy | Ctrl+C | 复制 |
| paste | Ctrl+V | 粘贴 |
| selectAll | Ctrl+A | 全选 |
| delete | Delete | 删除 |

### 段落命令

| 命令 | 说明 |
|------|------|
| paragraphDialog | 打开段落对话框 |
| fontDialog | 打开字体对话框 |
| bullet | 应用项目符号 |
| numbering | 应用编号 |

### 表格命令

| 命令 | 说明 |
|------|------|
| insertRow | 插入行 |
| insertCol | 插入列 |
| deleteRow | 删除行 |
| deleteCol | 删除列 |
| deleteTable | 删除表格 |
| mergeCells | 合并单元格 |
| splitCell | 拆分单元格 |
| cellAlign | 单元格对齐 |
| tableProperties | 表格属性 |

### 图片命令

| 命令 | 说明 |
|------|------|
| wrapText | 环绕文字 |
| rotate | 旋转图片 |
| flip | 翻转图片 |
| alignImage | 对齐图片 |
| imageSizeDialog | 大小和位置 |

---

## 四、自定义配置

### 修改菜单样式

编辑 `src/components/editor/ContextMenu.tsx`：

```tsx
// 修改菜单容器样式
<div
  className="fixed bg-card border border-border shadow-xl rounded-md py-1 min-w-[180px]"
  style={{
    // 自定义样式
    fontFamily: "'Your Font', sans-serif",
    fontSize: '14px'
  }}
>
```

### 添加自定义菜单项

创建自定义菜单构建器：

```tsx
// src/utils/customMenuBuilder.ts
import { ContextMenuBuilder } from '@/utils/contextMenuBuilder';
import { ContextMenuItem, ContextInfo } from '@/types/contextMenu';

export class CustomMenuBuilder extends ContextMenuBuilder {
  static buildMenu(context: ContextInfo): ContextMenuItem[] {
    const menu = super.buildMenu(context);
    
    // 在段落菜单中添加自定义项
    if (context.type === 'paragraph') {
      menu.push({
        label: '我的自定义功能',
        command: 'myCustomCommand',
        icon: '⚡',
        divider: true
      });
    }
    
    return menu;
  }
}
```

然后在 Hook 中使用：

```tsx
import { CustomMenuBuilder } from '@/utils/customMenuBuilder';

// 在 useContextMenu 中
const items = CustomMenuBuilder.buildMenu(context);
```

### 处理自定义命令

```tsx
const contextMenu = useContextMenu({
  editorRef,
  onCommand: (command, item, context) => {
    if (command === 'myCustomCommand') {
      alert('执行自定义命令！');
      // 你的自定义逻辑
    }
  }
});
```

---

## 五、故障排除

### 问题 1: 右键菜单不显示

**解决方案**：
```tsx
// 确保编辑器元素有正确的 ref
<div ref={editorRef} contentEditable>
  {/* 内容 */}
</div>

// 检查 Hook 是否正确初始化
const contextMenu = useContextMenu({ editorRef });
```

### 问题 2: 菜单位置错误

**解决方案**：
```tsx
// 确保菜单容器没有被遮挡
// 检查 z-index 是否足够高（默认 10000）

// 如果父容器有 transform，可能影响 fixed 定位
// 移除父容器的 transform 或使用 absolute 定位
```

### 问题 3: 表格操作不生效

**解决方案**：
```tsx
// 确保表格结构正确
<table>
  <tbody>
    <tr>
      <td>内容</td>
    </tr>
  </tbody>
</table>

// 确保单元格可以被选中
// 添加 .selected 类来标记选中的单元格
```

### 问题 4: 对话框不显示

**解决方案**：
```tsx
// 确保对话框组件已导入
import { ParagraphDialog } from '@/components/editor/ParagraphDialog';

// 确保状态正确管理
const [open, setOpen] = useState(false);

// 确保对话框在 DOM 中渲染
<ParagraphDialog
  open={open}
  onClose={() => setOpen(false)}
  onApply={handleApply}
/>
```

---

## 六、完整示例代码

```tsx
import { useRef } from 'react';
import { useContextMenu } from '@/hooks/useContextMenu';
import { ContextMenu } from '@/components/editor/ContextMenu';
import { ParagraphDialog } from '@/components/editor/ParagraphDialog';
import { TablePropertiesDialog } from '@/components/editor/TablePropertiesDialog';

export function MyEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  
  const {
    menuState,
    closeMenu,
    executeCommand,
    paragraphDialogOpen,
    setParagraphDialogOpen,
    applyParagraphSettings,
    tablePropertiesDialogOpen,
    setTablePropertiesDialogOpen,
    applyTableSettings
  } = useContextMenu({
    editorRef,
    onCommand: (command, item, context) => {
      console.log('执行命令:', command);
      
      // 处理自定义命令
      switch (command) {
        case 'insertSymbol':
          // 打开符号选择器
          break;
        case 'hyperlink':
          // 打开超链接对话框
          break;
        default:
          console.log('未处理的命令:', command);
      }
    }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">我的编辑器</h1>
      
      {/* 编辑器 */}
      <div
        ref={editorRef}
        contentEditable
        className="
          min-h-[600px] 
          p-8 
          bg-white 
          border 
          border-gray-300 
          rounded-lg 
          shadow-md
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
        style={{
          fontSize: '16px',
          lineHeight: '1.8',
          fontFamily: "'Microsoft YaHei', sans-serif"
        }}
      >
        <h2>欢迎使用编辑器</h2>
        <p>在这里右键点击试试！</p>
        
        <h3>功能列表：</h3>
        <ul>
          <li>段落格式化</li>
          <li>表格操作</li>
          <li>图片编辑</li>
          <li>列表格式</li>
        </ul>
        
        <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px' }}>单元格 1</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>单元格 2</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px' }}>单元格 3</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>单元格 4</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 右键菜单 */}
      {menuState.visible && (
        <ContextMenu
          items={menuState.items}
          position={menuState.position}
          onClose={closeMenu}
          onCommand={executeCommand}
        />
      )}

      {/* 段落对话框 */}
      <ParagraphDialog
        open={paragraphDialogOpen}
        onClose={() => setParagraphDialogOpen(false)}
        onApply={applyParagraphSettings}
      />

      {/* 表格属性对话框 */}
      <TablePropertiesDialog
        open={tablePropertiesDialogOpen}
        onClose={() => setTablePropertiesDialogOpen(false)}
        onApply={applyTableSettings}
      />
    </div>
  );
}
```

---

## 七、下一步

### 学习更多

- 阅读完整文档：`CONTEXT_MENU_GUIDE.md`
- 查看类型定义：`src/types/contextMenu.ts`
- 研究源代码：`src/hooks/useContextMenu.ts`

### 扩展功能

- 添加更多对话框（字体、超链接等）
- 自定义菜单项和命令
- 集成到你的应用中

### 获取帮助

- 查看常见问题章节
- 检查浏览器控制台错误
- 参考示例代码

---

**开始使用吧！** 🚀
