import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface FindReplaceDialogProps {
  onAction: (find: string, replace: string, all: boolean) => void;
}

export function FindReplaceDialog({ onAction }: FindReplaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="查找替换">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>查找与替换</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="find">查找内容</Label>
            <Input
              id="find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="要查找的文本..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replace">替换为</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="替换后的文本..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onAction(findText, replaceText, false)}
              disabled={!findText}
            >
              查找
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onAction(findText, replaceText, false)}
              disabled={!findText}
            >
              替换
            </Button>
            <Button 
              onClick={() => onAction(findText, replaceText, true)}
              disabled={!findText}
            >
              全部替换
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
