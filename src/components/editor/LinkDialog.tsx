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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Link, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface LinkData {
  url: string;
  text: string;
  type: 'text' | 'card';
  title?: string;
  description?: string;
  image?: string;
}

interface LinkDialogProps {
  onInsertLink: (linkData: LinkData) => void;
  onOpenChange?: (open: boolean) => void;
  editMode?: boolean;
  initialData?: Partial<LinkData>;
  trigger?: React.ReactNode;
}

export function LinkDialog({ onInsertLink, onOpenChange: externalOnOpenChange, editMode = false, initialData, trigger }: LinkDialogProps) {
  const [open, setOpen] = useState(editMode); // 编辑模式默认打开
  const [linkType, setLinkType] = useState<'text' | 'card'>(initialData?.type || 'text');
  const [url, setUrl] = useState(initialData?.url || '');
  const [text, setText] = useState(initialData?.text || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 当编辑模式和初始数据变化时,自动打开对话框
  useEffect(() => {
    if (editMode && initialData) {
      setOpen(true);
    }
  }, [editMode, initialData]);

  // 自动获取网页信息
  const handleAutoFetch = async () => {
    if (!url.trim()) {
      toast({
        title: '提示',
        description: '请先输入链接地址',
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
        description: '请输入有效的URL地址',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 尝试多个CORS代理服务，确保中文编码正确
      let htmlContent = '';
      let success = false;
      
      // 代理列表（按优先级排序）
      const proxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
      ];
      
      // 尝试每个代理
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl + encodeURIComponent(url), {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            }
          });
          
          if (response.ok) {
            // 获取响应的字节数据
            const buffer = await response.arrayBuffer();
            
            // 尝试使用UTF-8解码
            const decoder = new TextDecoder('utf-8');
            htmlContent = decoder.decode(buffer);
            
            // 检查是否有乱码（简单检测）
            if (!htmlContent.includes('�')) {
              success = true;
              break;
            }
            
            // 如果UTF-8失败，尝试GBK（中文网站常用）
            try {
              const gbkDecoder = new TextDecoder('gbk');
              htmlContent = gbkDecoder.decode(buffer);
              success = true;
              break;
            } catch (e) {
              // GBK解码失败，继续尝试下一个代理
              continue;
            }
          }
        } catch (e) {
          // 当前代理失败，尝试下一个
          continue;
        }
      }
      
      if (!success || !htmlContent) {
        throw new Error('所有代理都无法获取网页内容');
      }

      // 创建临时DOM来解析HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // 获取标题
      let pageTitle = '';
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
      const titleTag = doc.querySelector('title');
      
      if (ogTitle) {
        pageTitle = ogTitle.getAttribute('content') || '';
      } else if (twitterTitle) {
        pageTitle = twitterTitle.getAttribute('content') || '';
      } else if (titleTag) {
        pageTitle = titleTag.textContent || '';
      }

      // 获取描述
      let pageDescription = '';
      const ogDescription = doc.querySelector('meta[property="og:description"]');
      const twitterDescription = doc.querySelector('meta[name="twitter:description"]');
      const metaDescription = doc.querySelector('meta[name="description"]');
      
      if (ogDescription) {
        pageDescription = ogDescription.getAttribute('content') || '';
      } else if (twitterDescription) {
        pageDescription = twitterDescription.getAttribute('content') || '';
      } else if (metaDescription) {
        pageDescription = metaDescription.getAttribute('content') || '';
      }

      // 获取图片
      let pageImage = '';
      const ogImage = doc.querySelector('meta[property="og:image"]');
      const twitterImage = doc.querySelector('meta[name="twitter:image"]');
      const linkIcon = doc.querySelector('link[rel="icon"]') || doc.querySelector('link[rel="shortcut icon"]');
      const appleTouchIcon = doc.querySelector('link[rel="apple-touch-icon"]');
      
      if (ogImage) {
        pageImage = ogImage.getAttribute('content') || '';
      } else if (twitterImage) {
        pageImage = twitterImage.getAttribute('content') || '';
      } else if (appleTouchIcon) {
        // 使用Apple Touch Icon作为备选
        pageImage = appleTouchIcon.getAttribute('href') || '';
      } else if (linkIcon) {
        // 使用favicon作为备选
        pageImage = linkIcon.getAttribute('href') || '';
      } else {
        // 尝试使用默认的favicon路径
        try {
          const urlObj = new URL(url);
          pageImage = `${urlObj.origin}/favicon.ico`;
        } catch (e) {
          // 忽略URL解析错误
        }
      }

      // 如果图片URL是相对路径，转换为绝对路径
      if (pageImage && !pageImage.startsWith('http') && !pageImage.startsWith('data:')) {
        const urlObj = new URL(url);
        if (pageImage.startsWith('//')) {
          pageImage = urlObj.protocol + pageImage;
        } else if (pageImage.startsWith('/')) {
          pageImage = urlObj.origin + pageImage;
        } else {
          pageImage = urlObj.origin + '/' + pageImage;
        }
      }

      // 更新表单字段
      if (pageTitle) setTitle(pageTitle);
      if (pageDescription) setDescription(pageDescription);
      if (pageImage) setImage(pageImage);

      toast({
        title: '成功',
        description: '已自动获取网页信息',
      });
    } catch (error) {
      console.error('获取网页信息失败:', error);
      toast({
        title: '获取失败',
        description: '无法自动获取网页信息，请手动填写。可能是由于网站限制或网络问题。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      return;
    }

    const linkData: LinkData = {
      url: url.trim(),
      text: text.trim() || url.trim(),
      type: linkType,
    };

    if (linkType === 'card') {
      linkData.title = title.trim() || text.trim() || url.trim();
      linkData.description = description.trim();
      linkData.image = image.trim();
    }
    
    onInsertLink(linkData);
    
    // 重置表单并关闭对话框
    setUrl('');
    setText('');
    setTitle('');
    setDescription('');
    setImage('');
    setLinkType('text');
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // 通知父组件对话框状态变化
    if (externalOnOpenChange) {
      externalOnOpenChange(newOpen);
    }
    
    if (!newOpen) {
      // 关闭时重置表单(编辑模式不重置)
      if (!editMode) {
        setUrl('');
        setText('');
        setTitle('');
        setDescription('');
        setImage('');
        setLinkType('text');
      }
    } else {
      // 打开时,如果是编辑模式,加载初始数据
      if (editMode && initialData) {
        setLinkType(initialData.type || 'text');
        setUrl(initialData.url || '');
        setText(initialData.text || '');
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setImage(initialData.image || '');
      }
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
          <Button variant="ghost" size="icon" title="插入链接">
            <Link className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editMode ? '编辑链接' : '插入链接'}</DialogTitle>
            <DialogDescription>
              选择链接类型并填写相关信息。文本链接为简单的超链接，卡片链接会显示为精美的卡片样式。
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 链接类型选择 */}
            <div className="grid gap-2">
              <Label>链接类型</Label>
              <RadioGroup value={linkType} onValueChange={(value) => setLinkType(value as 'text' | 'card')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="type-text" />
                  <Label htmlFor="type-text" className="font-normal cursor-pointer">
                    文本链接（传统超链接样式）
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="type-card" />
                  <Label htmlFor="type-card" className="font-normal cursor-pointer">
                    卡片链接（精美卡片样式）
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 链接地址 */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="link-url">
                  链接地址 <span className="text-destructive">*</span>
                </Label>
                {linkType === 'card' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFetch}
                    disabled={isLoading || !url.trim()}
                    className="h-7 text-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        获取中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1 h-3 w-3" />
                        自动获取
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              {linkType === 'card' && (
                <p className="text-xs text-muted-foreground">
                  输入链接后点击"自动获取"按钮，系统将尝试自动填充标题、描述和图片
                </p>
              )}
            </div>
            
            {/* 文本链接的字段 */}
            {linkType === 'text' && (
              <div className="grid gap-2">
                <Label htmlFor="link-text">显示文本</Label>
                <Input
                  id="link-text"
                  placeholder="链接文字（留空则使用链接地址）"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            )}

            {/* 卡片链接的字段 */}
            {linkType === 'card' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="card-title">
                    卡片标题 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="card-title"
                    placeholder="输入卡片标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="card-description">卡片描述</Label>
                  <Textarea
                    id="card-description"
                    placeholder="输入卡片描述（可选）"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="card-image">卡片图片URL</Label>
                  <Input
                    id="card-image"
                    placeholder="https://example.com/image.jpg（可选）"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              {editMode ? '保存修改' : '插入链接'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
