# 标题级别扩展功能说明

## 📅 更新日期
2025-12-06

## 🎯 功能概述

将编辑器的标题级别从H1-H3扩展到H1-H6，提供更丰富的文档层次结构，满足复杂文档的编辑需求。

---

## ✨ 功能特性

### 1. 标题级别扩展

**原有功能**：
- H1（标题 1）
- H2（标题 2）
- H3（标题 3）

**新增功能**：
- H4（标题 4）
- H5（标题 5）
- H6（标题 6）

**总计**：6个标题级别 + 1个正文级别

---

## 🎨 标题样式

### 桌面端样式

| 标题级别 | 字体大小 | 颜色 | 字重 | 上边距 | 下边距 |
|---------|---------|------|------|--------|--------|
| H1 | 2em (32px) | #4361ee | bold | 0.67em | 0.67em |
| H2 | 1.5em (24px) | #4361ee | bold | 0.83em | 0.83em |
| H3 | 1.17em (18.72px) | #4361ee | bold | 1em | 1em |
| H4 | 1em (16px) | #4361ee | bold | 1.33em | 1.33em |
| H5 | 0.83em (13.28px) | #4361ee | bold | 1.67em | 1.67em |
| H6 | 0.67em (10.72px) | #4361ee | bold | 2.33em | 2.33em |

### 移动端样式（导出HTML）

| 标题级别 | 字体大小 |
|---------|---------|
| H1 | 1.5em (24px) |
| H2 | 1.25em (20px) |
| H3 | 1.1em (17.6px) |
| H4 | 1em (16px) |
| H5 | 0.9em (14.4px) |
| H6 | 0.85em (13.6px) |

---

## 🎯 使用场景

### 场景1：技术文档

**文档结构**：
```
H1: 系统架构设计
  H2: 前端架构
    H3: 组件设计
      H4: 基础组件
        H5: 按钮组件
          H6: 按钮样式变体
```

**适用于**：
- 技术文档
- API文档
- 开发指南
- 系统设计文档

---

### 场景2：学术论文

**文档结构**：
```
H1: 论文标题
  H2: 摘要
  H2: 引言
  H2: 研究方法
    H3: 实验设计
      H4: 实验材料
        H5: 实验设备
          H6: 设备参数
```

**适用于**：
- 学术论文
- 研究报告
- 毕业论文
- 科研文档

---

### 场景3：产品手册

**文档结构**：
```
H1: 产品使用手册
  H2: 快速入门
    H3: 安装步骤
      H4: Windows安装
        H5: 系统要求
          H6: 硬件要求
```

**适用于**：
- 产品手册
- 用户指南
- 操作说明
- 培训教材

---

### 场景4：项目文档

**文档结构**：
```
H1: 项目计划书
  H2: 项目概述
  H2: 项目目标
    H3: 短期目标
      H4: Q1目标
        H5: 1月目标
          H6: 第一周任务
```

**适用于**：
- 项目计划
- 需求文档
- 设计文档
- 测试文档

---

## 🔧 技术实现

### 1. 工具栏选择器

**文件**：`src/components/editor/EditorToolbar.tsx`

**实现**：
```tsx
<Select 
  value={currentHeadingLevel ? currentHeadingLevel.toLowerCase() : 'p'} 
  onValueChange={(value) => onCommand('formatBlock', value)}
>
  <SelectTrigger className="w-[100px]">
    <SelectValue placeholder="标题" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="p">正文</SelectItem>
    <SelectItem value="h1">标题 1</SelectItem>
    <SelectItem value="h2">标题 2</SelectItem>
    <SelectItem value="h3">标题 3</SelectItem>
    <SelectItem value="h4">标题 4</SelectItem>
    <SelectItem value="h5">标题 5</SelectItem>
    <SelectItem value="h6">标题 6</SelectItem>
  </SelectContent>
</Select>
```

---

### 2. 编辑器样式

**文件**：`src/components/editor/EditorContent.tsx`

**实现**：
```css
.editor-content h1 {
  font-size: 2em;
  font-weight: bold;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  color: #4361ee;
}

.editor-content h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  color: #4361ee;
}

.editor-content h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 1em;
  color: #4361ee;
}

.editor-content h4 {
  font-size: 1em;
  font-weight: bold;
  margin-top: 1.33em;
  margin-bottom: 1.33em;
  color: #4361ee;
}

.editor-content h5 {
  font-size: 0.83em;
  font-weight: bold;
  margin-top: 1.67em;
  margin-bottom: 1.67em;
  color: #4361ee;
}

.editor-content h6 {
  font-size: 0.67em;
  font-weight: bold;
  margin-top: 2.33em;
  margin-bottom: 2.33em;
  color: #4361ee;
}
```

---

### 3. 导出HTML样式

**文件**：`src/pages/Editor.tsx`

**桌面端样式**：
```css
h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #4361ee;
}

h1 { font-size: 2em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.83em; }
h6 { font-size: 0.67em; }
```

**移动端样式**：
```css
h1 { font-size: 1.5em; }
h2 { font-size: 1.25em; }
h3 { font-size: 1.1em; }
h4 { font-size: 1em; }
h5 { font-size: 0.9em; }
h6 { font-size: 0.85em; }
```

---

### 4. 目录生成

**文件**：`src/pages/Editor.tsx`

**实现**：
```tsx
// 编辑器内目录
const headingElements = editor.querySelectorAll('h1, h2, h3, h4, h5, h6');

// 导出HTML目录
const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
```

**目录层级**：
- 自动识别H1-H6所有标题
- 根据标题级别生成多层级目录
- 支持点击跳转到对应标题

---

## 📝 修改文件列表

### 1. src/components/editor/EditorToolbar.tsx

**修改内容**：
- 在标题选择器中添加H4、H5、H6选项

**代码统计**：
- 新增行数：+3行

---

### 2. src/components/editor/EditorContent.tsx

**修改内容**：
- 添加H4、H5、H6的CSS样式定义

**代码统计**：
- 新增行数：+24行

---

### 3. src/pages/Editor.tsx

**修改内容**：
1. 更新编辑器内目录生成（第109行）
2. 更新导出HTML目录生成（第619行）
3. 更新导出HTML桌面端样式（第692-703行）
4. 更新导出HTML移动端样式（第1013-1018行）
5. 更新导出成功提示信息（第1209行）

**代码统计**：
- 修改行数：5处
- 新增行数：+9行

---

## 💡 用户体验改进

### 改进前

**限制**：
- ❌ 只有3个标题级别
- ❌ 复杂文档层次不够
- ❌ 无法满足深层次结构需求
- ❌ 目录层级有限

### 改进后

**优势**：
- ✅ 6个标题级别，层次丰富
- ✅ 支持复杂文档结构
- ✅ 满足各类文档需求
- ✅ 目录层级完整

---

## 🎨 视觉层次

### 标题大小对比

```
H1: 最大标题 (2em)
  H2: 次级标题 (1.5em)
    H3: 三级标题 (1.17em)
      H4: 四级标题 (1em)
        H5: 五级标题 (0.83em)
          H6: 六级标题 (0.67em)
```

### 视觉效果

**H1**：用于文档主标题，最醒目
**H2**：用于章节标题，次醒目
**H3**：用于小节标题，中等醒目
**H4**：用于子小节标题，与正文大小相同但加粗
**H5**：用于细分标题，略小于正文
**H6**：用于最细分标题，最小

---

## 🧪 测试验证

### 测试1：标题选择

**步骤**：
1. 在编辑器中输入文本
2. 选中文本
3. 在工具栏标题选择器中选择"标题 4"
4. 观察文本是否变为H4样式
5. 重复测试H5和H6

**预期结果**：
- ✅ H4样式正确（1em，加粗，蓝色）
- ✅ H5样式正确（0.83em，加粗，蓝色）
- ✅ H6样式正确（0.67em，加粗，蓝色）

---

### 测试2：目录生成

**步骤**：
1. 创建包含H1-H6的文档
2. 观察左侧目录面板
3. 检查是否显示所有标题
4. 点击目录项跳转

**预期结果**：
- ✅ 目录显示所有H1-H6标题
- ✅ 目录层级正确
- ✅ 点击跳转正常

---

### 测试3：导出HTML

**步骤**：
1. 创建包含H1-H6的文档
2. 导出为HTML文件
3. 在浏览器中打开
4. 检查标题样式和目录

**预期结果**：
- ✅ 所有标题样式正确
- ✅ 悬浮目录显示所有标题
- ✅ 移动端样式适配正确

---

### 测试4：标题层级

**步骤**：
1. 创建多层级标题结构
2. 观察视觉层次
3. 检查间距和对齐

**预期结果**：
- ✅ 标题大小递减明显
- ✅ 层级关系清晰
- ✅ 间距合理

---

## 📊 功能对比

### 与主流编辑器对比

| 功能 | Word | Google Docs | Markdown | 本编辑器 |
|------|------|-------------|----------|----------|
| H1 | ✅ | ✅ | ✅ | ✅ |
| H2 | ✅ | ✅ | ✅ | ✅ |
| H3 | ✅ | ✅ | ✅ | ✅ |
| H4 | ✅ | ✅ | ✅ | ✅ |
| H5 | ✅ | ✅ | ✅ | ✅ |
| H6 | ✅ | ✅ | ✅ | ✅ |
| 自动目录 | ✅ | ✅ | ❌ | ✅ |

---

## 💡 使用技巧

### 技巧1：合理使用标题层级

```
✅ 推荐：
H1: 文档标题（只用一次）
H2: 章节标题
H3: 小节标题
H4: 子小节标题
H5: 细分标题
H6: 最细分标题

❌ 不推荐：
跳级使用（H1直接到H3）
过度使用H6
所有标题都用H1
```

---

### 技巧2：创建清晰的文档结构

```
1. 从H1开始，逐级递增
2. 同级标题使用相同级别
3. 子标题比父标题低一级
4. 避免跳级使用
```

---

### 技巧3：利用目录导航

```
1. 使用H1-H6创建完整层次
2. 查看左侧目录面板
3. 点击目录项快速跳转
4. 导出HTML保留目录功能
```

---

### 技巧4：移动端优化

```
1. 移动端标题自动缩小
2. 保持层级关系
3. 确保可读性
4. 测试移动端效果
```

---

## 🌐 浏览器兼容性

### formatBlock命令支持

| 浏览器 | H1-H3 | H4-H6 | 备注 |
|--------|-------|-------|------|
| Chrome 120+ | ✅ | ✅ | 完全支持 |
| Firefox 121+ | ✅ | ✅ | 完全支持 |
| Safari 17+ | ✅ | ✅ | 完全支持 |
| Edge 120+ | ✅ | ✅ | 完全支持 |

---

## 📈 版本历史

### v3.12.3 (2025-12-06)

**新增功能**：
- ✨ 标题级别扩展至H1-H6
- 🎨 新增H4、H5、H6样式
- 📋 目录支持H4-H6
- 📤 导出HTML支持H4-H6

---

## 🎯 最佳实践

### 1. 文档结构规范

```markdown
# H1: 文档标题（唯一）

## H2: 第一章

### H3: 第一节

#### H4: 第一小节

##### H5: 第一段

###### H6: 第一点
```

---

### 2. 标题命名规范

```
✅ 好的标题：
- 简洁明了
- 描述准确
- 层次清晰
- 便于理解

❌ 不好的标题：
- 过长冗余
- 含糊不清
- 层次混乱
- 难以理解
```

---

### 3. 目录优化

```
1. 控制目录深度（建议不超过4级）
2. 标题文字简洁（建议不超过20字）
3. 避免重复标题
4. 保持层级一致
```

---

## 📚 相关文档

- [缩进功能说明](./INDENT_FEATURE.md) - v3.12.2新功能
- [媒体自动播放修复说明](./MEDIA_AUTOPLAY_FIX.md) - v3.12.1修复
- [毛玻璃效果功能说明](./GLASS_EFFECT_FEATURE.md) - v3.12.0新功能

---

## 🎉 总结

标题级别扩展功能的添加使编辑器更加完善：

1. ✅ **6个标题级别**：满足复杂文档需求
2. ✅ **完整样式支持**：桌面端和移动端全覆盖
3. ✅ **目录自动生成**：H1-H6全部支持
4. ✅ **导出完整保留**：HTML导出包含所有样式
5. ✅ **浏览器兼容**：主流浏览器全支持

**版本**：v3.12.3  
**日期**：2025-12-06  
**状态**：已发布  
**测试**：✅ 通过

---

**让文档结构更加丰富！** 📝
