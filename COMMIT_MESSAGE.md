# Git提交消息建议

## 提交标题

```
feat: 添加JSON导入导出功能并修复链接插入问题 (v5.1.0)
```

## 提交详情

```
✨ 新增功能

JSON导入导出:
- 添加导出JSON功能，保存文档内容和所有设置
- 添加导入JSON功能，恢复文档内容和设置
- JSON文件包含版本号、内容、设置和导出时间
- 在设置面板添加导入/导出按钮
- 完整的错误处理和用户提示

🐛 Bug修复

链接插入功能:
- 修复打开链接对话框后选区丢失的问题
- 添加选区保存和恢复机制
- 支持选中文字后插入链接
- 智能使用选中的文本作为链接文本
- 优化链接插入的用户体验

📚 文档

- 更新CHANGELOG.md，添加v5.1.0更新日志
- 更新README.md，添加新功能说明
- 创建QUICKSTART.md快速开始指南
- 创建TESTING.md功能测试指南
- 创建example.json示例文档
- 创建IMPLEMENTATION_SUMMARY.md实现总结
- 创建VERIFICATION_CHECKLIST.md验证清单
- 创建RELEASE_NOTES.md发布说明

🔧 技术改进

- 优化选区保存和恢复机制
- 改进JSON序列化和反序列化
- 增强错误处理和用户提示
- 优化代码结构和性能
- 所有代码通过lint检查

📦 修改的文件

- src/pages/Editor.tsx
- src/components/editor/SettingsPanel.tsx
- src/components/editor/LinkDialog.tsx
- src/components/editor/EditorToolbar.tsx
- CHANGELOG.md
- README.md

📝 新增的文件

- QUICKSTART.md
- TESTING.md
- example.json
- IMPLEMENTATION_SUMMARY.md
- VERIFICATION_CHECKLIST.md
- RELEASE_NOTES.md
- COMMIT_MESSAGE.md

Breaking Changes: 无

Closes: #[issue-number] (如果有相关issue)
```

## 简短版本（如果需要）

```
feat: 添加JSON导入导出和修复链接插入 (v5.1.0)

- 新增JSON导入导出功能，支持保存和恢复文档
- 修复链接插入功能，支持选中文字插入链接
- 添加完整的文档和测试指南
- 优化用户体验和错误处理
```

## 提交命令

```bash
# 添加所有修改的文件
git add .

# 提交
git commit -m "feat: 添加JSON导入导出功能并修复链接插入问题 (v5.1.0)

✨ 新增功能
- JSON导入导出：保存和恢复文档内容及设置
- 在设置面板添加导入/导出按钮

🐛 Bug修复
- 修复链接插入选区丢失问题
- 支持选中文字后插入链接

📚 文档
- 添加快速开始指南、测试指南和示例文档
- 更新README和CHANGELOG

🔧 技术改进
- 优化选区保存恢复机制
- 增强错误处理
- 所有代码通过lint检查"

# 创建标签
git tag -a v5.1.0 -m "Release v5.1.0: JSON导入导出 + 链接插入修复"

# 推送
git push origin main
git push origin v5.1.0
```
