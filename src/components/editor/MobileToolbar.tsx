import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Paperclip,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  Undo,
  Redo,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MobileToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenLinkDialog: () => void;
  onOpenAttachmentDialog: () => void;
  onOpenImageDialog: () => void;
  onOpenTableDialog: () => void;
  onOpenCodeDialog: () => void;
  onOpenColorPicker: () => void;
}

export function MobileToolbar({
  onCommand,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenLinkDialog,
  onOpenAttachmentDialog,
  onOpenImageDialog,
  onOpenTableDialog,
  onOpenCodeDialog,
  onOpenColorPicker,
}: MobileToolbarProps) {
  const [open, setOpen] = useState(false);

  const quickActions = [
    { icon: Bold, command: 'bold', label: '加粗' },
    { icon: Italic, command: 'italic', label: '斜体' },
    { icon: Underline, command: 'underline', label: '下划线' },
    { icon: List, command: 'insertUnorderedList', label: '无序列表' },
    { icon: ListOrdered, command: 'insertOrderedList', label: '有序列表' },
  ];

  return (
    <>
      {/* 移动端底部快捷工具栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-xl">
        <div className="flex items-center justify-between px-2 py-2 overflow-x-auto">
          {/* 快捷操作 */}
          <div className="flex items-center gap-1">
            {quickActions.map((action) => (
              <Button
                key={action.command}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 touch-target"
                onClick={() => onCommand(action.command)}
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* 撤销/重做 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 touch-target"
              onClick={onUndo}
              disabled={!canUndo}
              title="撤销"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 touch-target"
              onClick={onRedo}
              disabled={!canRedo}
              title="重做"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* 更多选项 */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 touch-target"
                title="更多工具"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>编辑工具</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* 标题 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">标题</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="h-12 touch-target"
                      onClick={() => {
                        onCommand('formatBlock', 'h1');
                        setOpen(false);
                      }}
                    >
                      <Heading1 className="h-5 w-5 mr-2" />
                      标题 1
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 touch-target"
                      onClick={() => {
                        onCommand('formatBlock', 'h2');
                        setOpen(false);
                      }}
                    >
                      <Heading2 className="h-5 w-5 mr-2" />
                      标题 2
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 touch-target"
                      onClick={() => {
                        onCommand('formatBlock', 'h3');
                        setOpen(false);
                      }}
                    >
                      <Heading3 className="h-5 w-5 mr-2" />
                      标题 3
                    </Button>
                  </div>
                </div>

                {/* 对齐 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">对齐</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="h-12 touch-target"
                      onClick={() => {
                        onCommand('justifyLeft');
                        setOpen(false);
                      }}
                    >
                      <AlignLeft className="h-5 w-5 mr-2" />
                      左对齐
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 touch-target"
                      onClick={() => {
                        onCommand('justifyCenter');
                        setOpen(false);
                      }}
                    >
                      <AlignCenter className="h-5 w-5 mr-2" />
                      居中
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 touch-target"
                      onClick={() => {
                        onCommand('justifyRight');
                        setOpen(false);
                      }}
                    >
                      <AlignRight className="h-5 w-5 mr-2" />
                      右对齐
                    </Button>
                  </div>
                </div>

                {/* 插入 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">插入</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-14 touch-target"
                      onClick={() => {
                        onOpenLinkDialog();
                        setOpen(false);
                      }}
                    >
                      <LinkIcon className="h-5 w-5 mr-2" />
                      链接
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 touch-target"
                      onClick={() => {
                        onOpenAttachmentDialog();
                        setOpen(false);
                      }}
                    >
                      <Paperclip className="h-5 w-5 mr-2" />
                      附件
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 touch-target"
                      onClick={() => {
                        onOpenImageDialog();
                        setOpen(false);
                      }}
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      图片
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 touch-target"
                      onClick={() => {
                        onOpenTableDialog();
                        setOpen(false);
                      }}
                    >
                      <TableIcon className="h-5 w-5 mr-2" />
                      表格
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 touch-target"
                      onClick={() => {
                        onOpenCodeDialog();
                        setOpen(false);
                      }}
                    >
                      <Code className="h-5 w-5 mr-2" />
                      代码
                    </Button>
                  </div>
                </div>

                {/* 颜色 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">颜色</h3>
                  <Button
                    variant="outline"
                    className="w-full h-14 touch-target"
                    onClick={() => {
                      onOpenColorPicker();
                      setOpen(false);
                    }}
                  >
                    <Palette className="h-5 w-5 mr-2" />
                    文字和背景颜色
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
