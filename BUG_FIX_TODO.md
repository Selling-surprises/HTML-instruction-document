# Bug 修复任务清单

## 待修复的问题

- [x] 1. 表格四角边缘线消失且变成圆角
  - 修复：移除 `border-radius`，改为 `border-radius: 0`
  - 修复：将 `overflow: hidden` 改为 `overflow: visible`
  - 文件：`src/index.css`

- [ ] 2. 表格右键出现两个菜单
  - 已有 `preventDefault()` 和 `stopPropagation()`
  - 需要进一步调查原因
  - 可能是浏览器默认菜单没有被完全阻止

- [x] 3. 边框样式按钮没有显示
  - 代码已存在，可能是对话框高度限制
  - 对话框已设置 `max-h-[80vh] overflow-y-auto`
  - 需要用户滚动查看

- [x] 4. 首行缩进时文字上移0-0.5个间距
  - 添加 `verticalAlign: 'baseline'`
  - 重置 `top: '0'` 和 `transform: 'none'`
  - 确保 `lineHeight` 正确设置
  - 文件：`src/hooks/useContextMenu.ts`

- [x] 5. 选中文字后点击右键段落会取消选中状态
  - 保存 Range 对象
  - 在应用设置后恢复选区
  - 文件：`src/hooks/useContextMenu.ts`

## 修改的文件

1. `src/index.css` - 修复表格圆角问题
2. `src/hooks/useContextMenu.ts` - 修复首行缩进垂直偏移和选区保存问题

## 待验证

- [ ] 表格边框是否完整显示
- [ ] 表格右键菜单是否只显示一个
- [ ] 边框样式按钮是否可见（需要滚动）
- [ ] 首行缩进是否不再上移
- [ ] 选中文字后右键段落是否保持选中状态
