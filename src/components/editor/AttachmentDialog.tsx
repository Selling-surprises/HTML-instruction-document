import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Paperclip, Archive, Terminal, FileText } from 'lucide-react';

export interface AttachmentData {
  id?: string;
  name: string;
  url: string;
  code?: string;
  type: 'archive' | 'program' | 'other';
}

interface AttachmentDialogProps {
  onInsertAttachment: (data: AttachmentData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editMode?: boolean;
  initialData?: Partial<AttachmentData>;
  trigger?: React.ReactNode;
}

export function AttachmentDialog({ 
  onInsertAttachment, 
  open: externalOpen,
  onOpenChange: externalOnOpenChange, 
  editMode = false, 
  initialData, 
  trigger 
}: AttachmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [type, setType] = useState<'archive' | 'program' | 'other'>(initialData?.type || 'other');

  useEffect(() => {
    if (editMode && initialData) {
      setName(initialData.name || '');
      setUrl(initialData.url || '');
      setCode(initialData.code || '');
      setType(initialData.type || 'other');
      
      if (!isControlled) {
        setInternalOpen(true);
      }
    }
  }, [editMode, initialData, isControlled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim() || !name.trim()) {
      return;
    }

    const data: AttachmentData = {
      name: name.trim(),
      url: url.trim(),
      code: code.trim(),
      type: type,
    };
    
    onInsertAttachment(data);
    
    // 重置并关闭
    if (!editMode) {
      setName('');
      setUrl('');
      setCode('');
      setType('other');
    }
    
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(false);
    } else {
      setInternalOpen(false);
      if (externalOnOpenChange) externalOnOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      if (externalOnOpenChange) externalOnOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
      if (externalOnOpenChange) externalOnOpenChange(newOpen);
    }
    
    if (!newOpen) {
      if (!editMode) {
        setName('');
        setUrl('');
        setCode('');
        setType('other');
      }
    } else if (editMode && initialData) {
      setName(initialData.name || '');
      setUrl(initialData.url || '');
      setCode(initialData.code || '');
      setType(initialData.type || 'other');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="插入附件">
            <Paperclip className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editMode ? '编辑附件' : '插入附件'}</DialogTitle>
            <DialogDescription>
              配置附件的下载链接和提取码（如果有）。
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 图标类型 */}
            <div className="grid gap-2">
              <Label>图标类型</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="archive" id="type-archive" />
                  <Label htmlFor="type-archive" className="flex items-center gap-1 cursor-pointer">
                    <Archive className="h-4 w-4" /> 压缩
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="program" id="type-program" />
                  <Label htmlFor="type-program" className="flex items-center gap-1 cursor-pointer">
                    <Terminal className="h-4 w-4" /> 程序
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="type-other" />
                  <Label htmlFor="type-other" className="flex items-center gap-1 cursor-pointer">
                    <FileText className="h-4 w-4" /> 其它
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 文件名 */}
            <div className="grid gap-2">
              <Label htmlFor="attach-name">
                文件名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attach-name"
                placeholder="例如：项目文档.zip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* 链接地址 */}
            <div className="grid gap-2">
              <Label htmlFor="attach-url">
                链接地址 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attach-url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            
            {/* 提取码 */}
            <div className="grid gap-2">
              <Label htmlFor="attach-code">提取码（可选）</Label>
              <Input
                id="attach-code"
                placeholder="网盘提取码（若无则留空）"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={!url.trim() || !name.trim()}>
              {editMode ? '保存修改' : '插入附件'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
