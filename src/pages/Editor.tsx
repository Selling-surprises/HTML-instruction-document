import { useState, useRef, useCallback, useEffect } from 'react';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorContent, EditorContentRef } from '@/components/editor/EditorContent';
import { EditorStatusBar } from '@/components/editor/EditorStatusBar';
import { TableOfContents } from '@/components/editor/TableOfContents';
import { SettingsPanel } from '@/components/editor/SettingsPanel';
import { EnhancedTableToolbar, EnhancedTableToolbarRef } from '@/components/editor/EnhancedTableToolbar';
import { ScrollButtons } from '@/components/editor/ScrollButtons';
import { EnhancedTableDialog } from '@/components/editor/EnhancedTableDialog';

import { LinkDialog, type LinkData } from '@/components/editor/LinkDialog';
import { AttachmentDialog, type AttachmentData } from '@/components/editor/AttachmentDialog';
import { AttachmentCodeDialog } from '@/components/editor/AttachmentCodeDialog';
import { CodeDialog } from '@/components/editor/CodeDialog';

import type { AudioMetadata } from '@/components/editor/AudioDialog';
import type { EditorSettings, HeadingItem, FontFamily, FontSize, PageNode } from '@/types/editor';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MobileToolbar } from '@/components/editor/MobileToolbar';
import { Settings, Menu, Search, X } from 'lucide-react';
import { useContextMenu } from '@/hooks/useContextMenu';
import { ContextMenu } from '@/components/editor/ContextMenu';
import { ParagraphDialog } from '@/components/editor/ParagraphDialog';
import { TablePropertiesDialog } from '@/components/editor/TablePropertiesDialog';
import { generateVideoEmbed, generateAudioEmbed } from '@/utils/mediaUtils';
import { exportMarkdown } from '@/utils/markdownUtils';
import { importHTMLFile, cleanupHTMLString } from '@/utils/htmlImportUtils';
import type { ImportedPage } from '@/utils/htmlImportUtils';
import { importMarkdownFile } from '@/utils/markdownImportUtils';
import { supabase } from '@/db/supabase';
import hljs from 'highlight.js/lib/core';
// 导入常用语言
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import { cn } from '@/lib/utils';

import markdown from 'highlight.js/lib/languages/markdown';
// 不再静态导入主题CSS，改为动态加载
import { marked } from 'marked';


// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
// 作用域化主题样式缓存
const scopedThemesCache = new Set<string>();

/**
 * 动态加载并隔离代码高亮主题样式
 * 通过为所有CSS选择器添加作用域类名前缀，解决多个主题共存时的冲突问题
 */
async function loadScopedTheme(themeName: string) {
  if (scopedThemesCache.has(themeName)) return;
  
  const styleId = `scoped-hljs-theme-${themeName}`;
  if (document.getElementById(styleId)) {
    scopedThemesCache.add(themeName);
    return;
  }

  try {
    const response = await fetch(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`);
    if (!response.ok) throw new Error('Failed to fetch theme');
    
    let cssText = await response.text();
    
    // 为所有非媒体查询的选择器添加作用域前缀
    // 这里的正则表达式会将 .hljs 替换为 .code-theme-xxx .hljs
    // 处理复杂的CSS选择器列表
    const scopedCss = cssText.replace(/([^\r\n,{}]+)(?=[^{}]*{)/g, (match) => {
      // 忽略媒体查询和动画帧
      if (match.includes('@') || match.trim().startsWith('from') || match.trim().startsWith('to') || /^\d/.test(match.trim())) {
        return match;
      }
      return `.code-theme-${themeName} ${match.trim()}`;
    });
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = scopedCss;
    document.head.appendChild(style);
    scopedThemesCache.add(themeName);
  } catch (error) {
    console.error(`Failed to load scoped theme ${themeName}:`, error);
    // 降级处理：如果动态处理失败，则使用传统的link方式（虽有冲突风险但总比没样式好）
    if (!document.getElementById(`hljs-theme-${themeName}`)) {
      const link = document.createElement('link');
      link.id = `hljs-theme-${themeName}`;
      link.rel = 'stylesheet';
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;
      document.head.appendChild(link);
    }
  }
}

hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const MAX_HISTORY = 50;

export default function Editor() {
  const { toast } = useToast();
  const editorRef = useRef<EditorContentRef>(null);
  const tableToolbarRef = useRef<EnhancedTableToolbarRef>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const handleEditLinkRef = useRef<((linkElement: HTMLAnchorElement) => void) | null>(null);
  
  const isInternalChange = useRef(false);

  const [pages, setPages] = useState<PageNode[]>([
    {
      id: 'page-1',
      title: '未命名文档',
      content: '<p>开始编辑您的文档...</p>',
      parentId: null,
      order: 0,
    }
  ]);
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [content, setContent] = useState(pages[0].content);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [currentFont, setCurrentFont] = useState<FontFamily>('Arial');
  const [currentFontSize, setCurrentFontSize] = useState<FontSize>('16px');
  const [currentHeadingLevel, setCurrentHeadingLevel] = useState<string>('');
  const [selectedText, setSelectedText] = useState('');
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // CHM 侧边栏状态
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [tocWidth, setTocWidth] = useState(380);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const isResizingToc = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [hasSelectedCells, setHasSelectedCells] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [settings, setSettings] = useState<EditorSettings>({
    pageTitle: '文档1',
    favicon: '',
    backgroundImage: '',
    opacity: 100,
    enableMobileAdaptation: false,
    mobileBackgroundImage: '',
    enableGlassEffect: false,
    glassBlur: 10,
    useBlackMask: false, // 默认使用白色遮罩
    codeTheme: 'atom-one-dark', // 默认代码主题
    enableScrollButtons: true, // 默认开启跳转按钮
    enableSourceLink: false, // 默认不显示原链接
    sourceUrl: '', // 原文链接
    pageTitleColor: '#4361ee', // 文档标题颜色
    sidebarBackgroundColor: '#f8fafc', // 侧边栏背景颜色
    sidebarTextColor: '#334155', // 侧边栏文字颜色
  });

  // 链接编辑状态
  const [editingLink, setEditingLink] = useState<HTMLAnchorElement | null>(null);
  const [linkEditData, setLinkEditData] = useState<Partial<LinkData> | null>(null);
  const [editingAttachment, setEditingAttachment] = useState<HTMLElement | null>(null);
  const [attachmentEditData, setAttachmentEditData] = useState<Partial<AttachmentData> | null>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  
  // 附件提取码弹窗状态
  const [activeAttachmentForCode, setActiveAttachmentForCode] = useState<{
    code: string;
    url: string;
    fileName: string;
  } | null>(null);

  // 代码块编辑状态
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [editingCodeBlock, setEditingCodeBlock] = useState<{ id: string; code: string; language: string; theme: string } | null>(null);


  const editorContentRef = useRef<HTMLDivElement | null>(null);
  
  // 获取编辑器内容的 DOM 元素
  useEffect(() => {
    if (editorRef.current) {
      const element = editorRef.current.getElement();
      if (element) {
        editorContentRef.current = element;
      }
    }
  }, []);

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
    editorRef: editorContentRef as any,
    onContentChange: () => {
      // editorContentRef.current 已经是 DOM 元素本身，或者是 EditorContent 暴露的 getElement 方法返回的结果
      // 在 useEffect 中它被赋值为 editorRef.current.getElement()，即 HTMLDivElement
      const element = editorContentRef.current;
      if (element) {
        // @ts-ignore
        const html = element.innerHTML || (element as any).getElement?.()?.innerHTML;
        if (html !== undefined) {
          handleContentChange(html);
        }
      }
    },
    onCommand: (command, item, context) => {
      console.log('执行右键菜单命令:', command, item, context);
      
      // 处理自定义命令
      switch (command) {
        case 'fontDialog':
          toast({
            title: '字体对话框',
            description: '字体对话框功能即将推出'
          });
          break;
        case 'insertSymbol':
          toast({
            title: '插入符号',
            description: '符号选择器功能即将推出'
          });
          break;
        case 'hyperlink':
        case 'insertHyperlink':
          const url = prompt('请输入链接地址:', 'https://');
          if (url) {
            handleInsertLink({ url, type: 'text', text: '' });
          }
          break;
        case 'insertImage':
          const imageUrl = prompt('请输入图片地址:');
          if (imageUrl) {
            handleImageUpload(imageUrl);
          }
          break;
        case 'insertTable':
          const tRows = parseInt(prompt('行数:', '3') || '0');
          const tCols = parseInt(prompt('列数:', '3') || '0');
          if (tRows > 0 && tCols > 0) {
            handleInsertTable(tRows, tCols, []);
          }
          break;
        case 'insertCode':
          const code = prompt('请输入代码:');
          if (code) {
            handleInsertCode(code, 'javascript');
          }
          break;
        case 'insertPageBreak':
          handleCommand('insertHTML', '<hr style="page-break-after: always;">');
          break;
        case 'newComment':
          toast({
            title: '新建批注',
            description: '批注功能即将推出'
          });
          break;
        default:
          console.log('未处理的命令:', command);
      }
    }
  });

  // 动态加载并隔离文档中使用的所有代码主题
  useEffect(() => {
    // 同时也加载设置中的全局默认主题（用于预览和新插入）
    loadScopedTheme(settings.codeTheme);
    
    const editor = editorRef.current?.getElement();
    if (!editor) return;
    
    const codeBlocks = editor.querySelectorAll('.code-block-wrapper');
    codeBlocks.forEach(block => {
      const theme = block.getAttribute('data-theme');
      if (theme) {
        // 加载隔离的主题样式
        loadScopedTheme(theme);
        // 确保块上带有对应的主题类名以触发隔离样式
        if (block instanceof HTMLElement && !block.classList.contains(`code-theme-${theme}`)) {
          block.classList.add(`code-theme-${theme}`);
        }
      }
    });
  }, [content, settings.codeTheme]);

  // 更新统计信息
  useEffect(() => {
    // 创建临时DOM元素来解析内容
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // 移除所有链接编辑图标（不计入字符统计）
    const linkEditIcons = tempDiv.querySelectorAll('.link-edit-icon');
    linkEditIcons.forEach(icon => icon.remove());
    
    // 移除所有卡片操作按钮（不计入字符统计）
    const cardActions = tempDiv.querySelectorAll('.card-actions');
    cardActions.forEach(action => action.remove());
    
    // 获取纯文本内容
    const text = (tempDiv.textContent || '').trim();
    setCharacterCount(text.length);
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // 更新目录
  useEffect(() => {
    const updateHeadings = () => {
      const editor = editorRef.current?.getElement();
      if (!editor) return;

      const headingElements = editor.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const newHeadings: HeadingItem[] = [];

      const seenTexts: Record<string, number> = {};
      
      headingElements.forEach((element) => {
        const text = (element.textContent || '').trim();
        // 如果文本为空，则使用标签名
        const baseId = text ? text.substring(0, 20).replace(/\s+/g, '-') : element.tagName.toLowerCase();
        
        // 处理重复标题
        seenTexts[baseId] = (seenTexts[baseId] || 0) + 1;
        const finalId = seenTexts[baseId] > 1 ? `h-${baseId}-${seenTexts[baseId]}` : `h-${baseId}`;
        
        // 始终使用基于内容的 ID，这样即便位置变了，折叠状态也比较稳定
        element.id = finalId;
        
        newHeadings.push({
          id: finalId,
          level: parseInt(element.tagName[1]),
          text: text,
          element: element as HTMLElement,
        });
      });

      setHeadings(newHeadings);
    };

    updateHeadings();
  }, [content]);

  // 监听右侧滚动容器，同步高亮侧边栏当前节点
  useEffect(() => {
    const container = mainContentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const editor = editorRef.current?.getElement();
      if (!editor) return;

      const headingEls = editor.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const containerTop = container.getBoundingClientRect().top;
      let currentId = '';

      headingEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= 80) {
          currentId = el.id;
        }
      });

      if (currentId) setActiveHeadingId(currentId);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  });

  // 更新页面标题
  useEffect(() => {
    document.title = settings.pageTitle;
  }, [settings.pageTitle]);

  // 更新favicon
  useEffect(() => {
    if (settings.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.favicon]);

  // 设置卡片和代码块的全局函数
  useEffect(() => {
    // 兼容旧版本的卡片编辑功能（旧卡片可能仍有 onclick="window.editLinkCard()"）
    // @ts-ignore
    window.editLinkCard = (cardId: string) => {
      const card = document.getElementById(cardId) as HTMLElement;
      if (!card) {
        console.error('找不到卡片元素:', cardId);
        toast({
          title: '错误',
          description: '找不到要编辑的卡片',
          variant: 'destructive',
        });
        return;
      }
      
      // 调用新的编辑逻辑（通过 ref）
      if (handleEditLinkRef.current) {
        handleEditLinkRef.current(card as unknown as HTMLAnchorElement);
      }
    };
    
    // @ts-ignore
    window.deleteLinkCard = (cardId: string) => {
      const editor = editorRef.current?.getElement();
      if (!editor) return;
      
      // 使用document.getElementById更可靠
      const card = document.getElementById(cardId) as HTMLElement;
      if (!card) {
        console.error('找不到卡片元素:', cardId);
        toast({
          title: '错误',
          description: '找不到要删除的卡片',
          variant: 'destructive',
        });
        return;
      }
      
      if (confirm('确定要删除这个链接卡片吗？')) {
        card.remove();
        
        // 触发内容更新
        if (editor) {
          setContent(editor.innerHTML);
          handleContentChange(editor.innerHTML);
        }
        
        toast({
          title: '成功',
          description: '链接卡片已删除',
        });
      }
    };
    
    // @ts-ignore
    window.viewAttachment = (attachId: string) => {
      const element = document.getElementById(attachId);
      if (element) {
        const dataStr = element.getAttribute('data-attachment');
        if (dataStr) {
          try {
            const data: AttachmentData = JSON.parse(dataStr);
            if (data.code) {
              setActiveAttachmentForCode({
                code: data.code,
                url: data.url,
                fileName: data.name
              });
            } else {
              window.open(data.url, '_blank');
            }
          } catch (e) {
            console.error('解析附件数据失败:', e);
          }
        }
      }
    };

    // @ts-ignore
    window.editAttachment = (attachId: string) => {
      const element = document.getElementById(attachId);
      if (element) {
        const dataStr = element.getAttribute('data-attachment');
        if (dataStr) {
          try {
            const data = JSON.parse(dataStr);
            setEditingAttachment(element);
            setAttachmentEditData(data);
          } catch (e) {
            console.error('解析附件数据失败:', e);
          }
        }
      }
    };

    // @ts-ignore
    window.deleteAttachment = (attachId: string) => {
      const editor = editorRef.current?.getElement();
      if (!editor) return;
      const element = document.getElementById(attachId);
      if (element && confirm('确定要删除这个附件吗？')) {
        element.remove();
        if (editor) {
          setContent(editor.innerHTML);
          handleContentChange(editor.innerHTML);
        }
        toast({
          title: '成功',
          description: '附件已删除',
        });
      }
    };
    
    // @ts-ignore
    window.editCodeBlock = (codeBlockId: string) => {
      const codeBlock = document.getElementById(codeBlockId) as HTMLElement;
      if (!codeBlock) {
        toast({
          title: '错误',
          description: '找不到代码块',
          variant: 'destructive',
        });
        return;
      }
      
      const code = codeBlock.getAttribute('data-code') || '';
      const language = codeBlock.getAttribute('data-language') || 'javascript';
      const theme = codeBlock.getAttribute('data-theme') || settings.codeTheme;
      const decodedCode = code.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      
      setEditingCodeBlock({
        id: codeBlockId,
        code: decodedCode,
        language,
        theme,
      });
      setCodeDialogOpen(true);
    };

    // @ts-ignore
    window.copyCodeBlock = (codeBlockId: string, buttonElement?: HTMLButtonElement) => {
      const codeBlock = document.getElementById(codeBlockId) as HTMLElement;
      if (!codeBlock) {
        toast({
          title: '错误',
          description: '找不到代码块',
          variant: 'destructive',
        });
        return;
      }
      
      // 从data属性获取原始代码
      const code = codeBlock.getAttribute('data-code') || '';
      const decodedCode = code.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      
      // 更新按钮状态的函数
      const updateButtonState = (success: boolean) => {
        if (buttonElement) {
          const originalText = buttonElement.textContent || '复制';
          const originalBg = buttonElement.style.background || '#3b82f6';
          if (success) {
            buttonElement.textContent = '已复制';
            buttonElement.style.background = '#10b981';
            setTimeout(() => {
              buttonElement.textContent = originalText;
              buttonElement.style.background = originalBg;
            }, 2000);
          }
        }
      };
      
      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(decodedCode).then(() => {
          updateButtonState(true);
          toast({
            title: '成功',
            description: '代码已复制到剪贴板',
          });
        }).catch((err) => {
          console.error('复制失败:', err);
          toast({
            title: '错误',
            description: '复制失败，请手动复制',
            variant: 'destructive',
          });
        });
      } else {
        // 降级方案：使用 textarea
        const textarea = document.createElement('textarea');
        textarea.value = decodedCode;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          updateButtonState(true);
          toast({
            title: '成功',
            description: '代码已复制到剪贴板',
          });
        } catch (err) {
          console.error('复制失败:', err);
          toast({
            title: '错误',
            description: '复制失败，请手动复制',
            variant: 'destructive',
          });
        }
        document.body.removeChild(textarea);
      }
    };
    
    // @ts-ignore
    window.deleteCodeBlock = (codeBlockId: string) => {
      const editor = editorRef.current?.getElement();
      if (!editor) return;
      
      const codeBlock = document.getElementById(codeBlockId) as HTMLElement;
      if (!codeBlock) {
        toast({
          title: '错误',
          description: '找不到要删除的代码块',
          variant: 'destructive',
        });
        return;
      }
      
      if (confirm('确定要删除这个代码块吗？')) {
        codeBlock.remove();
        
        // 触发内容更新
        if (editor) {
          setContent(editor.innerHTML);
        }
        
        toast({
          title: '成功',
          description: '代码块已删除',
        });
      }
    };
    
    return () => {
      // @ts-ignore
      delete window.editLinkCard;
      // @ts-ignore
      delete window.deleteLinkCard;
      // @ts-ignore
      delete window.copyCodeBlock;
      // @ts-ignore
      delete window.deleteCodeBlock;
      // @ts-ignore
      delete window.viewAttachment;
      // @ts-ignore
      delete window.editAttachment;
      // @ts-ignore
      delete window.deleteAttachment;
    };
  }, [toast]);

  // 保存光标位置
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // 恢复光标位置
  const restoreSelection = useCallback(() => {
    const editor = editorRef.current?.getElement();
    if (editor && savedRangeRef.current) {
      editor.focus();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }
  }, []);

  // 检测当前格式状态
  const updateFormatState = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // 如果选区在编辑器内，保存当前位置
    const range = selection.getRangeAt(0);
    const editor = editorRef.current?.getElement();
    if (editor && editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
    
    setSelectedText(selection.toString());


    let node = selection.anchorNode;
    if (!node) return;

    // 如果是文本节点，获取其父元素
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    if (!node || !(node instanceof HTMLElement)) return;

    // 检测标题级别
    let currentElement: HTMLElement | null = node;
    let headingLevel = '';
    
    while (currentElement && currentElement !== editorRef.current?.getElement()) {
      const tagName = currentElement.tagName?.toLowerCase();
      if (tagName && /^h[1-6]$/.test(tagName)) {
        headingLevel = tagName.toUpperCase();
        break;
      }
      currentElement = currentElement.parentElement;
    }
    
    setCurrentHeadingLevel(headingLevel);

    // 检测字体
    const computedStyle = window.getComputedStyle(node);
    const fontFamily = computedStyle.fontFamily;
    
    // 提取第一个字体名称
    if (fontFamily) {
      const firstFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      // 匹配已知字体
      const knownFonts: FontFamily[] = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Microsoft YaHei', 'SimSun'];
      const matchedFont = knownFonts.find(f => firstFont.includes(f) || f.includes(firstFont));
      if (matchedFont) {
        setCurrentFont(matchedFont);
      }
    }

    // 检测字号
    const fontSize = computedStyle.fontSize;
    if (fontSize) {
      // 将px转换为我们支持的字号
      const pxValue = parseInt(fontSize);
      const knownSizes: FontSize[] = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
      
      // 找到最接近的字号
      let closestSize: FontSize = '16px';
      let minDiff = Infinity;
      
      knownSizes.forEach(size => {
        const sizeValue = parseInt(size);
        const diff = Math.abs(sizeValue - pxValue);
        if (diff < minDiff) {
          minDiff = diff;
          closestSize = size;
        }
      });
      
      setCurrentFontSize(closestSize);
    }
  }, []);

  // 监听选区变化
  useEffect(() => {
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    const handleSelectionChange = () => {
      updateFormatState();
      // 更新表格单元格选中状态
      if (tableToolbarRef.current) {
        const cells = tableToolbarRef.current.getSelectedCells();
        setHasSelectedCells(cells.length > 0);
      }
    };

    // 监听选区变化
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // 监听鼠标点击
    editor.addEventListener('click', handleSelectionChange);
    
    // 监听键盘事件
    editor.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      editor.removeEventListener('click', handleSelectionChange);
      editor.removeEventListener('keyup', handleSelectionChange);
    };
  }, [updateFormatState]);

  const handleContentChange = useCallback((newContent: string) => {
    // 严谨检查, 防止 undefined 字符串进入
    if (newContent === undefined || newContent === null || String(newContent) === 'undefined') {
      return;
    }
    
    // 如果内容完全相同，不触发更新
    if (newContent === content) return;
    
    setContent(newContent);
    // 同步更新 pages
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content: newContent } : p));

    // 如果是内部撤销/重做触发的变化，不计入历史记录
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    // 历史记录更新逻辑
    setHistory(prev => {
      // 截取当前进度之前的历史
      const newHistory = prev.slice(0, historyIndex + 1);
      
      // 如果新内容与最后一条历史相同，则不添加
      if (newHistory.length > 0 && newHistory[newHistory.length - 1] === newContent) {
        return prev;
      }
      
      const updatedHistory = [...newHistory, newContent];
      
      // 限制最大历史记录数量
      if (updatedHistory.length > MAX_HISTORY) {
        const sliced = updatedHistory.slice(updatedHistory.length - MAX_HISTORY);
        setHistoryIndex(sliced.length - 1);
        return sliced;
      }
      
      setHistoryIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  }, [content, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const undoContent = history[newIndex];
      
      if (undoContent !== undefined && String(undoContent) !== 'undefined') {
        isInternalChange.current = true;
        setHistoryIndex(newIndex);
        setContent(undoContent);
      }
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const redoContent = history[newIndex];
      
      if (redoContent !== undefined && String(redoContent) !== 'undefined') {
        isInternalChange.current = true;
        setHistoryIndex(newIndex);
        setContent(redoContent);
      }
    }
  }, [history, historyIndex]);


  const handleCommand = useCallback((command: string, value?: string) => {
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    // 如果有保存的选区位置，尝试恢复它，确保命令插入到正确位置
    if (savedRangeRef.current) {
      restoreSelection();
    } else {
      editor.focus();
    }

    // 处理行高
    if (command === 'lineHeight') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      let container = range.commonAncestorContainer as Node;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement as HTMLElement;
      }
      
      const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'TD', 'TH'];
      let target = container as HTMLElement;
      while (target && target !== editor && !blockTags.includes(target.tagName)) {
        target = target.parentElement as HTMLElement;
      }
      
      if (target && target !== editor) {
        target.style.lineHeight = value || '1.5';
        setContent(editor.innerHTML);
      } else {
        document.execCommand('formatBlock', false, 'p');
        setTimeout(() => {
          handleCommand('lineHeight', value);
        }, 10);
      }
      return;
    }

    // 处理首行缩进
    if (command === 'textIndent') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      let container = range.commonAncestorContainer as Node;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement as HTMLElement;
      }
      
      const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'];
      let target = container as HTMLElement;
      while (target && target !== editor && !blockTags.includes(target.tagName)) {
        target = target.parentElement as HTMLElement;
      }
      
      if (target && target !== editor) {
        const currentIndent = target.style.textIndent;
        target.style.textIndent = currentIndent === '2em' ? '0' : '2em';
        setContent(editor.innerHTML);
      }
      return;
    }

    // 处理对齐命令（图片和表格）
    if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight' || command === 'justifyFull') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let element = range.commonAncestorContainer;
        
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement as Node;
        }
        
        const cell = (element as HTMLElement).closest('td, th');
        if (cell) {
          const alignValue = command === 'justifyLeft' ? 'left' 
            : command === 'justifyCenter' ? 'center' : command === 'justifyRight' ? 'right' : 'justify';
          
          (cell as HTMLTableCellElement).style.textAlign = alignValue;
          setContent(editor.innerHTML);
          toast({
            title: '对齐成功',
            description: `单元格内容已${alignValue === 'left' ? '左对齐' : alignValue === 'center' ? '居中对齐' : alignValue === 'right' ? '右对齐' : '两端对齐'}`,
          });
          return;
        }
        
        let img: HTMLImageElement | null = null;
        if ((element as HTMLElement).tagName === 'IMG') {
          img = element as HTMLImageElement;
        } else if (element instanceof HTMLElement) {
          const imgs = element.querySelectorAll('img');
          if (imgs.length > 0) {
            img = imgs[0] as HTMLImageElement;
          }
        }
        
        if (img) {
          const alignClass = command === 'justifyLeft' ? 'img-left' 
            : command === 'justifyCenter' ? 'img-center' : command === 'justifyRight' ? 'img-right' : '';
          img.className = alignClass;
          setContent(editor.innerHTML);
          toast({
            title: '图片对齐成功',
            description: `图片已${command === 'justifyLeft' ? '左对齐' : command === 'justifyCenter' ? '居中' : command === 'justifyRight' ? '右对齐' : '清除对齐'}`,
          });
          return;
        }
      }
    }

    if (command === 'fontSize') {
      const targetSize = value || '16px';

      // 第一步：清理编辑器内所有残留的 font[size] 元素（前次失败操作可能遗留）
      // 逆序处理防止嵌套节点替换顺序错误
      const residuals = Array.from(editor.querySelectorAll('font[size]')).reverse();
      residuals.forEach((el) => {
        const span = document.createElement('span');
        // 保留已有内联字号；若无则不强制设定，交由继承
        const inlineSize = (el as HTMLElement).style.fontSize;
        if (inlineSize) span.style.fontSize = inlineSize;
        while (el.firstChild) span.appendChild(el.firstChild);
        el.parentNode?.replaceChild(span, el);
      });

      // 第二步：执行 execCommand，此时编辑器内不再有 font[size] 残留
      // 命令会为选区创建全新的 font[size="7"] 节点
      // 注意：execCommand 会同步触发 input 事件，此时 DOM 里含有 font[size="7"] 中间态
      // handleContentChange 会把含 font[size="7"] 的中间态 HTML 存入 pages，
      // 第三步替换完成后必须再次显式同步，否则切换页面返回时会还原为 48px
      document.execCommand('fontSize', false, '7');

      // 第三步：将所有 font[size="7"]（均为本次命令新建）替换为目标尺寸 span
      const newFontEls = Array.from(editor.querySelectorAll('font[size="7"]')).reverse();
      newFontEls.forEach((el) => {
        const span = document.createElement('span');
        span.style.fontSize = targetSize;
        while (el.firstChild) span.appendChild(el.firstChild);
        el.parentNode?.replaceChild(span, el);
      });

      // 第四步：显式用替换后的最终 HTML 覆盖 input 事件中保存的中间态
      // React 18 批量更新中，此次 setContent/setPages 排在 handleContentChange 之后执行，最终状态以此为准
      const finalHtml = editor.innerHTML;
      setContent(finalHtml);
      setPages(prev => prev.map(p => p.id === activePageId ? { ...p, content: finalHtml } : p));
    } else if (command === 'fontName') {
      document.execCommand('fontName', false, value);
    } else if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, value);
    } else if (command === 'removeFormat') {
      document.execCommand('removeFormat', false);
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer as Node;
        if (container.nodeType === Node.TEXT_NODE) {
          container = container.parentElement as HTMLElement;
        }
        const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'];
        let target = container as HTMLElement;
        while (target && target !== editor && !blockTags.includes(target.tagName)) {
          target = target.parentElement as HTMLElement;
        }
        if (target && target !== editor) {
          target.removeAttribute('style');
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    setContent(editor.innerHTML);
    updateFormatState();
  }, [updateFormatState, toast, activePageId]);
  const handleInsertSpecialChar = useCallback((char: string) => {
    restoreSelection();
    document.execCommand('insertText', false, char);
    const editor = editorRef.current?.getElement();
    if (editor) {
      setContent(editor.innerHTML);
      updateFormatState();
    }
  }, [updateFormatState]);
  const handleFindReplace = useCallback((find: string, replace: string, all: boolean) => {
    const editor = editorRef.current?.getElement();
    if (!editor) return;
    const currentHtml = editor.innerHTML;
    if (all) {
      const newHtml = currentHtml.split(find).join(replace);
      if (currentHtml !== newHtml) {
        setContent(newHtml);
        toast({ title: '替换完成', description: `已完成全部替换` });
      }
    } else {
      const newHtml = currentHtml.replace(find, replace);
      if (currentHtml !== newHtml) {
        setContent(newHtml);
        toast({ title: '替换完成', description: `已替换第一个匹配项` });
      } else {
        toast({ title: '未找到', description: `未找到匹配项: ${find}`, variant: 'destructive' });
      }
    }
  }, [toast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 处理编辑链接

  const handleInsertLink = useCallback((linkData: LinkData) => {
    restoreSelection();
    
    if (linkData.type === 'text') {
      // 检查当前是否已经有选区
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        // 如果有选中的文字，直接应用链接
        document.execCommand('createLink', false, linkData.url);
        // 如果提供了显示文本且不同于选区，则修改
        if (linkData.text && linkData.text !== selection.toString()) {
          const anchor = selection.anchorNode?.parentElement;
          if (anchor && anchor.tagName === 'A') {
            anchor.textContent = linkData.text;
          }
        }
      } else {
        // 如果没有选中文字，插入带链接的文本
        const linkText = linkData.text || linkData.url;
        const html = `<a href="${linkData.url}" target="_blank">${linkText}</a>`;
        document.execCommand('insertHTML', false, html);
      }
    } else {
      // 插入卡片链接
      const cardId = `card-${Date.now()}`;
      const html = `
        <div id="${cardId}" class="link-card-container my-4" contenteditable="false">
          <a href="${linkData.url}" target="_blank" class="link-card flex border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow no-underline text-foreground">
            ${linkData.image ? `<div class="w-1/3 shrink-0"><img src="${linkData.image}" class="w-full h-full object-cover" /></div>` : ''}
            <div class="flex-1 p-4 flex flex-col justify-center">
              <h4 class="m-0 text-lg font-bold line-clamp-1">${linkData.title || linkData.url}</h4>
              ${linkData.description ? `<p class="m-0 mt-2 text-sm text-muted-foreground line-clamp-2">${linkData.description}</p>` : ''}
              <span class="mt-2 text-xs text-primary truncate">${linkData.url}</span>
            </div>
          </a>
          <div class="card-actions flex gap-2 mt-2">
            <button onclick="window.editLinkCard('${cardId}')" class="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">编辑</button>
            <button onclick="window.deleteLinkCard('${cardId}')" class="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90">删除</button>
          </div>
        </div>
        <p><br></p>
      `;
      document.execCommand('insertHTML', false, html);
    }
    
    if (editorRef.current) {
      setContent(editorRef.current.getElement()?.innerHTML || '');
    }
  }, [restoreSelection]);

  const handleInsertTable = useCallback((rows: number, cols: number, data: string[][] = []) => {
    restoreSelection();

    const tableId = `table-${Date.now()}`;
    
    // 生成 HTML 表格内容
    let tableHtml = `<table id="${tableId}" style="width: auto; border-collapse: collapse; margin-left: 0; margin-right: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-family: inherit; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">`;
    
    // 生成表头
    tableHtml += '<thead><tr style="background-color: #f1f5f9; border-bottom: 2px solid #e2e8f0;">';
    for (let c = 0; c < cols; c++) {
      const cellContent = data[0]?.[c] || `列 ${c + 1}`;
      tableHtml += `<th style="padding: 12px 20px; text-align: left; font-weight: 700; color: #334155; border: 1px solid #e2e8f0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; min-height: 1.5em;">${cellContent}</th>`;
    }
    tableHtml += '</tr></thead>';
    
    // 生成数据行
    tableHtml += '<tbody>';
    for (let r = 1; r < rows; r++) {
      const isEven = r % 2 === 0;
      tableHtml += `<tr style="border-bottom: 1px solid #f1f5f9; background-color: ${isEven ? '#f8fafc' : '#ffffff'};">`;
      for (let c = 0; c < cols; c++) {
        const cellContent = data[r]?.[c] || '&nbsp;'; // 使用 &nbsp; 确保空单元格有高度
        tableHtml += `<td style="padding: 12px 20px; color: #475569; border: 1px solid #e2e8f0; font-size: 14px; line-height: 1.5; min-height: 1.5em;">${cellContent}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';

    document.execCommand('insertHTML', false, tableHtml);

    if (editorRef.current) {
      setContent(editorRef.current.getElement()?.innerHTML || '');
    }
  }, [restoreSelection]);

  const handleImageUpload = useCallback((url: string, caption?: string, width?: string) => {
    if (!url) return;
    
    const imageStyle = `max-width: 100%; height: auto; border-radius: 4px;${width ? ` width: ${width};` : ''}`;
    
    if (caption) {
      const figureHtml = `
        <figure class="image-container" style="display: flex; flex-direction: column; align-items: center; margin: 1.5em 0; border: 1px solid rgba(0,0,0,0.05); padding: 8px; border-radius: 8px; background: rgba(0,0,0,0.02);">
          <img src="${url}" style="${imageStyle}" />
          <figcaption style="margin-top: 10px; font-size: 14px; color: #666; font-style: italic; text-align: center; font-family: inherit;">${caption}</figcaption>
        </figure>
        <p><br></p>
      `;
      handleCommand("insertHTML", figureHtml);
    } else {
      const imgHtml = `<img src="${url}" style="${imageStyle}" /><p><br></p>`;
      handleCommand("insertHTML", imgHtml);
    }
  }, [handleCommand]);

  const editImageProperties = useCallback((img: HTMLImageElement) => {
    const currentWidth = img.style.width || img.getAttribute('width') || '100%';
      
    const widthPrompt = prompt('请输入图片宽度 (例如: 100%, 300px, 50%):', currentWidth);
    if (widthPrompt !== null) {
      img.style.width = widthPrompt;
      img.style.height = 'auto'; // 保持比例
      img.setAttribute('width', widthPrompt.replace('px', ''));
      
      if (editorRef.current) {
        setContent(editorRef.current.getElement()?.innerHTML || '');
      }
      
      toast({
        title: '属性已更新',
        description: '图片尺寸已调整'
      });
    }
  }, [toast]);


  const handleInsertVideo = useCallback((url: string, platform: string) => {
    restoreSelection();
    const embed = generateVideoEmbed(url, platform);
    const html = `<div class="video-container my-4" contenteditable="false">${embed}</div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) {
      setContent(editorRef.current.getElement()?.innerHTML || '');
    }
  }, [restoreSelection]);

  const handleInsertAudio = useCallback((metadata: AudioMetadata) => {
    restoreSelection();
    const embed = generateAudioEmbed(metadata.url, metadata.platform, metadata);
    const html = `<div class="audio-container my-4" contenteditable="false">${embed}</div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) {
      setContent(editorRef.current.getElement()?.innerHTML || '');
    }
  }, [restoreSelection]);

  const handleEditLink = useCallback((linkElement: HTMLAnchorElement) => {
    setEditingLink(linkElement);
    
    // 检查是否是卡片链接
    const isCard = linkElement.classList?.contains('link-card');
    
    if (isCard) {
      // 卡片链接 - 从data属性提取数据
      const url = linkElement.getAttribute('data-url') || '';
      const title = linkElement.getAttribute('data-title') || '';
      const description = linkElement.getAttribute('data-description') || '';
      const image = linkElement.getAttribute('data-image') || '';
      
      setLinkEditData({
        url: url,
        text: title,
        title: title,
        description: description,
        image: image,
        type: 'card',
      });
    } else {
      // 文本链接
      const href = linkElement.getAttribute('href') || '';
      // 优先从data属性获取原始文本,否则从textContent获取(需要移除编辑图标)
      let text = linkElement.getAttribute('data-link-text') || '';
      if (!text) {
        const textContent = linkElement.textContent || '';
        // 移除编辑图标emoji
        text = textContent.replace(/✏️/g, '').trim();
      }
      
      setLinkEditData({
        url: href,
        text: text,
        type: 'text',
      });
    }
  }, []);
  
  // 更新 ref，使全局函数可以访问最新的 handleEditLink
  useEffect(() => {
    handleEditLinkRef.current = handleEditLink;
  }, [handleEditLink]);

  // 处理更新链接
  const handleUpdateLink = useCallback((linkData: LinkData) => {
    if (!editingLink) return;
    
    const editor = editorRef.current?.getElement();
    if (!editor) return;
    
    // 检查原链接类型
    const wasCard = editingLink.classList?.contains('link-card');
    const isCard = linkData.type === 'card';
    
    // 如果类型改变,需要替换整个元素
    if (wasCard !== isCard) {
      // 创建新的链接HTML
      let newLinkHtml: string;
      
      if (isCard) {
        // 转换为卡片链接
        const cardTitle = linkData.title || linkData.text || linkData.url;
        const cardDescription = linkData.description || '';
        const cardImage = linkData.image || '';
        const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        newLinkHtml = `<div class="link-card" id="${cardId}" contenteditable="false" data-url="${linkData.url}" data-title="${cardTitle}" data-description="${cardDescription}" data-image="${cardImage}" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; display: block; width: 100%; min-height: 96px; max-height: 160px; box-sizing: border-box; text-decoration: none; color: inherit; transition: all 0.2s; background: #ffffff; position: relative; overflow: hidden;"><div class="card-actions" style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; transition: opacity 0.2s; z-index: 10;"><button class="card-edit-btn" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">编辑</button><button class="card-delete-btn" onclick="event.stopPropagation(); window.deleteLinkCard('${cardId}');" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">删除</button></div><div class="card-content" onclick="window.open('${linkData.url}', '_blank')" style="display: flex; gap: 16px; cursor: pointer; height: 100%;">${cardImage ? `<div style="width: 96px; height: 96px; flex-shrink: 0; overflow: hidden; border-radius: 4px;"><img src="${cardImage}" alt="${cardTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" /></div>` : ''}<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;"><div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cardTitle}</div>${cardDescription ? `<div style="font-size: 14px; color: #6b7280; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">${cardDescription}</div>` : ''}<div style="font-size: 12px; color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${linkData.url}</div></div></div></div><p><br></p>`;
      } else {
        // 转换为文本链接
        const linkText = linkData.text || linkData.url;
        newLinkHtml = `<span style="display: inline-block; position: relative;" class="link-wrapper"><a href="${linkData.url}" target="_blank" rel="noopener noreferrer" style="color: #4361ee; text-decoration: underline; display: inline;" data-link-text="${linkText}">${linkText}</a><span class="link-edit-icon" contenteditable="false" unselectable="on" data-ignore-count="true" style="position: absolute; right: -18px; top: 0; cursor: pointer; opacity: 0; transition: opacity 0.2s; font-size: inherit; display: inline-block; white-space: nowrap; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; pointer-events: auto; width: 0; overflow: visible;">✏️</span></span>`;
      }
      
      // 创建临时容器
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newLinkHtml;
      const newElement = tempDiv.firstChild as HTMLElement;
      
      // 替换元素
      editingLink.parentNode?.replaceChild(newElement, editingLink);
      
    } else if (isCard) {
      // 更新卡片链接
      const cardTitle = linkData.title || linkData.text || linkData.url;
      const cardDescription = linkData.description || '';
      const cardImage = linkData.image || '';
      
      editingLink.setAttribute('data-url', linkData.url);
      editingLink.setAttribute('data-title', cardTitle);
      editingLink.setAttribute('data-description', cardDescription);
      editingLink.setAttribute('data-image', cardImage);
      
      // 更新卡片容器样式
      const cardElement = editingLink as HTMLElement;
      cardElement.style.minHeight = '96px';
      cardElement.style.maxHeight = '160px';
      cardElement.style.overflow = 'hidden';
      
      // 更新卡片内容显示
      const cardContent = editingLink.querySelector('.card-content');
      if (cardContent) {
        const cardContentElement = cardContent as HTMLElement;
        cardContentElement.setAttribute('onclick', `window.open('${linkData.url}', '_blank')`);
        cardContentElement.style.height = '100%';
        
        // 重新生成卡片内容HTML
        cardContent.innerHTML = `${cardImage ? `<div style="width: 96px; height: 96px; flex-shrink: 0; overflow: hidden; border-radius: 4px;"><img src="${cardImage}" alt="${cardTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" /></div>` : ''}<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;"><div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cardTitle}</div>${cardDescription ? `<div style="font-size: 14px; color: #6b7280; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">${cardDescription}</div>` : ''}<div style="font-size: 12px; color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${linkData.url}</div></div>`;
      }
      
    } else {
      // 更新文本链接
      // 由于链接结构改变，需要替换整个包裹的span元素
      const linkText = linkData.text || linkData.url;
      const newLinkHtml = `<span style="display: inline-block; position: relative;" class="link-wrapper"><a href="${linkData.url}" target="_blank" rel="noopener noreferrer" style="color: #4361ee; text-decoration: underline; display: inline;" data-link-text="${linkText}">${linkText}</a><span class="link-edit-icon" contenteditable="false" unselectable="on" data-ignore-count="true" style="position: absolute; right: -18px; top: 0; cursor: pointer; opacity: 0; transition: opacity 0.2s; font-size: inherit; display: inline-block; white-space: nowrap; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; pointer-events: auto; width: 0; overflow: visible;">✏️</span></span>`;
      
      // 创建临时容器
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newLinkHtml;
      const newElement = tempDiv.firstChild as HTMLElement;
      
      // 找到包裹的span元素（如果存在）
      const wrapperSpan = editingLink.parentElement;
      if (wrapperSpan && wrapperSpan.tagName === 'SPAN' && wrapperSpan.style.display === 'inline-block') {
        // 替换整个包裹的span
        wrapperSpan.parentNode?.replaceChild(newElement, wrapperSpan);
      } else {
        // 如果没有包裹的span（旧版本链接），直接替换a标签
        editingLink.parentNode?.replaceChild(newElement, editingLink);
      }
    }
    
    // 更新内容
    handleContentChange(editor.innerHTML);
    
    // 清空编辑状态
    setEditingLink(null);
    setLinkEditData(null);
    
    toast({
      title: '链接更新成功',
      description: '链接已成功更新',
    });
  }, [editingLink, handleContentChange, toast]);

  const handleInsertAttachment = useCallback((data: AttachmentData) => {
    restoreSelection();
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    const id = `attach-${Date.now()}`;
    const iconName = data.type === 'archive' ? '压缩' : (data.type === 'program' ? '程序' : '其它');
    const dataStr = JSON.stringify(data);
    
    const html = `
      <div class="attachment-wrapper" 
           id="${id}" 
           contenteditable="false" 
           data-attachment='${dataStr.replace(/'/g, "&apos;")}'
           style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; margin: 16px 0; user-select: none; transition: all 0.2s ease-in-out; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div class="attachment-content" style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; cursor: pointer;" onclick="window.viewAttachment('${id}')">
          <div style="background: ${data.type === 'archive' ? '#4361ee' : (data.type === 'program' ? '#10b981' : '#64748b')}; color: white; padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">${iconName}</div>
          <div class="attachment-file-info" style="display: flex; flex-direction: column; min-width: 0;">
            <span class="attachment-file-name" style="font-size: 14px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.name}</span>
            <span style="font-size: 11px; color: #6b7280; white-space: nowrap;">${data.url.substring(0, 40)}${data.url.length > 40 ? '...' : ''}</span>
          </div>
          ${data.code ? `<div class="attachment-code" style="font-size: 11px; color: #4b5563; background: #f3f4f6; padding: 1px 6px; border-radius: 4px; border: 1px dashed #d1d5db; margin-left: 4px;">码: ${data.code}</div>` : ''}
        </div>
        <div class="attachment-actions" style="display: flex; gap: 6px; margin-left: 12px;">
           <button class="attachment-edit-btn" onclick="event.stopPropagation(); window.editAttachment('${id}')" style="padding: 4px 10px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s;">编辑</button>
           <button class="attachment-delete-btn" onclick="event.stopPropagation(); window.deleteAttachment('${id}')" style="padding: 4px 10px; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s;">删除</button>
        </div>
      </div>
      <p><br></p>
    `;
    
    document.execCommand('insertHTML', false, html);
    handleContentChange(editor.innerHTML);
    
    toast({
      title: '附件已插入',
      description: `已成功插入附件: ${data.name}`,
    });
  }, [handleContentChange, toast]);

  const handleUpdateAttachment = useCallback((data: AttachmentData) => {
    if (!editingAttachment) return;
    
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    const iconName = data.type === 'archive' ? '压缩' : (data.type === 'program' ? '程序' : '其它');
    const dataStr = JSON.stringify(data);
    
    editingAttachment.setAttribute('data-attachment', dataStr);
    const content = editingAttachment.querySelector('.attachment-content');
    if (content) {
      // 同时更新点击链接
      content.setAttribute('onclick', `window.viewAttachment('${editingAttachment.id}')`);
      content.innerHTML = `
        <div style="background: ${data.type === 'archive' ? '#4361ee' : (data.type === 'program' ? '#10b981' : '#64748b')}; color: white; padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">${iconName}</div>
        <div class="attachment-file-info" style="display: flex; flex-direction: column; min-width: 0;">
          <span class="attachment-file-name" style="font-size: 14px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.name}</span>
          <span style="font-size: 11px; color: #6b7280; white-space: nowrap;">${data.url.substring(0, 40)}${data.url.length > 40 ? '...' : ''}</span>
        </div>
        ${data.code ? `<div class="attachment-code" style="font-size: 11px; color: #4b5563; background: #f3f4f6; padding: 1px 6px; border-radius: 4px; border: 1px dashed #d1d5db; margin-left: 4px;">码: ${data.code}</div>` : ''}
      `;
    }
    
    handleContentChange(editor.innerHTML);
    setEditingAttachment(null);
    setAttachmentEditData(null);
    
    toast({
      title: '附件已更新',
      description: `附件 ${data.name} 已更新`,
    });
  }, [editingAttachment, handleContentChange, toast]);

  const handleInsertCode = useCallback((code: string, language: string, theme?: string) => {
    // 恢复光标位置
    if (editorRef.current?.getElement()) editorRef.current.getElement()!.focus();
    restoreSelection();
    
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    // 使用传入的主题，或设置中的全局主题
    const activeTheme = theme || settings.codeTheme;
    
    // 异步加载作用域化的主题样式
    loadScopedTheme(activeTheme);

    // 转义HTML特殊字符
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // 使用highlight.js进行代码高亮
    let highlightedCode: string;
    try {
      if (language === 'plaintext') {
        highlightedCode = escapeHtml(code);
      } else {
        const result = hljs.highlight(code, { language });
        highlightedCode = result.value;
      }
    } catch (error) {
      // 如果高亮失败，使用纯文本
      highlightedCode = escapeHtml(code);
    }

    // 生成唯一ID
    const codeBlockId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 转义代码用于data属性
    const escapedCode = code.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    // 获取语言显示名称
    const languageLabels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      swift: 'Swift',
      kotlin: 'Kotlin',
      html: 'HTML',
      css: 'CSS',
      sql: 'SQL',
      bash: 'Bash',
      powershell: 'PowerShell',
      vbscript: 'VBScript',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      markdown: 'Markdown',
      plaintext: '纯文本',
    };
    
    const displayLanguage = languageLabels[language] || language;

    // 创建代码块HTML，使用作用域类名隔离主题样式
    const codeHtml = `
      <div class="code-block-wrapper code-theme-${activeTheme}" id="${codeBlockId}" data-code="${escapedCode}" data-language="${language}" data-theme="${activeTheme}" style="margin: 1em 0; border-radius: 8px; overflow: hidden; position: relative;">
        <div class="code-block-header" style="background: rgba(0,0,0,0.05); padding: 8px 16px; color: inherit; font-size: 12px; font-family: 'Courier New', monospace; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
          <span>${displayLanguage}</span>
          <div class="code-block-actions" style="display: flex; gap: 8px;">
            <button class="code-edit-btn" onclick="event.stopPropagation(); window.editCodeBlock('${codeBlockId}');" style="padding: 4px 8px; background: #4361ee; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; transition: background 0.2s;" onmouseover="this.style.background='#3f37c9'" onmouseout="this.style.background='#4361ee'">编辑</button>
            <button class="code-delete-btn" onclick="event.stopPropagation(); window.deleteCodeBlock('${codeBlockId}');" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">删除</button>
            <button class="code-copy-btn" onclick="event.stopPropagation(); window.copyCodeBlock('${codeBlockId}', this);" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">复制</button>
          </div>
        </div>
        <pre style="margin: 0; padding: 16px; overflow-x: auto; background: inherit;"><code class="hljs language-${language}" style="font-family: 'Courier New', Consolas, monospace; font-size: 14px; line-height: 1.5; display: block;">${highlightedCode}</code></pre>
      </div>
      <p><br></p>
    `;
    
    // 插入代码块
    document.execCommand('insertHTML', false, codeHtml);
    
    // 更新内容
    handleContentChange(editor.innerHTML);

    toast({
      title: '代码已插入',
      description: `已成功插入 ${displayLanguage} 代码块块（主题: ${activeTheme}）`
    });
  }, [handleContentChange, settings.codeTheme]);

  const handleUpdateCode = useCallback((id: string, code: string, language: string, theme: string) => {
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    const codeBlock = editor.querySelector(`#${id}`);
    if (!codeBlock) {
      toast({
        title: '错误',
        description: '找不到要更新的代码块',
        variant: 'destructive',
      });
      return;
    }

    // 转义HTML特殊字符
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // 使用highlight.js进行代码高亮
    let highlightedCode: string;
    try {
      if (language === 'plaintext') {
        highlightedCode = escapeHtml(code);
      } else {
        const result = hljs.highlight(code, { language });
        highlightedCode = result.value;
      }
    } catch (error) {
      highlightedCode = escapeHtml(code);
    }

    const escapedCode = code.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    // 获取语言显示名称
    const languageLabels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      swift: 'Swift',
      kotlin: 'Kotlin',
      html: 'HTML',
      css: 'CSS',
      sql: 'SQL',
      bash: 'Bash',
      powershell: 'PowerShell',
      vbscript: 'VBScript',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      markdown: 'Markdown',
      plaintext: '纯文本',
    };
    
    const displayLanguage = languageLabels[language] || language;

    // 异步加载作用域化的主题样式
    loadScopedTheme(theme);

    // 更新属性
    codeBlock.setAttribute('data-code', escapedCode);
    codeBlock.setAttribute('data-language', language);
    codeBlock.setAttribute('data-theme', theme);
    
    // 更新代码块的主题类名
    if (codeBlock instanceof HTMLElement) {
      // 移除旧的主题类
      codeBlock.className = codeBlock.className.replace(/code-theme-\S+/g, '').trim();
      // 添加新的主题类
      codeBlock.classList.add('code-block-wrapper', `code-theme-${theme}`);
      
      // 清除硬编码样式
      codeBlock.style.background = '';
      codeBlock.style.border = '1px solid rgba(0,0,0,0.1)';
      const header = codeBlock.querySelector('div:first-child') as HTMLElement;
      if (header) {
        header.style.background = 'rgba(0,0,0,0.05)';
        header.style.color = 'inherit';
        header.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
      }
      const preEl = codeBlock.querySelector('pre') as HTMLElement;
      if (preEl) preEl.style.background = 'inherit';
      const codeEl = codeBlock.querySelector('code') as HTMLElement;
      if (codeEl) codeEl.style.color = '';
    }
    
    // 更新语言标签和高亮内容
    const langSpan = codeBlock.querySelector('div:first-child span');
    if (langSpan) langSpan.textContent = displayLanguage;

    // 移除旧的内联 link 标签（如果存在）
    const oldLink = codeBlock.querySelector('link');
    if (oldLink) oldLink.remove();

    const codeElement = codeBlock.querySelector('code');
    if (codeElement) {
      codeElement.className = `hljs language-${language}`;
      codeElement.innerHTML = highlightedCode;
    }

    // 更新内容
    handleContentChange(editor.innerHTML);

    toast({
      title: '成功',
      description: '代码块已更新',
    });
  }, [handleContentChange, toast]);

  // 处理表格操作
  const handleTableAction = useCallback((action: string, data?: any) => {
    if (tableToolbarRef.current) {
      tableToolbarRef.current.handleTableAction(action, data);
    }
  }, []);

  const handleHeadingClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element && mainContentRef.current) {
      // 计算相对于滚动容器的位置
      const container = mainContentRef.current;
      const elementTop = element.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      const scrollPos = container.scrollTop + elementTop - containerTop - (container.clientHeight / 4);
      
      container.scrollTo({
        top: scrollPos,
        behavior: 'smooth'
      });

      // 更新侧边栏高亮
      setActiveHeadingId(id);
      
      // 高亮效果
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = 'hsl(var(--accent))';
      element.style.transition = 'background-color 0.5s ease';
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
      }, 1500);
    }
  }, []);

  // 侧边栏拖拽调整宽度
  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingToc.current = true;
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = tocWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingToc.current) return;
      // 对于左侧侧边栏，鼠标向右移动（clientX增加）应该增加宽度
      const delta = ev.clientX - resizeStartX.current;
      const newWidth = Math.max(150, Math.min(400, resizeStartWidth.current + delta));
      setTocWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingToc.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [tocWidth]);

  const handleAddPage = useCallback((parentId: string | null) => {
    // 自动生成唯一的编号标题，避免重复显示“未命名页面”
    let untitledCount = 1;
    let defaultTitle = '未命名页面';
    while (pages.some(p => p.title === defaultTitle)) {
      untitledCount++;
      defaultTitle = `未命名页面 ${untitledCount}`;
    }
    
    const newPage: PageNode = {
      id: `page-${Date.now()}`,
      title: defaultTitle,
      content: '<p>开始编辑您的文档...</p>',
      parentId,
      order: pages.length,
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    setContent(newPage.content);
    toast({ title: `已新建页面: ${defaultTitle}` });
  }, [pages]);

  const handleDeletePage = useCallback((id: string) => {
    if (pages.length <= 1) {
      toast({ title: '至少需要保留一个页面', variant: 'destructive' });
      return;
    }
    
    setPages(prev => prev.filter(p => p.id !== id && p.parentId !== id));
    if (activePageId === id) {
      const remainingPages = pages.filter(p => p.id !== id);
      const firstPage = remainingPages[0];
      setActivePageId(firstPage.id);
      setContent(firstPage.content);
    }
    toast({ title: '页面已删除' });
  }, [pages, activePageId]);

  const handleRenamePage = useCallback((id: string, newTitle: string) => {
    const finalTitle = newTitle.trim() || '未命名页面';
    setPages(prev => prev.map(p => p.id === id ? { ...p, title: finalTitle } : p));
  }, []);


  const handleUpdatePageColor = useCallback((id: string, color: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, titleColor: color } : p));
  }, []);
  /**
   * 拖拽移动节点
   * position:
   *   'before' → 插入到 targetId 同级的前面
   *   'after'  → 插入到 targetId 同级的后面
   *   'child'  → 成为 targetId 的子节点（追加到末尾）
   */
  const handleMovePage = useCallback((dragId: string, targetId: string, position: 'before' | 'after' | 'child') => {
    setPages(prev => {
      const drag = prev.find(p => p.id === dragId);
      const target = prev.find(p => p.id === targetId);
      if (!drag || !target) return prev;

      let newPages = prev.map(p => ({ ...p }));

      if (position === 'child') {
        // 成为 target 的子节点，追加到其子节点末尾
        const siblings = newPages.filter(p => p.parentId === targetId).sort((a, b) => a.order - b.order);
        const maxOrder = siblings.length > 0 ? siblings[siblings.length - 1].order : -1;
        newPages = newPages.map(p =>
          p.id === dragId ? { ...p, parentId: targetId, order: maxOrder + 1 } : p
        );
      } else {
        // before / after：插入到 target 的同级
        const newParentId = target.parentId;
        let siblings = newPages
          .filter(p => p.parentId === newParentId && p.id !== dragId)
          .sort((a, b) => a.order - b.order);

        const targetIndex = siblings.findIndex(p => p.id === targetId);
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        // 把被拖节点插入到正确位置
        const dragNode = { ...drag, parentId: newParentId };
        siblings.splice(insertIndex, 0, dragNode);

        // 重新分配 order（整数递增，稳定）
        const reordered = siblings.map((p, i) => ({ ...p, order: i }));
        const reorderedIds = new Set(reordered.map(p => p.id));
        newPages = [
          ...newPages.filter(p => !reorderedIds.has(p.id)),
          ...reordered,
        ];
      }

      return newPages;
    });
  }, []);

  const handlePageClick = useCallback((id: string) => {
    if (id === activePageId) return;
    
    const nextPage = pages.find(p => p.id === id);
    if (nextPage) {
      setContent(nextPage.content);
      setActivePageId(id);
      // 同时清空历史记录，或者为新文档建立独立历史
      setHistory([nextPage.content]);
      setHistoryIndex(0);
    }
  }, [activePageId, pages]);

    const handleExport = useCallback(() => {
    console.log('=== 开始导出 (多页面) ===');
    
    const useBlackMask = settings.useBlackMask;
    const sidebarBackgroundColor = settings.sidebarBackgroundColor;
    const sidebarTextColor = settings.sidebarTextColor;

    // 处理所有页面内容
    const processedPages = pages.map(page => {
      const pageDiv = document.createElement('div');
      // 使用当前 content 状态代替 pages 数组中的内容 (如果是当前活跃页)
      const pageContent = page.id === activePageId ? content : page.content;
      pageDiv.innerHTML = pageContent;
      
      // 提取页面内部标题用于锚点（可选，暂时不加，保持简单）
      
      // 移除各种按钮
      pageDiv.querySelectorAll('.card-actions, .link-edit-icon, .code-delete-btn, .code-edit-btn, .attachment-edit-btn, .attachment-delete-btn')
        .forEach(el => el.remove());
      
      // 处理表格
      pageDiv.querySelectorAll('td, th').forEach(cell => {
        const cellElement = cell as HTMLTableCellElement;
        cellElement.removeAttribute('contenteditable');
        if (cellElement.style.cursor === 'text') cellElement.style.cursor = 'default';
      });
      
      pageDiv.querySelectorAll('table').forEach(table => {
        const tableElement = table as HTMLTableElement;
        if (!tableElement.style.width || tableElement.style.width === '100%') {
          tableElement.style.width = 'auto';
          tableElement.style.minWidth = '300px';
          tableElement.style.maxWidth = '100%';
          tableElement.style.margin = '1.5em auto';
        }
      });

      return {
        id: page.id,
        title: page.title,
        titleColor: page.titleColor,
        html: pageDiv.innerHTML
      };
    });

    // 导出时：默认显示第一个根节点页面
    const rootPages = pages
      .filter(p => p.parentId === null)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const defaultPageId = rootPages.length > 0 ? rootPages[0].id : (pages.length > 0 ? pages[0].id : '');

    // 递归构建侧边栏（子项默认折叠）
    const buildSidebarTree = (nodes: PageNode[], parentId: string | null = null, depth = 0): string => {
      return nodes
        .filter(node => node.parentId === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(node => {
          const hasChildren = nodes.some(n => n.parentId === node.id);
          // 子项容器默认隐藏；根节点如果是默认页面则展开其一级子项
          const childHtml = hasChildren
            ? `<div class="sidebar-sub-items" style="display:none">${buildSidebarTree(nodes, node.id, depth + 1)}</div>`
            : '';
          return `
            <div class="sidebar-item-group">
              <a href="#page-${node.id}" class="sidebar-item ${node.id === defaultPageId ? 'active' : ''} level-${depth}" data-id="page-${node.id}" onclick="onSidebarItemClick(event,'page-${node.id}')">
                <span class="toggle-arrow${hasChildren ? '' : ' invisible'}">${hasChildren ? '▶' : ''}</span>
                <span class="file-icon">${hasChildren ? '📁' : '📄'}</span>
                <span class="title" style="color: ${node.titleColor || settings.pageTitleColor}">${node.title}</span>
              </a>
              ${childHtml}
            </div>
          `;
        })
        .join('');
    };

    const sidebarHtml = buildSidebarTree(pages);

    const mainContentHtml = processedPages.map(page => `
      <div id="page-${page.id}" class="page-content-wrapper" style="display: ${page.id === defaultPageId ? 'block' : 'none'}">
        <style>
          #page-${page.id} h1, #page-${page.id} h2, #page-${page.id} h3, #page-${page.id} h4, #page-${page.id} h5, #page-${page.id} h6 {
            color: ${page.titleColor || (settings.pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee'))};
          }
        </style>
        <div class="page-title-header" style="margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
          <h1 style="border: none; margin: 0; padding: 0; color: ${page.titleColor || settings.pageTitleColor}">${page.title}</h1>
        </div>
        ${page.html}
      </div>
    `).join('');
    
    // 获取所有已加载的作用域样式
    const scopedStyles = Array.from(document.querySelectorAll('style[id^="scoped-hljs-theme-"]'))
      .map(s => s.textContent)
      .join('\n');
    
    const backgroundColor = useBlackMask 
      ? `rgba(0, 0, 0, ${settings.opacity / 100})`
      : `rgba(255, 255, 255, ${settings.opacity / 100})`;
    
    const textColor = useBlackMask ? '#ffffff' : '#333';
    const headingColor = settings.pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee');
    const linkColor = useBlackMask ? '#60a5fa' : '#4361ee';
    const linkHoverColor = useBlackMask ? '#93c5fd' : '#3f37c9';
    const borderColor = useBlackMask ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="referrer" content="no-referrer">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.pageTitle}</title>
  ${settings.favicon ? `<link rel="icon" href="${settings.favicon}">` : ''}
  <style>
    ${scopedStyles}
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: ${headingColor};
      text-balance: balance;
    }
    
    .main-container {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      min-width: 0;
      scroll-behavior: smooth;
      background: ${settings.backgroundImage 
        ? `url(${settings.backgroundImage})` 
        : 'linear-gradient(135deg, #fcfcff 0%, #f7f7fa 100%)'};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
    }

    .container {
      width: 100%;
      padding: 40px 60px;
      position: relative;
    }
    
    .content {
      background: ${settings.enableGlassEffect ? 'rgba(255, 255, 255, 0.05)' : backgroundColor};
      backdrop-filter: ${settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : (settings.opacity < 100 ? 'blur(8px)' : 'none')};
      -webkit-backdrop-filter: ${settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : (settings.opacity < 100 ? 'blur(8px)' : 'none')};
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      min-height: 100%;
      text-pretty: pretty;
      max-width: 1200px; /* 导出时内容区域还是保持一个合适的阅读宽度，但容器贴合侧边栏 */
    }

    h1 { 
      font-size: 2.25em; 
      margin-top: 0.5em;
      margin-bottom: 0.75em;
      font-weight: 800;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.3em;
    }
    h2 { 
      font-size: 1.75em; 
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      border-left: 5px solid ${headingColor};
      padding-left: 15px;
    }
    h3 { 
      font-size: 1.4em; 
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    h4 { 
      font-size: 1.2em; 
      margin-top: 0.8em;
      margin-bottom: 0.5em;
      font-weight: 600;
      color: #475569;
    }
    h5 { 
      font-size: 0.83em; 
      margin-top: 0.9em;
      margin-bottom: 0.9em;
    }
    h6 { 
      font-size: 0.67em; 
      margin-top: 1em;
      margin-bottom: 1em;
    }
    
    p {
      margin-bottom: 1em;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    a {
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-all;
    }
    
    hr {
      border: none;
      border-top: 2px solid ${useBlackMask ? 'rgba(96, 165, 250, 0.4)' : 'rgba(67, 97, 238, 0.3)'};
      margin: 1.8em 0;
      max-width: 100%;
      height: 0;
      box-sizing: content-box;
    }
    
    table {
      max-width: 100%;
      width: 100% !important;
      border-collapse: collapse;
      margin: 1em 0;
      display: block;
      overflow-x: auto;
      word-break: normal;
    }
    
    pre {
      max-width: 100%;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1em 0;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    img:hover {
      transform: scale(1.02);
    }
    
    /* 卡片图片样式优先级更高，覆盖全局img样式 */
    .link-card .card-content > div:first-child img {
      max-width: 100% !important;
      max-height: 100% !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      border-radius: 0 !important;
      transform: none !important;
    }
    
    .link-card .card-content > div:first-child img:hover {
      transform: none !important;
    }
    
    /* 图片查看器样式 */
    .image-viewer {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      justify-content: center;
      align-items: center;
    }
    
    .image-viewer.active {
      display: flex;
    }

    /* 代码块滚动条美化 */
    .code-block-wrapper pre {
      scrollbar-width: thin;
      scrollbar-color: rgba(128, 128, 128, 0.3) transparent;
    }

    .code-block-wrapper pre::-webkit-scrollbar {
      height: 8px;
    }
    
    .code-block-wrapper pre::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .code-block-wrapper pre::-webkit-scrollbar-thumb {
      background: rgba(128, 128, 128, 0.3);
      border-radius: 10px;
    }
    
    .code-block-wrapper pre::-webkit-scrollbar-thumb:hover {
      background: rgba(128, 128, 128, 0.5);
    }
    
    .image-viewer img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      cursor: default;
      margin: 0;
    }
    
    .image-viewer-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid white;
      border-radius: 50%;
      color: white;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    
    .image-viewer-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .image-viewer-controls {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      background: rgba(0, 0, 0, 0.5);
      padding: 10px 20px;
      border-radius: 25px;
    }
    
    .image-viewer-btn {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid white;
      border-radius: 50%;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    
    .image-viewer-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .attachment-wrapper:hover {
      border-color: #4361ee !important;
      box-shadow: 0 2px 10px rgba(67, 97, 238, 0.1);
    }
    
    #attachmentDialog {
      display: none;
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      justify-content: center; align-items: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    #attachmentDialog.active { display: flex; }
    .attach-modal {
      background: white; border-radius: 12px; padding: 24px;
      width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .attach-modal h3 { margin-top: 0; margin-bottom: 8px; font-size: 18px; color: #1f2937; }
    .attach-modal p { color: #6b7280; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
    .code-box {
      background: #f3f4f6; border-radius: 8px; padding: 12px;
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
      border: 1px solid #e5e7eb;
    }
    .code-box input {
      flex: 1; border: none; background: transparent; font-family: monospace;
      font-size: 20px; text-align: center; font-weight: bold; color: #111827;
      letter-spacing: 2px; outline: none;
    }
    .btn-group { display: flex; gap: 12px; }
    .btn {
      flex: 1; padding: 12px; border-radius: 8px; border: none;
      cursor: pointer; font-weight: 600; font-size: 14px;
      transition: all 0.2s;
    }
    .btn-close { background: #f3f4f6; color: #374151; }
    .btn-close:hover { background: #e5e7eb; }
    .btn-open { background: #4361ee; color: white; }
    .btn-open:hover { background: #3b82f6; }
    
    .scroll-buttons {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
    }
    
    .scroll-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid #e2e8f0;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }
    
    .scroll-btn:hover {
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      color: #4361ee;
    }
    
    .scroll-btn svg {
      width: 20px;
      height: 20px;
    }

    /* 原文链接按钮：复用 scroll-btn 圆形样式，叠加链接色 */
    a.source-link-btn {
      color: #2B579A;
      text-decoration: none;
    }

    a.source-link-btn:hover {
      color: #1e40af;
      background: #eff6ff;
      border-color: #2B579A;
    }
    
    a {
      color: ${linkColor};
      text-decoration: none;
    }
    
    a:hover {
      color: ${linkHoverColor};
      text-decoration: underline;
    }
    
    ul, ol {
      margin-left: 2em;
      margin-bottom: 1em;
    }
    
    /* 代码块样式 */
    .code-block-wrapper {
      margin: 1em 0;
      border-radius: 8px;
      overflow: hidden;
      
      border: 1px solid rgba(0,0,0,0.1);
      position: relative;
    }
    
    .code-block-wrapper > div:first-child {
      background: rgba(0,0,0,0.05);
      padding: 8px 16px;
      color: inherit;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .code-block-wrapper pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      background: inherit;
      /* 滚动条美化 */
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
    }

    .code-block-wrapper pre::-webkit-scrollbar {
      height: 8px;
    }
    
    .code-block-wrapper pre::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .code-block-wrapper pre::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 10px;
    }
    
    .code-block-wrapper pre::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.25);
    }
    
    .code-block-wrapper code {
      font-family: 'Courier New', Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
      
      display: block;
    }
    
    .code-copy-btn {
      padding: 4px 8px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      transition: background 0.2s;
    }
    
    .code-copy-btn:hover {
      background: #2563eb;
    }
    
    /* Highlight.js 代码高亮样式 (Atom One Dark) */
    .hljs {
      color: #abb2bf;
      background: #282c34;
    }
    .hljs-comment, .hljs-quote {
      color: #5c6370;
      font-style: italic;
    }
    .hljs-doctag, .hljs-keyword, .hljs-formula {
      color: #c678dd;
    }
    .hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst {
      color: #e06c75;
    }
    .hljs-literal {
      color: #56b6c2;
    }
    .hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string {
      color: #98c379;
    }
    .hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-number {
      color: #d19a66;
    }
    .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title {
      color: #61aeee;
    }
    .hljs-built_in, .hljs-title.class_, .hljs-class .hljs-title {
      color: #e6c07b;
    }
    .hljs-emphasis {
      font-style: italic;
    }
    .hljs-strong {
      font-weight: bold;
    }
    .hljs-link {
      text-decoration: underline;
    }
    
    /* 表格样式 */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 0.8em 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* 默认表格样式（实线边框） */
    table:not([style*="border-style: dashed"]):not([style*="border-style: dotted"]):not([style*="border-style: double"]) {
      background: white !important;
      opacity: 1 !important;
    }
    
    table td, table th {
      border: none;
      padding: 10px 12px;
      min-width: 80px;
      text-align: left;
      color: #333;
    }
    
    /* 确保表格中的链接可以正常点击 */
    table td a, table th a {
      pointer-events: auto;
      cursor: pointer;
      position: relative;
      z-index: 1;
    }
    
    table td, table th {
      cursor: default;
    }
    
    /* 默认单元格样式（实线边框表格） */
    table:not([style*="border-style: dashed"]):not([style*="border-style: dotted"]):not([style*="border-style: double"]) td {
      background: white !important;
    }
    
    table:not([style*="border-style: dashed"]):not([style*="border-style: dotted"]):not([style*="border-style: double"]) th {
      background: #4361ee !important;
      color: white !important;
      font-weight: 600;
    }
    
    table:not([style*="border-style: dashed"]):not([style*="border-style: dotted"]):not([style*="border-style: double"]) tr:nth-child(even) td {
      background: #f8f9fa !important;
    }
    
    table:not([style*="border-style: dashed"]):not([style*="border-style: dotted"]):not([style*="border-style: double"]) tr:hover td {
      background: #e8f0fe !important;
    }
    
    /* 虚线/点线/双线边框表格样式 - 使用和遮罩层一致的背景色和透明度 */
    table[style*="border-style: dashed"],
    table[style*="border-style: dotted"],
    table[style*="border-style: double"] {
      background: ${backgroundColor} !important;
    }
    
    table[style*="border-style: dashed"] td,
    table[style*="border-style: dashed"] th,
    table[style*="border-style: dotted"] td,
    table[style*="border-style: dotted"] th,
    table[style*="border-style: double"] td,
    table[style*="border-style: double"] th {
      background: ${backgroundColor} !important;
      color: ${textColor} !important;
    }
    
    /* 固定侧边栏布局 */
    body {
      display: flex;
      flex-direction: row;
      height: 100vh;
      overflow: hidden;
      margin: 0;
      padding: 0;
      background: ${settings.backgroundImage 
        ? `url(${settings.backgroundImage})` 
        : 'linear-gradient(135deg, #fcfcff 0%, #f7f7fa 100%)'};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    
    .main-container {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      min-width: 0;
      scroll-behavior: smooth;
      background: transparent;
    }
    
    .flex-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      width: 100%;
      background: transparent;
    }

    :root {
      --sidebar-initial-width: ${tocWidth}px;
    }

    .sidebar {
      width: var(--sidebar-initial-width);
      height: 100vh;
      background: ${settings.enableGlassEffect ? 'transparent' : sidebarBackgroundColor};
      backdrop-filter: ${settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : 'none'};
      -webkit-backdrop-filter: ${settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : 'none'};
      border-right: 1px solid ${borderColor};
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      z-index: 100;
      box-shadow: 4px 0 15px rgba(0,0,0,0.03);
    }
    
    .sidebar-header {
      padding: 12px 16px;
      background: transparent;
      border-bottom: 1px solid ${borderColor};
      border-top: 1px solid ${borderColor};
      font-weight: 700;
      font-size: 13px;
      color: ${sidebarTextColor};
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      letter-spacing: 0.025em;
    }

    .search-container {
      height: 56px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      background: transparent;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-input {
      width: 100%;
      padding: 6px 12px 6px 32px;
      font-size: 12px;
      border: 1px solid ${borderColor};
      border-radius: 6px;
      outline: none;
      transition: all 0.2s;
      background: ${useBlackMask ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)'};
      color: ${sidebarTextColor};
    }

    .search-input:focus {
      border-color: ${headingColor};
      background: ${useBlackMask ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'};
    }

    .search-icon {
      position: absolute;
      left: 10px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-result-highlight {
      background-color: #fef08a;
      color: #000;
      padding: 0 2px;
      border-radius: 2px;
    }
    
    .sidebar-content {
      flex: 1;
      overflow: scroll;
      padding: 0;
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
    
    .sidebar-content::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    
    .sidebar-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .sidebar-content::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .sidebar-placeholder {
      height: 24px;
      flex-shrink: 0;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 9px 8px;
      color: ${useBlackMask ? '#9ca3af' : '#475569'};
      text-decoration: none;
      font-size: 14px;
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    
    .sidebar-item:hover {
      background: ${useBlackMask ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
      color: ${headingColor};
      text-decoration: none;
    }
    
    .sidebar-item.active {
      background: ${useBlackMask ? 'rgba(96, 165, 250, 0.1)' : '#eff6ff'};
      color: ${useBlackMask ? '#60a5fa' : '#1e40af'};
      border-left-color: ${headingColor};
      font-weight: 500;
    }

    .toggle-arrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      font-size: 10px;
      color: #94a3b8;
      flex-shrink: 0;
      cursor: pointer;
      user-select: none;
    }

    .toggle-arrow.invisible {
      visibility: hidden;
    }

    .file-icon {
      flex-shrink: 0;
      margin-left: 2px;
      font-size: 14px;
      opacity: 0.85;
      line-height: 1;
    }

    .sidebar-item .title {
      /* 不设 flex:1（flex-basis:0 会让标题对 max-content 宽度贡献 0px，导致滚动条永远不出现） */
      /* 以 flex-basis:auto 自然撑开，配合父级 white-space:nowrap 使长标题触发横向滚动条 */
      flex-shrink: 0;
      margin-left: 4px;
      margin-right: 4px;
    }
    
    .level-0 { padding-left: 12px; font-weight: 600; }
    .level-1 { padding-left: 27px; }
    .level-2 { padding-left: 42px; }
    .level-3 { padding-left: 57px; }
    .level-4 { padding-left: 72px; }
    .level-5 { padding-left: 87px; }
    .level-6 { padding-left: 102px; }

    .sidebar-sub-items {
      display: none;
    }

    /* 侧边栏拖拽调整宽度的分割条 */
    .sidebar-resizer {
      width: 5px;
      height: 100vh;
      background: transparent;
      cursor: col-resize;
      flex-shrink: 0;
      position: relative;
      transition: background 0.15s;
      z-index: 200;
    }

    .sidebar-resizer:hover,
    .sidebar-resizer.dragging {
      background: #2B579A40;
    }

    .sidebar-resizer::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 3px;
      height: 40px;
      border-radius: 2px;
      background: #cbd5e1;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .sidebar-resizer:hover::after,
    .sidebar-resizer.dragging::after {
      opacity: 1;
    }

    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        height: auto;
        max-height: 40vh;
        border-right: none;
        border-top: 1px solid #e2e8f0;
        order: 2;
      }
      .main-container {
        order: 1;
      }
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      position: relative;
    }
    
    .content {
      background: ${settings.enableGlassEffect ? 'transparent' : backgroundColor};
      backdrop-filter: ${settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : 'none'};
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      min-height: 100%;
    }

    /* 链接卡片样式 */
    .link-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      display: block;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      background: #ffffff;
      position: relative;
      min-height: 96px;
      max-height: 160px;
      overflow: hidden;
    }
    
    .link-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      border-color: #4361ee;
    }
    
    .link-card .card-content {
      display: flex;
      gap: 16px;
      cursor: pointer;
      height: 100%;
    }
    
    .link-card .card-content > div:first-child {
      width: 96px;
      height: 96px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 4px;
    }
    
    .link-card .card-content > div:first-child img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    
    .link-card .card-content > div:last-child {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      ${settings.enableMobileAdaptation ? `
      body {
        ${settings.mobileBackgroundImage 
          ? `background-image: url(${settings.mobileBackgroundImage}) !important;` 
          : ''}
        background-position: center !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
        padding: 10px;
      }
      
      .container {
        padding: 15px;
        border-radius: 4px;
        min-height: calc(100vh - 20px);
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      
      h1 { font-size: 1.8em; border-bottom: none; margin-top: 0.5em; }
      h2 { font-size: 1.5em; border-left-width: 4px; padding-left: 10px; }
      h3 { font-size: 1.3em; }
      h4 { font-size: 1.1em; }
      h5 { font-size: 0.9em; }
      h6 { font-size: 0.85em; }
      ` : ''}
      
      .link-card .card-content {
        flex-direction: column;
        height: auto !important;
      }
      
      .link-card .card-content > div:first-child {
        width: 100%;
        height: 200px;
        flex-shrink: 0;
      }
      
      .link-card .card-content > div:last-child {
        width: 100%;
        padding-top: 12px;
      }
      
      .link-card {
        max-height: none !important;
        height: auto !important;
      }
      
      .link-card .card-content > div:last-child div {
        white-space: normal !important;
        word-break: break-all !important;
      }
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${settings.codeTheme}.min.css">
</head>
<body>
  <div class="flex-layout">
    <div class="sidebar">
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" class="search-input" id="searchInput" placeholder="搜索目录...">
        </div>
      </div>
      <div class="sidebar-placeholder"></div>
      <div class="sidebar-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${headingColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span style="color: ${headingColor}">子页面标题</span>
        </div>
      </div>
      <div class="sidebar-content">
        <div style="min-width: max-content; min-height: 100%;">
          ${sidebarHtml}
        </div>
      </div>
    </div>

    <div class="sidebar-resizer" id="sidebarResizer"></div>
    
    <div id="mainContainer" class="main-container">
      <div class="container">
        <div id="contentArea" class="content">
          ${mainContentHtml}
        </div>
      </div>
    </div>
  </div>
  
  <!-- 图片查看器 -->
  <div class="image-viewer" id="imageViewer">
    <button class="image-viewer-close" onclick="closeImageViewer()">✕</button>
    <img id="viewerImage" src="" alt="">
    <div class="image-viewer-controls">
      <button class="image-viewer-btn" onclick="zoomOut()" title="缩小">−</button>
      <button class="image-viewer-btn" onclick="resetZoom()" title="重置">⟲</button>
      <button class="image-viewer-btn" onclick="zoomIn()" title="放大">+</button>
    </div>
  </div>
  
  <!-- 附件提取码弹窗 -->
  <div id="attachmentDialog">
    <div class="attach-modal">
      <h3>提取码提示</h3>
      <p id="attachFileName"></p>
      <div class="code-box">
        <input type="text" id="attachCodeInput" readonly>
        <button onclick="copyAttachCode()" style="background:none;border:none;cursor:pointer;padding:8px;color:#6b7280;display:flex;align-items:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div class="btn-group">
        <button class="btn btn-close" onclick="closeAttachDialog()">关闭</button>
        <button class="btn btn-open" id="attachOpenBtn">复制并打开链接</button>
      </div>
    </div>
  </div>
  
  ${(settings.enableScrollButtons || (settings.enableSourceLink && settings.sourceUrl)) ? `
  <div class="scroll-buttons">
    ${settings.enableSourceLink && settings.sourceUrl ? `
    <a href="${settings.sourceUrl}" target="_blank" rel="noopener noreferrer" class="scroll-btn source-link-btn" title="查看原文">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    </a>
    ` : ''}
    ${settings.enableScrollButtons ? `
    <button class="scroll-btn" onclick="document.getElementById('mainContainer').scrollTo({top: 0, behavior: 'smooth'})" title="回到顶部">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    </button>
    <button class="scroll-btn" onclick="(function(){var mc=document.getElementById('mainContainer');mc.scrollTo({top:mc.scrollHeight,behavior:'smooth'});})()" title="跳到底部">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    ` : ''}
  </div>
  ` : ''}
  
  <script>
    // 附件查看功能
    function viewAttachment(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const dataStr = el.getAttribute('data-attachment');
      const data = JSON.parse(dataStr);
      if (data.code) {
        document.getElementById('attachFileName').innerText = '附件 ' + data.name + ' 需要提取码。';
        document.getElementById('attachCodeInput').value = data.code;
        document.getElementById('attachmentDialog').classList.add('active');
        document.getElementById('attachOpenBtn').onclick = function() {
          copyAttachCode();
          window.open(data.url, '_blank');
          closeAttachDialog();
        };
      } else {
        window.open(data.url, '_blank');
      }
    }
    
    function closeAttachDialog() {
      document.getElementById('attachmentDialog').classList.remove('active');
    }
    
    function copyAttachCode() {
      const input = document.getElementById('attachCodeInput');
      input.select();
      document.execCommand('copy');
      // 可以选择是否 alert，在离线环境下 alert 比较保险
      alert('提取码已复制');
    }

    // 图片查看器功能
    let currentScale = 1;
    const scaleStep = 0.2;
    const minScale = 0.5;
    const maxScale = 3;
    
    // 为所有图片添加点击事件
    document.addEventListener('DOMContentLoaded', function() {
      const images = document.querySelectorAll('.content img');
      images.forEach(img => {
        img.addEventListener('click', function() {
          openImageViewer(this.src);
        });
      });
    });
    
    function openImageViewer(src) {
      const viewer = document.getElementById('imageViewer');
      const viewerImage = document.getElementById('viewerImage');
      if (viewer && viewerImage) {
        viewerImage.src = src;
        viewer.classList.add('active');
        currentScale = 1;
        updateImageScale();
        document.body.style.overflow = 'hidden';
      }
    }
    
    function closeImageViewer() {
      const viewer = document.getElementById('imageViewer');
      if (viewer) {
        viewer.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
    
    function zoomIn() {
      if (currentScale < maxScale) {
        currentScale += scaleStep;
        updateImageScale();
      }
    }
    
    function zoomOut() {
      if (currentScale > minScale) {
        currentScale -= scaleStep;
        updateImageScale();
      }
    }
    
    function resetZoom() {
      currentScale = 1;
      updateImageScale();
    }
    
    function updateImageScale() {
      const viewerImage = document.getElementById('viewerImage');
      if (viewerImage) {
        viewerImage.style.transform = 'scale(' + currentScale + ')';
      }
    }
    
    // 点击背景关闭查看器
    document.getElementById('imageViewer')?.addEventListener('click', function(e) {
      if (e.target === this) {
        closeImageViewer();
      }
    });
    
    // ESC键关闭查看器
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeImageViewer();
      }
    });
    
    // 展开指定页面的所有祖先 sub-items
    function expandAncestors(pageId) {
      const anchor = document.querySelector('a.sidebar-item[data-id="' + pageId + '"]');
      if (!anchor) return;
      let el = anchor.parentElement; // .sidebar-item-group
      while (el) {
        if (el.classList && el.classList.contains('sidebar-sub-items')) {
          el.style.display = 'block';
          // 更新父级箭头状态
          const parentGroup = el.parentElement;
          if (parentGroup) {
            const parentAnchor = parentGroup.querySelector('a.sidebar-item');
            if (parentAnchor) {
              const arrow = parentAnchor.querySelector('.toggle-arrow');
              if (arrow && !arrow.classList.contains('invisible')) {
                arrow.textContent = '▼';
                arrow.classList.add('expanded');
              }
            }
          }
        }
        el = el.parentElement;
      }
    }

    // ── 折叠状态 localStorage 工具 ──────────────────────────────
    // key 包含文档标题，避免不同导出文件互相覆盖
    const COLLAPSE_KEY = 'sidebar-collapse:' + document.title;

    function saveCollapseState() {
      const expanded = [];
      document.querySelectorAll('.sidebar-sub-items').forEach(function(el) {
        if (el.style.display !== 'none') {
          // 找到对应的父级 anchor 的 data-id
          const group = el.parentElement;
          if (group) {
            const anchor = group.querySelector(':scope > a.sidebar-item');
            if (anchor && anchor.getAttribute('data-id')) {
              expanded.push(anchor.getAttribute('data-id'));
            }
          }
        }
      });
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(expanded)); } catch(e) {}
    }

    function restoreCollapseState() {
      let expanded = [];
      try { expanded = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '[]'); } catch(e) {}
      if (!Array.isArray(expanded) || expanded.length === 0) return;
      expanded.forEach(function(pageId) {
        const anchor = document.querySelector('a.sidebar-item[data-id="' + pageId + '"]');
        if (!anchor) return;
        const group = anchor.parentElement;
        if (!group) return;
        for (let i = 0; i < group.children.length; i++) {
          if (group.children[i].classList.contains('sidebar-sub-items')) {
            group.children[i].style.display = 'block';
            break;
          }
        }
        const arrow = anchor.querySelector('.toggle-arrow');
        if (arrow && !arrow.classList.contains('invisible')) {
          arrow.textContent = '▼';
          arrow.classList.add('expanded');
        }
      });
    }

    // 切换子项展开/折叠
    function toggleSubItems(pageId) {
      const anchor = document.querySelector('a.sidebar-item[data-id="' + pageId + '"]');
      if (!anchor) return;
      const group = anchor.parentElement;
      let subItems = null;
      for (let i = 0; i < group.children.length; i++) {
        if (group.children[i].classList.contains('sidebar-sub-items')) {
          subItems = group.children[i];
          break;
        }
      }
      const arrow = anchor.querySelector('.toggle-arrow');
      if (subItems) {
        const isExpanded = subItems.style.display !== 'none';
        subItems.style.display = isExpanded ? 'none' : 'block';
        if (arrow && !arrow.classList.contains('invisible')) {
          arrow.textContent = isExpanded ? '▶' : '▼';
          arrow.classList.toggle('expanded', !isExpanded);
        }
        // 折叠/展开后持久化状态
        saveCollapseState();
      }
    }

    // 侧边栏项点击：点箭头=折叠/展开；点标题=导航+展开祖先
    function onSidebarItemClick(event, pageId) {
      if (event.target.classList.contains('toggle-arrow') && !event.target.classList.contains('invisible')) {
        event.preventDefault();
        toggleSubItems(pageId);
        return;
      }
      // 导航时展开祖先节点，使当前项可见
      expandAncestors(pageId);
    }

    // 侧边栏高亮与页面切换
    function switchPage(pageId) {
      if (!pageId.startsWith('page-')) pageId = 'page-' + pageId;
      
      // 移除所有 active 类
      document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.remove('active');
      });
      
      // 隐藏所有页面内容
      document.querySelectorAll('.page-content-wrapper').forEach(el => {
        el.style.display = 'none';
      });
      
      // 为当前项添加 active 类，展开祖先，滚动到可见
      const activeItem = document.querySelector('.sidebar-item[data-id="' + pageId + '"]');
      if (activeItem) {
        activeItem.classList.add('active');
        expandAncestors(pageId);
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      // 显示当前页面内容
      const activePage = document.getElementById(pageId);
      if (activePage) {
        activePage.style.display = 'block';
      }
    }

    // 搜索功能实现
    let searchTimeout = null;
    const originalContents = {};

    function initSearch() {
      const searchInput = document.getElementById('searchInput');
      if (!searchInput) return;

      // 存储原始 HTML 内容以便恢复
      document.querySelectorAll('.page-content-wrapper').forEach(wrapper => {
        originalContents[wrapper.id] = wrapper.innerHTML;
      });

      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          performSearch(e.target.value.trim());
        }, 300);
      });
    }

    function performSearch(keyword) {
      const sidebarItems = document.querySelectorAll('.sidebar-item');
      
      if (!keyword) {
        // 恢复原始内容
        document.querySelectorAll('.page-content-wrapper').forEach(wrapper => {
          wrapper.innerHTML = originalContents[wrapper.id];
        });
        // 显示所有侧边栏项
        document.querySelectorAll('.sidebar-item-group').forEach(group => {
          group.style.display = 'block';
        });
        return;
      }

      const regex = new RegExp('(' + keyword.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      let firstMatchPageId = null;

      document.querySelectorAll('.page-content-wrapper').forEach(wrapper => {
        const originalHtml = originalContents[wrapper.id];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHtml;
        
        // 深度优先遍历文本节点进行高亮，避开标签属性
        const textNodes = [];
        const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walk.nextNode()) textNodes.push(node);

        let hasMatch = false;
        textNodes.forEach(node => {
          if (node.nodeValue.match(regex)) {
            hasMatch = true;
            const parent = node.parentNode;
            if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
              const span = document.createElement('span');
              span.innerHTML = node.nodeValue.replace(regex, '<span class="search-result-highlight">$1</span>');
              parent.replaceChild(span, node);
            }
          }
        });

        wrapper.innerHTML = tempDiv.innerHTML;
        
        // 更新侧边栏项显示状态
        const pageId = wrapper.id;
        const sidebarItem = document.querySelector('.sidebar-item[data-id="' + pageId + '"]');
        
        // 如果页面内容匹配，或者标题匹配
        const titleMatch = sidebarItem && sidebarItem.querySelector('.title').textContent.match(regex);
        
        if (hasMatch || titleMatch) {
          // 显示当前项及其所有父项
          if (sidebarItem) {
            let current = sidebarItem.closest('.sidebar-item-group');
            while (current) {
              current.style.display = 'block';
              const parentSubItems = current.parentElement.closest('.sidebar-sub-items');
              current = parentSubItems ? parentSubItems.closest('.sidebar-item-group') : null;
            }
          }
          if (!firstMatchPageId) firstMatchPageId = pageId;
          
          // 如果是标题匹配，高亮侧边栏标题
          if (titleMatch && sidebarItem) {
            const titleEl = sidebarItem.querySelector('.title');
            titleEl.innerHTML = titleEl.textContent.replace(regex, '<span class="search-result-highlight">$1</span>');
          }
        } else {
          // 暂时隐藏
          const sidebarGroup = sidebarItem ? sidebarItem.closest('.sidebar-item-group') : null;
          if (sidebarGroup) sidebarGroup.style.display = 'none';
        }
      });

      // 如果有匹配结果，切换到第一个匹配页面
      if (firstMatchPageId) {
        switchPage(firstMatchPageId);
      }
    }

    // 监听哈希变化
    window.addEventListener('hashchange', function() {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#page-')) {
        switchPage(hash.substring(1));
      }
    });

    // 初始加载
    document.addEventListener('DOMContentLoaded', function() {
      // 1. 恢复折叠状态（必须在 switchPage 之前，保证祖先节点可见性正确）
      restoreCollapseState();

      // 2. 导航到目标页面
      const hash = window.location.hash;
      if (hash && hash.startsWith('#page-')) {
        switchPage(hash.substring(1));
      } else {
        // 默认显示第一个根节点页面
        switchPage('page-${defaultPageId}');
      }
      
      initSearch();
      
      // 侧边栏拖拽调整宽度
      const resizer = document.getElementById('sidebarResizer');
      const sidebar = document.querySelector('.sidebar');
      const MIN_WIDTH = 120;
      const MAX_WIDTH = 600;
      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      // 从 localStorage 恢复上次拖拽宽度（优先于 CSS 变量初始宽度）
      const savedWidth = localStorage.getItem('sidebar-width');
      if (savedWidth && sidebar) {
        const w = parseInt(savedWidth, 10);
        if (w >= MIN_WIDTH && w <= MAX_WIDTH) {
          sidebar.style.width = w + 'px';
        }
      }

      if (resizer && sidebar) {
        resizer.addEventListener('mousedown', function(e) {
          isResizing = true;
          startX = e.clientX;
          startWidth = parseInt(window.getComputedStyle(sidebar).width, 10);
          resizer.classList.add('dragging');
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        });
      }

      document.addEventListener('mousemove', function(e) {
        if (!isResizing || !sidebar) return;
        const delta = e.clientX - startX;
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + delta));
        sidebar.style.width = newWidth + 'px';
      });

      document.addEventListener('mouseup', function() {
        if (!isResizing || !sidebar) return;
        isResizing = false;
        resizer && resizer.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        // 保存宽度到 localStorage
        localStorage.setItem('sidebar-width', parseInt(window.getComputedStyle(sidebar).width, 10).toString());
      });
      
      // 为所有图片添加点击事件
      const images = document.querySelectorAll('.content img');
      images.forEach(img => {
        img.addEventListener('click', function() {
          openImageViewer(this.src);
        });
      });
    });
    
    // 代码块复制功能
    window.copyCodeBlock = function(codeBlockId, buttonElement) {
      const codeBlock = document.getElementById(codeBlockId);
      if (!codeBlock) {
        alert('找不到代码块');
        return;
      }
      
      // 从data属性获取原始代码
      const code = codeBlock.getAttribute('data-code') || '';
      const decodedCode = code.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      
      // 更新按钮状态的函数
      function updateButtonState(success) {
        if (buttonElement && success) {
          const originalText = buttonElement.textContent || '复制';
          const originalBg = buttonElement.style.background || '#3b82f6';
          buttonElement.textContent = '已复制';
          buttonElement.style.background = '#10b981';
          setTimeout(function() {
            buttonElement.textContent = originalText;
            buttonElement.style.background = originalBg;
          }, 2000);
        }
      }
      
      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(decodedCode).then(function() {
          updateButtonState(true);
        }).catch(function(err) {
          console.error('复制失败:', err);
          alert('复制失败，请手动复制');
        });
      } else {
        // 降级方案：使用textarea
        const textarea = document.createElement('textarea');
        textarea.value = decodedCode;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          updateButtonState(true);
        } catch (err) {
          console.error('复制失败:', err);
          alert('复制失败，请手动复制');
        }
        document.body.removeChild(textarea);
      }
      // 图片放大缩小功能
      document.querySelectorAll('img:not(.link-card img)').forEach(img => {
        let isResizing = false;
        let startX, startWidth;

        img.addEventListener('mousedown', function(e) {
          isResizing = true;
          startX = e.clientX;
          startWidth = img.offsetWidth;
          e.preventDefault();
          img.style.cursor = 'nwse-resize';
        });

        window.addEventListener('mousemove', function(e) {
          if (!isResizing) return;
          const deltaX = e.clientX - startX;
          img.style.width = (startWidth + deltaX) + 'px';
          img.style.height = 'auto'; // 保持比例
        });

        window.addEventListener('mouseup', function() {
          if (isResizing) {
            isResizing = false;
            img.style.cursor = 'pointer';
          }
        });
      });
    };
  </script>
</body>
</html>
    `.trim();

    // 输出HTML的目录部分用于调试
    const bodyStart = htmlContent.indexOf('<body>');
    const containerStart = htmlContent.indexOf('<div class="container">');
    if (bodyStart !== -1 && containerStart !== -1) {
      const tocSection = htmlContent.substring(bodyStart, containerStart);
      console.log('=== 导出HTML的目录部分 ===');
      console.log(tocSection);
      console.log('=== 目录部分结束 ===');
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.pageTitle}.html`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: '导出成功',
      description: `文档已导出！包含 ${pages.length} 个页面。打开 HTML 文件后，点击左侧目录可切换不同文档。`,
    });
  }, [pages, settings, toast, activePageId, tocWidth, content]);

  // 导出为JSON
  // 导出为JSON
  const handleExportJSON = useCallback(() => {
    const data = {
      pages,
      activePageId,
      settings,
      version: '2.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.pageTitle || '文档'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: '导出成功',
      description: 'JSON项目文件已导出，包含所有页面和设置',
    });
  }, [pages, activePageId, settings, toast]);

  // 导出为Markdown
  const handleExportMarkdown = useCallback(() => {
    try {
      const activePage = pages.find(p => p.id === activePageId);
      const title = activePage?.title || '文档';
      const filename = `${title}.md`;
      exportMarkdown(content, filename);
      
      toast({
        title: '导出成功',
        description: '当前页面的Markdown文件已导出',
      });
    } catch (error) {
      console.error('导出Markdown失败:', error);
      toast({
        title: '导出失败',
        description: '导出Markdown时发生错误，请重试',
        variant: 'destructive',
      });
    }
  }, [content, pages, activePageId, toast]);

  // 导入JSON
  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          
          let initialContent = '';

          if (jsonData.pages && Array.isArray(jsonData.pages)) {
            // 新版本格式：全量替换所有页面
            const cleanedPages = jsonData.pages.map((p: any) => ({
              ...p,
              content: cleanupHTMLString(p.content)
            }));
            setPages(cleanedPages);
            const initialPageId = jsonData.activePageId || cleanedPages[0].id;
            setActivePageId(initialPageId);
            const initialPage = cleanedPages.find((p: any) => p.id === initialPageId) || cleanedPages[0];
            initialContent = initialPage.content;
            setContent(initialContent);
            if (jsonData.settings) setSettings(jsonData.settings);
          } else if (jsonData.content) {
            // 旧版本格式：创建单页文档
            const cleanedContent = cleanupHTMLString(jsonData.content);
            const newPage: PageNode = {
              id: 'page-1',
              title: jsonData.settings?.pageTitle || '导入文档',
              content: cleanedContent,
              parentId: null,
              order: 0,
            };
            setPages([newPage]);
            setActivePageId(newPage.id);
            initialContent = newPage.content;
            setContent(initialContent);
            if (jsonData.settings) setSettings(jsonData.settings);
          } else {
            throw new Error('无效的JSON文件格式');
          }

          // 同步更新编辑器 DOM，确保界面立即刷新
          const editor = editorRef.current?.getElement();
          if (editor) {
            editor.innerHTML = initialContent;
          }

          // 重置历史记录，避免撤销回到导入前的内容
          setHistory([initialContent]);
          setHistoryIndex(0);

          toast({
            title: '导入成功',
            description: '已导入项目内容',
          });
        } catch (error) {
          toast({
            title: '导入失败',
            description: '无法解析JSON文件，请确保文件格式正确',
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [toast]);


  // 导入HTML
  const handleImportHTML = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await importHTMLFile(file);

        // 导入设置（如果存在）
        if (result.settings && Object.keys(result.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...result.settings }));
        }

        if (result.pages && result.pages.length > 0) {
          // ── 多页面格式：用导入的页面树替换当前所有页面 ──
          const importedPages: PageNode[] = (result.pages as ImportedPage[]).map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            parentId: p.parentId,
            order: p.order,
          }));
          const firstPage = importedPages[0];
          setPages(importedPages);
          setActivePageId(firstPage.id);
          setContent(firstPage.content);

          // 更新编辑器 DOM
          const editor = editorRef.current?.getElement();
          if (editor) editor.innerHTML = firstPage.content;

          setHistory([firstPage.content]);
          setHistoryIndex(0);

          toast({
            title: '导入成功',
            description: `已导入 ${importedPages.length} 个页面${Object.keys(result.settings).length > 0 ? '，并还原文档设置' : ''}`,
          });
        } else if (result.content !== undefined) {
          // ── 单页面格式：更新当前活跃页面内容 ──
          setContent(result.content);
          setPages(prev => prev.map(p =>
            p.id === activePageId ? { ...p, content: result.content! } : p,
          ));

          const editor = editorRef.current?.getElement();
          if (editor) editor.innerHTML = result.content;

          setHistory([result.content]);
          setHistoryIndex(0);

          toast({
            title: '导入成功',
            description: `已导入HTML文档到当前页面${Object.keys(result.settings).length > 0 ? '和设置' : ''}`,
          });
        } else {
          throw new Error('无法从文件中提取内容');
        }
      } catch (error) {
        console.error('导入HTML失败:', error);
        toast({
          title: '导入失败',
          description: error instanceof Error ? error.message : '无法解析HTML文件，请确保文件格式正确',
          variant: 'destructive',
        });
      }
    };
    
    input.click();
  }, [toast, activePageId]);

  // 导入Markdown
  const handleImportMarkdown = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await importMarkdownFile(file);
        const cleanedContent = cleanupHTMLString(result.content);
        setContent(cleanedContent);
        setPages(prev => prev.map(p =>
          p.id === activePageId
            ? {
                ...p,
                content: cleanedContent,
                ...(result.title ? { title: result.title } : {}),
              }
            : p
        ));

        const editor = editorRef.current?.getElement();
        if (editor) {
          editor.innerHTML = cleanedContent;
        }

        // 同步历史记录，使撤销操作基于导入后的内容
        setHistory([result.content]);
        setHistoryIndex(0);

        toast({
          title: '导入成功',
          description: `已导入Markdown文档到当前页面${result.title ? '，标题：' + result.title : ''}`,
        });
      } catch (error) {
        console.error('导入Markdown失败:', error);
        toast({
          title: '导入失败',
          description: error instanceof Error ? error.message : '无法解析Markdown文件，请确保文件格式正确',
          variant: 'destructive',
        });
      }
    };
    
    input.click();
  }, [toast, activePageId]);

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 顶部标题栏 */}
      <div className="bg-card/95 backdrop-blur-md border-b border-border px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shadow-sm shrink-0 z-40">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-base md:text-xl font-bold gradient-text">HTML说明文档制作工具</h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {/* 移动端目录按钮 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden h-8 w-8 touch-target">
                <Menu className="h-3.5 w-3.5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
              <TableOfContents
                pages={pages}
                onPageClick={(id) => {
                  handlePageClick(id);
                  // 可以在这里添加关闭 Sheet 的逻辑，但由于 TableOfContents 不知道 Sheet，需要外部控制
                }}
                activePageId={activePageId}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onRenamePage={handleRenamePage}
                onUpdatePageColor={handleUpdatePageColor}
                onMovePage={handleMovePage}
                isCollapsed={false}
                side="left"
                sidebarTextColor={settings.sidebarTextColor}
              />
            </SheetContent>
          </Sheet>

          {/* 设置按钮 */}
          <Sheet open={settingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 touch-target">
                <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>设置</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={(newSettings) =>
                    setSettings(prev => ({ ...prev, ...newSettings }))
                  }
                  onExport={handleExport}
                  onExportJSON={handleExportJSON}
                  onExportMarkdown={handleExportMarkdown}
                  onImportJSON={handleImportJSON}
                  onImportHTML={handleImportHTML}
                  onImportMarkdown={handleImportMarkdown}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 工具栏 */}
      <EditorToolbar
        onCommand={handleCommand}
        onInsertImage={handleImageUpload}
        onInsertLink={handleInsertLink}
        onInsertAttachment={handleInsertAttachment}
        onInsertVideo={handleInsertVideo}
        onInsertAudio={handleInsertAudio}
        onInsertTable={handleInsertTable}
        onInsertCode={handleInsertCode}
        onOpenCodeDialog={() => {
          setEditingCodeBlock(null);
          setCodeDialogOpen(true);
        }}
        onInsertSpecialChar={handleInsertSpecialChar}
        onFindReplace={handleFindReplace}

        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        currentFont={currentFont}
        currentFontSize={currentFontSize}
        currentHeadingLevel={currentHeadingLevel}
        onSaveSelection={saveSelection}
        onTableAction={handleTableAction}
        hasSelectedCells={hasSelectedCells}
        currentCodeTheme={settings.codeTheme}
        onCodeThemeChange={(theme) => setSettings({ ...settings, codeTheme: theme })}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onPrint={handlePrint}
        selectedText={selectedText}
        onOpenParagraphDialog={() => {
          // 保存当前选区
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            try {
              const clonedRange = range.cloneRange();
              (window as any).__savedRange = clonedRange;
            } catch (e) {
              console.warn('无法保存选区:', e);
            }
          }
          setParagraphDialogOpen(true);
        }}
      />

      {/* 主体区域：右侧内容 + 左侧CHM侧边栏 */}
      <div className="flex flex-1 overflow-hidden">
        {/* CHM 风格侧边栏（仅桌面端显示） */}
        <div
          className="hidden md:flex h-full shrink-0 flex-col border-r border-border transition-all duration-300"
          style={{ 
            width: tocCollapsed ? 28 : tocWidth,
            background: settings.enableGlassEffect ? 'transparent' : settings.sidebarBackgroundColor,
            color: settings.sidebarTextColor,
            backdropFilter: settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : 'none',
            WebkitBackdropFilter: settings.enableGlassEffect ? `blur(${settings.glassBlur}px)` : 'none'
          }}
        >
          {!tocCollapsed && (
            <div className="h-[56px] px-3 flex items-center shrink-0">
              <div className="relative group w-full">
                <Search className={cn(
                  "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors",
                  settings.useBlackMask ? "text-slate-500 group-focus-within:text-primary" : "text-slate-400 group-focus-within:text-primary"
                )} />
                <input
                  type="text"
                  placeholder="搜索目录..."
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-8 pr-8 py-1.5 text-xs rounded-md outline-none transition-all border",
                    settings.useBlackMask 
                      ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50" 
                      : "bg-white/50 border-slate-200 text-slate-900 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  )}
                />
                {sidebarSearchQuery && (
                  <button
                    onClick={() => setSidebarSearchQuery('')}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors",
                      settings.useBlackMask ? "hover:bg-white/10 text-slate-500" : "hover:bg-slate-100 text-slate-400"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <div className="h-6 shrink-0" /> {/* 顶部对齐占位空间 */}
            <TableOfContents
              pages={pages}
              onPageClick={handlePageClick}
              activePageId={activePageId}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
              onRenamePage={handleRenamePage}
              onUpdatePageColor={handleUpdatePageColor}
              onMovePage={handleMovePage}
              isCollapsed={tocCollapsed}
              onCollapsedChange={setTocCollapsed}
              side="left"
              searchQuery={sidebarSearchQuery}
              opacity={settings.opacity}
              headerAlignWithPaper={true}
              titleColor={settings.pageTitleColor}
              sidebarTextColor={settings.sidebarTextColor}
            />
          </div>
        </div>

        {/* 可拖拽分隔线（仅桌面端未折叠时显示） */}
        {!tocCollapsed && (
          <div
            className="hidden md:block w-1 h-full shrink-0 cursor-col-resize select-none hover:bg-[#2B579A]/40 transition-colors"
            style={{ background: '#e2e8f0' }}
            onMouseDown={handleSidebarResizeStart}
          />
        )}

        {/* 右侧内容区 */}
        <div
          className={cn("flex-1 min-w-0 overflow-y-auto flex flex-col", !settings.backgroundImage && "gradient-bg")}
          ref={mainContentRef}
        >
          {/* 当前页面标题 - 固定在顶部 */}
          {(() => {
            const activePage = pages.find(p => p.id === activePageId);
            return activePage ? (
              <div 
                className="px-3 md:px-10 h-[56px] flex items-center border-b border-border shrink-0"
                style={{
                  background: `rgba(248, 250, 252, ${settings.opacity / 100})`,
                  backdropFilter: settings.opacity < 100 ? 'blur(8px)' : 'none'
                }}
              >
                <h1 
                  className="text-lg md:text-xl font-bold m-0 p-0 truncate transition-colors duration-300"
                  style={{ color: activePage.titleColor || settings.pageTitleColor }}
                >
                  {activePage.title}
                </h1>
              </div>
            ) : null;
          })()}
          
          {/* 可滚动的编辑区域 */}
          <div className="flex-1 overflow-y-auto px-3 md:px-10 py-6 w-full">
            <EditorContent
              ref={editorRef}
              content={content}
              onChange={handleContentChange}
              opacity={settings.opacity}
              onSelectionChange={saveSelection}
              enableGlassEffect={settings.enableGlassEffect}
              glassBlur={settings.glassBlur}
              useBlackMask={settings.useBlackMask}
              pageTitleColor={(() => {
                const activePage = pages.find(p => p.id === activePageId);
                return activePage?.titleColor || settings.pageTitleColor;
              })()}
              onEditLink={handleEditLink}
              onEditImage={editImageProperties}
            />
            
            {/* 增强表格工具栏 */}
            <EnhancedTableToolbar
              ref={tableToolbarRef}
              editorRef={editorRef}
              onContentChange={handleContentChange}
            />
          </div>
        </div>
      </div>

      {/* 底部状态栏 - 桌面端显示 */}
      <div className="hidden md:block shrink-0 relative z-50">
        <EditorStatusBar 
          characterCount={characterCount} 
          wordCount={wordCount}
          currentFont={currentFont}
          currentFontSize={currentFontSize}
          currentHeadingLevel={currentHeadingLevel}
        />
      </div>
      
      {/* 移动端底部工具栏 */}
      <div className="md:hidden">
        <MobileToolbar
          onCommand={handleCommand}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onOpenLinkDialog={() => {}}
          onOpenAttachmentDialog={() => setAttachmentDialogOpen(true)}
          onOpenImageDialog={() => {}}
          onOpenTableDialog={() => {}}
          onOpenCodeDialog={() => {
            setEditingCodeBlock(null);
            setCodeDialogOpen(true);
          }}
          onOpenColorPicker={() => {}}
        />
      </div>
      
      {/* 编辑链接对话框 */}
      {editingLink && linkEditData && (
        <LinkDialog
          editMode={true}
          initialData={linkEditData}
          onInsertLink={handleUpdateLink}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLink(null);
              setLinkEditData(null);
            }
          }}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}

      {/* 编辑附件对话框 */}
      {editingAttachment && attachmentEditData && (
        <AttachmentDialog
          editMode={true}
          initialData={attachmentEditData}
          onInsertAttachment={handleUpdateAttachment}
          onOpenChange={(open) => {
            if (!open) {
              setEditingAttachment(null);
              setAttachmentEditData(null);
            }
          }}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}

      {/* 插入附件对话框 (移动端或通用) */}
      {!editingAttachment && (
        <AttachmentDialog
          open={attachmentDialogOpen}
          onOpenChange={setAttachmentDialogOpen}
          onInsertAttachment={handleInsertAttachment}
          trigger={<div style={{ display: 'none' }} />}
          editMode={false}
        />
      )}

      {/* 提取码提示弹窗 */}
      {activeAttachmentForCode && (
        <AttachmentCodeDialog
          open={!!activeAttachmentForCode}
          onOpenChange={(open) => !open && setActiveAttachmentForCode(null)}
          code={activeAttachmentForCode.code}
          url={activeAttachmentForCode.url}
          fileName={activeAttachmentForCode.fileName}
        />
      )}

      {/* 右键菜单 */}
      {menuState.visible && (
        <ContextMenu
          items={menuState.items}
          position={menuState.position}
          onClose={closeMenu}
          onCommand={executeCommand}
        />
      )}

      {/* 代码块对话框 */}
      <CodeDialog
        showTrigger={false}
        open={codeDialogOpen}
        onOpenChange={setCodeDialogOpen}
        initialData={editingCodeBlock}
        onInsertCode={handleInsertCode}
        onUpdateCode={handleUpdateCode}
        currentTheme={settings.codeTheme}
        onThemeChange={(theme) => setSettings(prev => ({ ...prev, codeTheme: theme }))}
      />

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

      {/* 右下角悬浮按钮组 */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-3">
        {settings.enableScrollButtons && (
          <ScrollButtons containerRef={mainContentRef} />
        )}
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg border border-border hover:scale-110 transition-smooth touch-target bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setSettingsSheetOpen(true)}
          title="设置"
        >
          <Settings className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    </div>
  );
}
