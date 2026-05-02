import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  PilcrowSquare,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Quote,
  Eraser,
  Search,
  Minus as MinusIcon,
  Scissors,
  TableProperties,
  Code,
  Download,
  Printer,
  Maximize,
  Minimize,
} from 'lucide-react';
import type { FontFamily, FontSize } from '@/types/editor';

import { ColorPicker } from './ColorPicker';
import { LinkDialog, type LinkData } from './LinkDialog';
import { AttachmentDialog, type AttachmentData } from './AttachmentDialog';
import { ImageDialog } from './ImageDialog';
import { VideoDialog } from './VideoDialog';
import { AudioDialog, type AudioMetadata } from './AudioDialog';
import { EnhancedTableDialog } from './EnhancedTableDialog';
import { CodeDialog } from './CodeDialog';
import { TableToolbar } from './TableToolbar';
import { SpecialCharsDialog } from './SpecialCharsDialog';
import { FindReplaceDialog } from './FindReplaceDialog';

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onInsertImage: (src: string, caption?: string, width?: string) => void;
  onInsertLink: (linkData: LinkData) => void;
  onInsertAttachment: (data: AttachmentData) => void;
  onInsertVideo: (url: string, platform: string) => void;
  onInsertAudio: (metadata: AudioMetadata) => void;
  onInsertTable: (rows: number, cols: number, data: string[][]) => void;
  onInsertCode: (code: string, language: string, theme: string) => void;
  onOpenCodeDialog?: () => void;
  onInsertSpecialChar: (char: string) => void;
  onFindReplace: (find: string, replace: string, all: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentFont: FontFamily;
  currentFontSize: FontSize;
  currentHeadingLevel?: string;
  onSaveSelection?: () => void;
  onTableAction?: (action: string, data?: any) => void;
  hasSelectedCells?: boolean;
  currentCodeTheme: string;
  onCodeThemeChange: (theme: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onPrint: () => void;
  selectedText?: string;
  onOpenParagraphDialog?: () => void;
}

const fontFamilies: FontFamily[] = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Microsoft YaHei',
  'SimSun',
];

const fontSizes: FontSize[] = [
  '8px',
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '48px',
  '72px',
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onCommand,
  onInsertImage,
  onInsertLink,
  onInsertAttachment,
  onInsertVideo,
  onInsertAudio,
  onInsertTable,
  onInsertCode,
  onOpenCodeDialog,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentFont,
  currentFontSize,
  currentHeadingLevel,
  onSaveSelection,
  onTableAction,
  hasSelectedCells = false,
  currentCodeTheme,
  onCodeThemeChange,
  isFullscreen,
  onToggleFullscreen,
  onPrint,
  onInsertSpecialChar,
  onFindReplace,
  selectedText = '',
  onOpenParagraphDialog,
}) => {
  const [isSticky, setIsSticky] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`bg-card border-b border-border transition-smooth shadow-sm ${
        isSticky && !isFullscreen ? 'fixed top-0 left-0 right-0 z-50 shadow-elegant' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5 p-2">
        <Separator orientation="vertical" className="h-6" />

        {/* 撤销重做 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onUndo}
            disabled={!canUndo}
            title="撤销"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRedo}
            disabled={!canRedo}
            title="重做"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 字体和字号 */}
        <div className="flex items-center gap-1">
          <Select
            value={currentFont}
            onValueChange={(value) => onCommand('fontName', value)}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="字体" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentFontSize}
            onValueChange={(value) => onCommand('fontSize', value)}
          >
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue placeholder="字号" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 文本格式化 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('bold')}
            title="加粗"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('italic')}
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('underline')}
            title="下划线"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('strikeThrough')}
            title="删除线"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <ColorPicker onColorSelect={(color) => onCommand("foreColor", color)} icon={<Palette className="h-4 w-4" />} title="文字颜色" /><ColorPicker onColorSelect={(color) => onCommand("backColor", color)} icon={<Highlighter className="h-4 w-4" />} title="背景颜色" />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 对齐方式 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('justifyLeft')}
            title="左对齐"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('justifyCenter')}
            title="居中"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('justifyRight')}
            title="右对齐"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('justifyFull')}
            title="两端对齐"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 列表和缩进 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('insertUnorderedList')}
            title="无序列表"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('insertOrderedList')}
            title="有序列表"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('outdent')}
            title="减少缩进"
          >
            <IndentDecrease className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommand('indent')}
            title="增加缩进"
          >
            <IndentIncrease className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 插入功能 */}
        <div className="flex items-center gap-0.5">
          <LinkDialog onInsertLink={onInsertLink} />
          <AttachmentDialog onInsertAttachment={onInsertAttachment} />
          <VideoDialog onInsertVideo={onInsertVideo} />
          <AudioDialog onInsertAudio={onInsertAudio} />
          <EnhancedTableDialog onInsertTable={onInsertTable} />
          <ImageDialog onInsertImage={onInsertImage} />
          <SpecialCharsDialog onInsertChar={onInsertSpecialChar} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (onSaveSelection) onSaveSelection();
              if (onOpenCodeDialog) onOpenCodeDialog();
            }}
            title="插入代码"
            className="h-8 w-8"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 查找与替换 */}
        <div className="flex items-center gap-0.5">
          <FindReplaceDialog onAction={onFindReplace} />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 表格工具 */}
        <div className="flex items-center gap-0.5">
          {hasSelectedCells && (
            <TableToolbar onTableAction={onTableAction!} hasSelectedCells={hasSelectedCells} />
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPrint}
            title="打印"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFullscreen}
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
