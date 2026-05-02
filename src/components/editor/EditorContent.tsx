import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';


interface EditorContentProps {
  content: string;
  onChange: (content: string) => void;
  opacity: number;
  onSelectionChange?: () => void;
  enableGlassEffect?: boolean;
  glassBlur?: number;
  useBlackMask?: boolean;
  pageTitleColor?: string;
  onEditLink?: (linkElement: HTMLAnchorElement) => void;
  onEditImage?: (imgElement: HTMLImageElement) => void;
}

export interface EditorContentRef {
  getElement: () => HTMLDivElement | null;
  focus: () => void;
}

export const EditorContent = forwardRef<EditorContentRef, EditorContentProps>(
  ({ content, onChange, opacity, onSelectionChange, enableGlassEffect = false, glassBlur = 10, useBlackMask = false, pageTitleColor, onEditLink, onEditImage }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getElement: () => editorRef.current,
      focus: () => editorRef.current?.focus(),
    }));

    useEffect(() => {
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        
        editorRef.current.innerHTML = content;
        
        if (range) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(range);
          } catch (e) {
            // 忽略范围错误
          }
        }
      }
    }, [content]);

    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Tab键：增加缩进
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        document.execCommand('indent', false);
      }
      // Shift+Tab：减少缩进
      else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        document.execCommand('outdent', false);
      }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && onEditImage) {
        onEditImage(target as HTMLImageElement);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 如果点击的是图片,选中它
      if (target.tagName === 'IMG') {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      
      // 如果点击的是链接编辑图标
      if (target.classList.contains('link-edit-icon')) {
        e.preventDefault();
        e.stopPropagation();
        
        // 找到父容器span，然后找到其中的a元素
        const parentSpan = target.parentElement;
        const linkElement = parentSpan?.querySelector('a') as HTMLAnchorElement;
        if (linkElement && onEditLink) {
          onEditLink(linkElement);
        }
      }
      
      // 如果点击的是卡片编辑按钮
      if (target.classList.contains('card-edit-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // 找到卡片元素
        const cardElement = target.closest('.link-card') as HTMLElement;
        if (cardElement && onEditLink) {
          // 将卡片元素作为特殊的"链接"传递
          onEditLink(cardElement as unknown as HTMLAnchorElement);
        }
      }
    };

    // 根据useBlackMask设置决定使用黑色还是白色背景
    const backgroundColor = useBlackMask 
      ? `rgba(0, 0, 0, ${opacity / 100})`
      : `rgba(255, 255, 255, ${opacity / 100})`;
    const textColor = useBlackMask ? '#ffffff' : undefined;

    return (
      <div className="flex justify-center py-6 relative">
        {/* 文档纸张容器 */}
        <div 
          className={cn(
            "w-full max-w-[21cm] shadow-xl rounded-2xl overflow-hidden hover-lift transition-all duration-300",
            !enableGlassEffect && !useBlackMask && opacity === 100 && "bg-card"
          )}
          style={{
            minHeight: '29.7cm',
            background: enableGlassEffect ? 'transparent' : backgroundColor,
            backdropFilter: enableGlassEffect ? `blur(${glassBlur}px)` : (opacity < 100 ? 'blur(8px)' : 'none')
          }}
        >
          {/* 可编辑内容区域 */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className="min-h-[29.7cm] p-8 md:p-12 lg:p-16 focus:outline-none editor-content relative transition-smooth"
            style={{
              backgroundColor,
              color: textColor,
              backdropFilter: enableGlassEffect ? `blur(${glassBlur}px)` : 'none',
              WebkitBackdropFilter: enableGlassEffect ? `blur(${glassBlur}px)` : 'none',
              fontSize: '15px',
              lineHeight: '1.8',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif',
            }}
            onMouseUp={onSelectionChange}
            onKeyUp={onSelectionChange}
            suppressContentEditableWarning
          />
        </div>
        
        <style>{`
          .editor-content a {
            color: ${useBlackMask ? '#60a5fa' : '#4361ee'};
            text-decoration: underline;
            cursor: pointer;
          }
          
          .editor-content a:hover {
            color: ${useBlackMask ? '#93c5fd' : '#3f37c9'};
          }
          
          .editor-content .link-edit-icon {
            text-decoration: none !important;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            pointer-events: auto;
          }
          
          .editor-content .link-wrapper:hover .link-edit-icon {
            opacity: 1 !important;
          }
          
          .editor-content h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            color: ${pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee')};
          }
          
          .editor-content h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 0.6em;
            margin-bottom: 0.6em;
            color: ${pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee')};
          }
          
          .editor-content h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin-top: 0.7em;
            margin-bottom: 0.7em;
            color: ${pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee')};
          }
          
          .editor-content h4 {
            font-size: 1em;
            font-weight: bold;
            margin-top: 0.8em;
            margin-bottom: 0.8em;
            color: ${pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee')};
          }
          
          .editor-content h5 {
            font-size: 0.83em;
            font-weight: bold;
            margin-top: 0.9em;
            margin-bottom: 0.9em;
            color: ${pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee')};
          }
          
          .editor-content h6 {
            font-size: 0.67em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 1em;
            color: ${pageTitleColor || (useBlackMask ? '#60a5fa' : '#4361ee')};
          }
          
          .editor-content p {
            margin-top: 1em;
            margin-bottom: 1em;
          }
          
          .editor-content ul,
          .editor-content ol {
            margin-left: 2em;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          
          .editor-content ul {
            list-style-type: disc;
          }
          
          .editor-content ol {
            list-style-type: decimal;
          }
          
          .editor-content li {
            margin-bottom: 0.5em;
          }
          
          .editor-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 0.8em 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            opacity: 1;
            position: relative;
            z-index: 1;
          }
          
          .editor-content table td,
          .editor-content table th {
            border: 1px solid #333;
            padding: 8px 10px;
            min-width: 60px;
            text-align: left;
            color: #333;
            background: white;
            opacity: 1;
          }
          
          .editor-content table td {
            background: white;
          }
          
          .editor-content table th {
            background: #4361ee;
            color: white;
            font-weight: 600;
          }
          
          .editor-content table tr:nth-child(even) td {
            background: rgba(248, 249, 250, 0.5);
          }
          
          .editor-content table tr:hover td {
            background: rgba(232, 240, 254, 0.8);
          }
          
          .editor-content table td.selected,
          .editor-content table th.selected {
            background: rgba(67, 97, 238, 0.2) !important;
            outline: 2px solid #4361ee;
            outline-offset: -2px;
          }
          
          /* 图片对齐样式 */
          .editor-content img {
            max-width: 100%;
            height: auto;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          
          .editor-content img:hover {
            opacity: 0.9;
          }
          
          .editor-content img.img-left {
            display: block;
            margin-left: 0;
            margin-right: auto;
          }
          
          .editor-content img.img-center {
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          
          .editor-content img.img-right {
            display: block;
            margin-left: auto;
            margin-right: 0;
          }
          
          .editor-content hr {
            border: none;
            border-top: 2px solid ${useBlackMask ? 'rgba(96, 165, 250, 0.4)' : 'rgba(67, 97, 238, 0.3)'};
            margin: 1.8em 0;
          }

          .attachment-wrapper:hover {
            border-color: #4361ee !important;
            box-shadow: 0 2px 10px rgba(67, 97, 238, 0.1);
          }
          
          .attachment-edit-btn:hover {
            background: #2563eb !important;
          }
          
          .attachment-delete-btn:hover {
            background: #dc2626 !important;
          }
        `}</style>
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';
