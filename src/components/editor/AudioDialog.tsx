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
import { Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AudioMetadata {
  url: string;
  platform: string;
  title?: string;
  artist?: string;
  cover?: string;
}

interface AudioDialogProps {
  onInsertAudio: (metadata: AudioMetadata) => void;
}

export function AudioDialog({ onInsertAudio }: AudioDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<string>('direct');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [cover, setCover] = useState('');
  const { toast } = useToast();

  const handleInsert = () => {
    if (!url.trim()) {
      toast({
        title: '错误',
        description: '请输入音频链接',
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
        description: '请输入有效的音频链接',
        variant: 'destructive',
      });
      return;
    }

    // 如果有封面URL，验证封面URL格式
    if (cover.trim()) {
      try {
        new URL(cover);
      } catch {
        toast({
          title: '错误',
          description: '请输入有效的封面图片链接',
          variant: 'destructive',
        });
        return;
      }
    }

    onInsertAudio({
      url,
      platform,
      title: title.trim() || undefined,
      artist: artist.trim() || undefined,
      cover: cover.trim() || undefined,
    });
    
    setUrl('');
    setPlatform('direct');
    setTitle('');
    setArtist('');
    setCover('');
    setOpen(false);
    
    toast({
      title: '成功',
      description: '音频已插入',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="插入音频"
        >
          <Music className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>插入音频</DialogTitle>
          <DialogDescription>
            支持直接音频链接和主流音乐平台（网易云音乐、QQ音乐等）
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto flex-1">
          <div className="grid gap-2">
            <Label htmlFor="audio-platform">音频平台</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="audio-platform">
                <SelectValue placeholder="选择音频平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">直接链接 (MP3/WAV/Ogg)</SelectItem>
                <SelectItem value="netease">网易云音乐</SelectItem>
                <SelectItem value="qq">QQ音乐</SelectItem>
                <SelectItem value="spotify">Spotify</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="audio-url">音频链接 *</Label>
            <Input
              id="audio-url"
              placeholder={
                platform === 'direct' 
                  ? 'https://example.com/audio.mp3'
                  : platform === 'netease'
                  ? 'https://music.163.com/#/song?id=...'
                  : platform === 'qq'
                  ? 'https://y.qq.com/n/yqq/song/...'
                  : 'https://...'
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleInsert();
                }
              }}
            />
          </div>

          {/* 可选的元数据字段 */}
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">可选信息（自定义显示）</p>
            
            <div className="grid gap-2">
              <Label htmlFor="audio-title">歌曲名称</Label>
              <Input
                id="audio-title"
                placeholder="例如：夜曲"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="audio-artist">歌手/艺术家</Label>
              <Input
                id="audio-artist"
                placeholder="例如：周杰伦"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="audio-cover">封面图片链接</Label>
              <Input
                id="audio-cover"
                placeholder="https://example.com/cover.jpg"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            {platform === 'direct' && (
              <>
                <p className="font-medium">支持的格式：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>MP3 (.mp3)</li>
                  <li>WAV (.wav)</li>
                  <li>Ogg (.ogg)</li>
                </ul>
              </>
            )}
            {platform === 'netease' && (
              <p>支持网易云音乐链接，将自动转换为嵌入式播放器</p>
            )}
            {platform === 'qq' && (
              <p>支持QQ音乐链接，将自动转换为嵌入式播放器</p>
            )}
            {platform === 'spotify' && (
              <p>支持Spotify音乐链接，将自动转换为嵌入式播放器</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleInsert}>插入</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
