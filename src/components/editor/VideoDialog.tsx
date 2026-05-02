import { useState } from 'react';
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
import { Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VideoDialogProps {
  onInsertVideo: (url: string, platform: string) => void;
}

export function VideoDialog({ onInsertVideo }: VideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<string>('direct');
  const { toast } = useToast();

  const handleInsert = () => {
    if (!url.trim()) {
      toast({
        title: '错误',
        description: '请输入视频链接',
        variant: 'destructive',
      });
      return;
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      toast({
        title: '错误',
        description: '请输入有效的视频链接',
        variant: 'destructive',
      });
      return;
    }

    onInsertVideo(url, platform);
    setUrl('');
    setPlatform('direct');
    setOpen(false);
    
    toast({
      title: '成功',
      description: '视频已插入',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="插入视频"
        >
          <Video className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>插入视频</DialogTitle>
          <DialogDescription>
            支持直接视频链接和主流视频平台（YouTube、Bilibili、优酷、腾讯视频等）
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="platform">视频平台</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="选择视频平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">直接链接 (MP4/WebM/Ogg)</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="bilibili">Bilibili (哔哩哔哩)</SelectItem>
                <SelectItem value="youku">优酷</SelectItem>
                <SelectItem value="tencent">腾讯视频</SelectItem>
                <SelectItem value="iqiyi">爱奇艺</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="video-url">视频链接</Label>
            <Input
              id="video-url"
              placeholder={
                platform === 'direct' 
                  ? 'https://example.com/video.mp4'
                  : platform === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : platform === 'bilibili'
                  ? 'https://www.bilibili.com/video/BV...'
                  : 'https://...'
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInsert();
                }
              }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            {platform === 'direct' && (
              <>
                <p className="font-medium">支持的格式：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>MP4 (.mp4)</li>
                  <li>WebM (.webm)</li>
                  <li>Ogg (.ogg)</li>
                </ul>
              </>
            )}
            {platform === 'youtube' && (
              <p>支持 YouTube 视频链接，将自动转换为嵌入式播放器</p>
            )}
            {platform === 'bilibili' && (
              <p>支持 Bilibili 视频链接（BV号或av号），将自动转换为嵌入式播放器</p>
            )}
            {platform === 'youku' && (
              <p>支持优酷视频链接，将自动转换为嵌入式播放器</p>
            )}
            {platform === 'tencent' && (
              <p>支持腾讯视频链接，将自动转换为嵌入式播放器</p>
            )}
            {platform === 'iqiyi' && (
              <p>支持爱奇艺视频链接，将自动转换为嵌入式播放器</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleInsert}>插入</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
