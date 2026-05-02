import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttachmentCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  url: string;
  fileName: string;
}

export function AttachmentCodeDialog({
  open,
  onOpenChange,
  code,
  url,
  fileName,
}: AttachmentCodeDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setCopied(false);
    }
  }, [open]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: '已复制',
        description: '提取码已成功复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: '复制失败',
        description: '请手动选择提取码并复制',
        variant: 'destructive',
      });
    }
  };

  const handleCopyAndOpen = async () => {
    await handleCopyCode();
    window.open(url, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>提取码提示</DialogTitle>
          <DialogDescription className="truncate">
            附件 <span className="font-semibold text-foreground">{fileName}</span> 需要提取码。
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="attach-code-view">文件提取码</Label>
            <div className="flex gap-2">
              <Input
                id="attach-code-view"
                value={code}
                readOnly
                className="bg-muted font-mono text-center text-lg tracking-wider"
              />
              <Button size="icon" variant="outline" onClick={handleCopyCode} title="复制提取码">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            关闭
          </Button>
          <Button onClick={handleCopyAndOpen} className="flex-1 gap-2">
            <ExternalLink className="h-4 w-4" />
            复制并打开链接
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
