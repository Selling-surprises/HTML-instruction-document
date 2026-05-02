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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/ui/file-upload';
import { Image } from 'lucide-react';

interface ImageDialogProps {
  onInsertImage: (src: string, caption?: string, width?: string) => void;
}

export function ImageDialog({ onInsertImage }: ImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [width, setWidth] = useState('100');
  const [widthUnit, setWidthUnit] = useState('%');
  const [previewImage, setPreviewImage] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      return;
    }

    const finalWidth = width ? `${width}${widthUnit}` : undefined;
    onInsertImage(imageUrl.trim(), caption.trim(), finalWidth);
    
    // 重置表单并关闭对话框
    setImageUrl('');
    setCaption('');
    setWidth('100');
    setOpen(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInsertLocalImage = () => {
    if (previewImage) {
      const finalWidth = width ? `${width}${widthUnit}` : undefined;
      onInsertImage(previewImage, caption.trim(), finalWidth);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 关闭时重置表单
      setImageUrl('');
      setCaption('');
      setWidth('100');
      setPreviewImage('');
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="插入图片">
          <Image className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>插入图片</DialogTitle>
          <DialogDescription>
            从本地上传图片或输入在线图片地址，并设置显示尺寸
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">本地上传</TabsTrigger>
            <TabsTrigger value="online">在线图片</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="image-file">选择图片文件</Label>
              <FileUpload
                accept="image/*"
                onChange={handleFileSelect}
                value={previewImage}
                onRemove={() => {
                    setPreviewImage('');
                    setSelectedFile(null);
                }}
                previewType="image"
                buttonText="选择图片"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="image-width-local">显示宽度</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-width-local"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={widthUnit} onValueChange={setWidthUnit}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="px">px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-caption-local">图片标注 (可选)</Label>
                <Input
                  id="image-caption-local"
                  placeholder="输入标注..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
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
                <Button 
                  onClick={handleInsertLocalImage} 
                  disabled={!previewImage}
                >
                  插入图片
                </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="online" className="space-y-4 pt-4">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="image-url">
                  图片地址 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="image-width-online">显示宽度</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image-width-online"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={widthUnit} onValueChange={setWidthUnit}>
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image-caption-online">图片标注 (可选)</Label>
                  <Input
                    id="image-caption-online"
                    placeholder="输入标注..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
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
                <Button type="submit" disabled={!imageUrl.trim()}>
                  插入图片
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
