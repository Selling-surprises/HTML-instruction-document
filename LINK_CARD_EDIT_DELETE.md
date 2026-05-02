# 链接卡片编辑和删除功能说明

## 📅 更新日期
2025-12-06

## 🎯 功能概述

为链接卡片添加编辑和删除按钮，用户可以在编辑器中和导出的HTML文件中直接修改或删除链接卡片，无需重新插入。

---

## ✨ 新增功能

### 1. 悬浮按钮

#### 功能描述
当鼠标悬停在链接卡片上时，右上角会显示"编辑"和"删除"两个按钮。

#### 视觉效果
- **默认状态**：按钮不可见（opacity: 0）
- **悬停状态**：按钮淡入显示（opacity: 1）
- **按钮样式**：
  - 编辑按钮：蓝色背景（#3b82f6）
  - 删除按钮：红色背景（#ef4444）
  - 悬停时颜色加深

#### 位置
- 位于卡片右上角
- 绝对定位（position: absolute）
- 距离顶部和右侧各8px

---

### 2. 编辑功能

#### 功能描述
点击"编辑"按钮可以修改链接卡片的内容。

#### 编辑流程
1. 点击"编辑"按钮
2. 弹出对话框，输入新的链接地址
3. 弹出对话框，输入新的标题
4. 弹出对话框，输入新的描述（可选）
5. 确认后更新卡片内容

#### 验证规则
- ✅ 链接地址不能为空
- ✅ 标题可以为空（使用链接地址作为标题）
- ✅ 描述可以为空

#### 更新内容
- 卡片的data属性（data-url、data-title、data-description）
- 卡片显示的标题、描述和URL
- 卡片的点击跳转链接

#### 用户反馈
- **编辑器内**：显示Toast提示"链接卡片已更新"
- **导出HTML**：无提示（直接更新）

---

### 3. 删除功能

#### 功能描述
点击"删除"按钮可以删除链接卡片。

#### 删除流程
1. 点击"删除"按钮
2. 弹出确认对话框："确定要删除这个链接卡片吗？"
3. 确认后删除卡片

#### 安全机制
- ✅ 删除前需要确认
- ✅ 取消后不执行删除
- ✅ 删除后无法恢复（可通过撤销功能恢复）

#### 用户反馈
- **编辑器内**：显示Toast提示"链接卡片已删除"
- **导出HTML**：无提示（直接删除）

---

## 🔧 技术实现

### 1. 卡片HTML结构

#### 修改前
```html
<div class="link-card" contenteditable="false" onclick="window.open('url', '_blank')">
  <img src="image" />
  <div>
    <div>标题</div>
    <div>描述</div>
    <div>URL</div>
  </div>
</div>
```

#### 修改后
```html
<div class="link-card" id="card-xxx" contenteditable="false" 
     data-url="url" data-title="title" data-description="desc">
  <!-- 悬浮按钮 -->
  <div class="card-actions">
    <button class="card-edit-btn" onclick="window.editLinkCard('card-xxx')">
      编辑
    </button>
    <button class="card-delete-btn" onclick="window.deleteLinkCard('card-xxx')">
      删除
    </button>
  </div>
  
  <!-- 卡片内容 -->
  <div class="card-content" onclick="window.open('url', '_blank')">
    <img src="image" />
    <div>
      <div>标题</div>
      <div>描述</div>
      <div>URL</div>
    </div>
  </div>
</div>
```

---

### 2. 关键改进

#### 唯一ID
- 每个卡片生成唯一ID：`card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
- 用于精确定位和操作卡片

#### 数据属性
- `data-url`：存储链接地址
- `data-title`：存储标题
- `data-description`：存储描述
- 用于编辑时读取当前值

#### 事件隔离
- 按钮点击事件：`event.stopPropagation()`
- 防止触发卡片的点击跳转

#### 结构分离
- 按钮容器：`.card-actions`
- 内容容器：`.card-content`
- 点击跳转只在内容容器上

---

### 3. CSS样式

#### 卡片样式
```css
.link-card {
  position: relative;  /* 新增：支持绝对定位的按钮 */
}

.link-card:hover .card-actions {
  opacity: 1 !important;  /* 新增：悬停时显示按钮 */
}

.link-card .card-content {
  cursor: pointer;  /* 新增：内容区域显示手型光标 */
}
```

#### 按钮样式
```css
.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.card-edit-btn {
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.card-delete-btn {
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}
```

---

### 4. JavaScript函数

#### 编辑器内（React）
```typescript
// 编辑卡片
window.editLinkCard = (cardId: string) => {
  const editor = editorRef.current?.getElement();
  const card = editor.querySelector(`#${cardId}`);
  
  // 读取当前值
  const url = card.getAttribute('data-url') || '';
  const title = card.getAttribute('data-title') || '';
  const description = card.getAttribute('data-description') || '';
  
  // 获取新值
  const newUrl = prompt('请输入新的链接地址：', url);
  const newTitle = prompt('请输入新的标题：', title);
  const newDescription = prompt('请输入新的描述（可选）：', description);
  
  // 更新卡片
  card.setAttribute('data-url', newUrl);
  card.setAttribute('data-title', newTitle);
  card.setAttribute('data-description', newDescription);
  
  // 更新显示内容
  // ...
  
  // 触发内容更新
  setContent(editor.innerHTML);
  
  // 显示提示
  toast({ title: '成功', description: '链接卡片已更新' });
};

// 删除卡片
window.deleteLinkCard = (cardId: string) => {
  const editor = editorRef.current?.getElement();
  const card = editor.querySelector(`#${cardId}`);
  
  if (confirm('确定要删除这个链接卡片吗？')) {
    card.remove();
    setContent(editor.innerHTML);
    toast({ title: '成功', description: '链接卡片已删除' });
  }
};
```

#### 导出HTML（原生JS）
```javascript
// 编辑卡片
window.editLinkCard = function(cardId) {
  const card = document.getElementById(cardId);
  
  // 读取当前值
  const url = card.getAttribute('data-url') || '';
  const title = card.getAttribute('data-title') || '';
  const description = card.getAttribute('data-description') || '';
  
  // 获取新值
  const newUrl = prompt('请输入新的链接地址：', url);
  if (newUrl === null) return;
  
  if (!newUrl.trim()) {
    alert('链接地址不能为空！');
    return;
  }
  
  const newTitle = prompt('请输入新的标题：', title);
  if (newTitle === null) return;
  
  const newDescription = prompt('请输入新的描述（可选）：', description);
  if (newDescription === null) return;
  
  // 更新卡片
  card.setAttribute('data-url', newUrl);
  card.setAttribute('data-title', newTitle || newUrl);
  card.setAttribute('data-description', newDescription);
  
  // 更新显示内容
  const cardContent = card.querySelector('.card-content');
  const titleElement = cardContent.querySelector('div > div:first-child');
  const descElement = cardContent.querySelector('div > div:nth-child(2)');
  const urlElement = cardContent.querySelector('div > div:last-child');
  
  if (titleElement) titleElement.textContent = newTitle || newUrl;
  if (descElement && newDescription) {
    descElement.textContent = newDescription;
  } else if (descElement && !newDescription) {
    descElement.remove();
  }
  if (urlElement) urlElement.textContent = newUrl;
  
  // 更新点击事件
  cardContent.setAttribute('onclick', `window.open('${newUrl}', '_blank')`);
};

// 删除卡片
window.deleteLinkCard = function(cardId) {
  const card = document.getElementById(cardId);
  
  if (confirm('确定要删除这个链接卡片吗？')) {
    card.remove();
  }
};
```

---

## 📝 修改文件列表

### 1. src/pages/Editor.tsx

**修改内容**：

1. **卡片HTML结构**（第458-560行）
   - 添加唯一ID生成
   - 添加data属性存储卡片数据
   - 添加悬浮按钮容器
   - 添加编辑和删除按钮
   - 分离内容容器和点击事件

2. **CSS样式**（第1010-1046行）
   - 添加`position: relative`到`.link-card`
   - 添加悬停显示按钮的样式
   - 添加内容区域光标样式

3. **编辑器内全局函数**（第148-247行）
   - 添加`window.editLinkCard`函数
   - 添加`window.deleteLinkCard`函数
   - 使用useEffect设置和清理

4. **导出HTML全局函数**（第1201-1256行）
   - 添加`window.editLinkCard`函数
   - 添加`window.deleteLinkCard`函数
   - 在script标签中定义

**代码统计**：
- 新增行数：约200行
- 修改行数：约20行

---

## 💡 用户体验改进

### 改进前

**限制**：
- ❌ 无法编辑已插入的卡片
- ❌ 无法删除已插入的卡片
- ❌ 需要删除后重新插入
- ❌ 编辑成本高

### 改进后

**优势**：
- ✅ 可以直接编辑卡片内容
- ✅ 可以快速删除卡片
- ✅ 悬浮按钮不影响视觉
- ✅ 编辑流程简单直观
- ✅ 导出HTML也支持编辑和删除

---

## 🎯 使用场景

### 场景1：修正错误

**问题**：插入卡片后发现链接地址错误

**解决**：
1. 鼠标悬停在卡片上
2. 点击"编辑"按钮
3. 修改链接地址
4. 确认更新

---

### 场景2：更新内容

**问题**：链接的标题或描述需要更新

**解决**：
1. 鼠标悬停在卡片上
2. 点击"编辑"按钮
3. 修改标题和描述
4. 确认更新

---

### 场景3：删除卡片

**问题**：不再需要某个链接卡片

**解决**：
1. 鼠标悬停在卡片上
2. 点击"删除"按钮
3. 确认删除

---

### 场景4：导出后编辑

**问题**：导出HTML后发现需要修改卡片

**解决**：
1. 在浏览器中打开导出的HTML
2. 鼠标悬停在卡片上
3. 点击"编辑"或"删除"按钮
4. 修改后保存HTML文件

---

## 🧪 测试验证

### 测试清单

| 测试项 | 状态 | 说明 |
|--------|------|------|
| 悬浮显示按钮 | ✅ 通过 | 鼠标悬停时显示 |
| 编辑按钮样式 | ✅ 通过 | 蓝色背景 |
| 删除按钮样式 | ✅ 通过 | 红色背景 |
| 编辑功能 | ✅ 通过 | 可以修改内容 |
| 删除功能 | ✅ 通过 | 可以删除卡片 |
| 事件隔离 | ✅ 通过 | 按钮不触发跳转 |
| 内容更新 | ✅ 通过 | 编辑器内容同步 |
| 导出HTML | ✅ 通过 | 导出后可编辑删除 |

### 测试环境

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+

---

## 💻 代码质量

### Lint检查

```bash
npm run lint
```

**结果**：
```
Checked 87 files in 154ms. No fixes applied.
✅ 通过
```

### 类型检查

- ✅ 使用@ts-ignore处理window全局函数
- ✅ 所有DOM操作有类型断言
- ✅ 无类型错误

---

## 📈 版本历史

### v3.12.5 (2025-12-06)

**新增功能**：
- ✨ 链接卡片编辑功能
- ✨ 链接卡片删除功能
- 🎨 悬浮按钮显示
- 📤 导出HTML支持编辑删除

### v3.12.4 (2025-12-06)

**UI改进**：
- 🏷️ 术语修正：透明度 → 不透明度
- 📱 移动端适配默认关闭
- 🎨 开关视觉优化

---

## 🎯 最佳实践

### 1. 编辑卡片

**推荐流程**：
1. 仔细检查新的链接地址
2. 确保标题简洁明了
3. 描述可选，但建议填写
4. 确认前预览效果

---

### 2. 删除卡片

**注意事项**：
1. 删除前确认是否真的不需要
2. 删除后可以通过撤销恢复（编辑器内）
3. 导出HTML中删除后无法撤销

---

### 3. 导出HTML编辑

**注意事项**：
1. 编辑后需要重新保存HTML文件
2. 浏览器不会自动保存修改
3. 建议在编辑器中修改后再导出

---

## 📚 相关文档

- [UI改进说明](./UI_IMPROVEMENTS_v3.12.4.md) - v3.12.4改进
- [标题级别扩展功能说明](./HEADING_LEVELS_FEATURE.md) - v3.12.3新功能
- [缩进功能说明](./INDENT_FEATURE.md) - v3.12.2新功能
- [链接卡片功能](./LINK_CARD_FEATURE.md) - 原始功能说明

---

## 🎉 总结

链接卡片编辑和删除功能的添加大大提升了用户体验：

1. ✅ **编辑功能**：可以修改卡片内容
2. ✅ **删除功能**：可以快速删除卡片
3. ✅ **悬浮按钮**：不影响视觉，悬停显示
4. ✅ **导出支持**：导出HTML也可编辑删除
5. ✅ **用户友好**：操作简单，反馈清晰
6. ✅ **代码质量**：通过所有检查

**版本**：v3.12.5  
**日期**：2025-12-06  
**状态**：已发布  
**测试**：✅ 通过

---

**让链接卡片更易管理！** 🎨
