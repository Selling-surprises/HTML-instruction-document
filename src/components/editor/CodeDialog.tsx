import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Code } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CODE_THEMES } from '@/types/editor';
import hljs from 'highlight.js/lib/core';

interface CodeDialogProps {
  onInsertCode: (code: string, language: string, theme: string) => void;
  onUpdateCode?: (id: string, code: string, language: string, theme: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: { id: string; code: string; language: string; theme: string } | null;
  showTrigger?: boolean;
}

// 常用编程语言列表
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'vbscript', label: 'VBScript' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: '纯文本' },
];

export function CodeDialog({ 
  onInsertCode, 
  onUpdateCode,
  currentTheme, 
  onThemeChange,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  initialData,
  showTrigger = true
}: CodeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (setExternalOpen) setExternalOpen(val);
    else setInternalOpen(val);
  };

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [previewHtml, setPreviewHtml] = useState('');
  const [localTheme, setLocalTheme] = useState(currentTheme);

  // 当初始数据变化或对话框打开时，初始化数据
  useEffect(() => {
    if (open) {
      if (initialData) {
        setCode(initialData.code);
        setLanguage(initialData.language);
        setLocalTheme(initialData.theme || currentTheme);
      } else {
        setCode('');
        setLanguage('javascript');
        setLocalTheme(currentTheme);
      }
    }
  }, [initialData, currentTheme, open]);

  // 更新代码预览
  useEffect(() => {
    if (code.trim() && language) {
      try {
        const highlighted = hljs.highlight(code, { language }).value;
        setPreviewHtml(highlighted);
      } catch (error) {
        // 如果高亮失败，使用纯文本
        setPreviewHtml(code.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      }
    } else {
      setPreviewHtml('');
    }
  }, [code, language]);

  const handleSave = () => {
    if (code.trim()) {
      if (initialData && onUpdateCode) {
        onUpdateCode(initialData.id, code, language, localTheme);
      } else {
        onInsertCode(code, language, localTheme);
      }
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="插入代码">
            <Code className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>插入代码</DialogTitle>
          <DialogDescription>
            输入代码并选择编程语言，代码将以高亮格式插入到文档中
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">编程语言</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="选择编程语言" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">代码主题（共{CODE_THEMES.length}种）</Label>
              <Select value={localTheme} onValueChange={setLocalTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="选择代码主题" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {/* 按分类分组显示 */}
                  {['经典', '现代', '复古', '明亮', '特殊'].map((category) => {
                    const themesInCategory = CODE_THEMES.filter(t => t.category === category);
                    if (themesInCategory.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}主题
                        </div>
                        {themesInCategory.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <div className="flex items-center gap-2">
                              <span>{theme.label}</span>
                              <span className="text-xs text-muted-foreground">- {theme.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">代码内容</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="在此输入代码..."
                className="font-mono min-h-[400px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>实时预览</Label>
              <div className={`border rounded-md p-4 min-h-[400px] overflow-auto relative code-theme-${localTheme} code-preview-scrollbar`}>
                {/* 插入预览主题的link标签，确保预览时能看到选中的主题效果 */}
                <link rel="stylesheet" href={`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${localTheme}.min.css`} />
                {previewHtml ? (
                  <pre className="!m-0 !p-0 !bg-transparent overflow-x-auto">
                    <code
                      className={`hljs language-${language}`}
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </pre>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    输入代码后将在此显示预览效果
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!code.trim()}>
            {initialData ? '保存修改' : '插入代码'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
