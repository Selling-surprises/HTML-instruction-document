import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/ui/file-upload';
import type { EditorSettings } from '@/types/editor';
import { Download, FileJson, Upload, FileText } from 'lucide-react';
import { useState } from 'react';

interface SettingsPanelProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  onExport: () => void;
  onExportJSON?: () => void;
  onExportMarkdown?: () => void;
  onImportJSON?: () => void;
  onImportHTML?: () => void;
  onImportMarkdown?: () => void;
}
const PRESET_TOC_COLORS = [
  { color: '#4361ee', name: '经典蓝' },
  { color: '#3f37c9', name: '深邃蓝' },
  { color: '#ef4444', name: '活力红' },
  { color: '#f59e0b', name: '温暖橙' },
  { color: '#10b981', name: '清新绿' },
  { color: '#8b5cf6', name: '优雅紫' },
  { color: '#ec4899', name: '浪漫粉' },
  { color: '#000000', name: '极简黑' },
  { color: '#64748b', name: '稳重灰' },
];


export function SettingsPanel({
  settings,
  onSettingsChange,
  onExport,
  onExportJSON,
  onExportMarkdown,
  onImportJSON,
  onImportHTML,
  onImportMarkdown,
}: SettingsPanelProps) {
  const [faviconUrl, setFaviconUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [mobileBackgroundUrl, setMobileBackgroundUrl] = useState('');

  const handleFileUpload = (
    type: 'favicon' | 'background' | 'mobileBackground',
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'favicon') {
        onSettingsChange({ favicon: result });
      } else if (type === 'background') {
        onSettingsChange({ backgroundImage: result });
      } else {
        onSettingsChange({ mobileBackgroundImage: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUrlSubmit = () => {
    if (faviconUrl.trim()) {
      onSettingsChange({ favicon: faviconUrl.trim() });
      setFaviconUrl('');
    }
  };

  const handleBackgroundUrlSubmit = () => {
    if (backgroundUrl.trim()) {
      onSettingsChange({ backgroundImage: backgroundUrl.trim() });
      setBackgroundUrl('');
    }
  };

  const handleMobileBackgroundUrlSubmit = () => {
    if (mobileBackgroundUrl.trim()) {
      onSettingsChange({ mobileBackgroundImage: mobileBackgroundUrl.trim() });
      setMobileBackgroundUrl('');
    }
  };

  return (
    <div className="space-y-6 p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="space-y-6">
        {/* 基本设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">基本设置</h3>
          
          {/* 网页标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">网页标题</Label>
            <Input
              id="title"
              value={settings.pageTitle}
              onChange={(e) => onSettingsChange({ pageTitle: e.target.value })}
              placeholder="智能文档"
            />
          </div>

          {/* 文档标题颜色 */}
          <div className="space-y-3">
            <Label>文档标题颜色</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              {PRESET_TOC_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => onSettingsChange({ pageTitleColor: item.color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                    settings.pageTitleColor === item.color ? 'border-primary shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                >
                  {settings.pageTitleColor === item.color && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
              <div className="flex items-center gap-2 w-full mt-2">
                <Input
                  type="color"
                  value={settings.pageTitleColor}
                  onChange={(e) => onSettingsChange({ pageTitleColor: e.target.value })}
                  className="w-10 h-8 p-0 border-none bg-transparent"
                />
                <Input
                  type="text"
                  value={settings.pageTitleColor}
                  onChange={(e) => onSettingsChange({ pageTitleColor: e.target.value })}
                  className="flex-1 h-8 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              修改右侧内容区顶部文档标题及正文标题颜色
            </p>
          </div>

          {/* 侧边栏背景颜色 */}
          <div className="space-y-3">
            <Label>侧边栏背景颜色</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              {PRESET_TOC_COLORS.map((item) => (
                <button
                  key={item.color}
                  onClick={() => onSettingsChange({ sidebarBackgroundColor: item.color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                    settings.sidebarBackgroundColor === item.color ? 'border-primary shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                >
                  {settings.sidebarBackgroundColor === item.color && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
              <div className="flex items-center gap-2 w-full mt-2">
                <Input
                  type="color"
                  value={settings.sidebarBackgroundColor}
                  onChange={(e) => onSettingsChange({ sidebarBackgroundColor: e.target.value })}
                  className="w-10 h-8 p-0 border-none bg-transparent"
                />
                <Input
                  type="text"
                  value={settings.sidebarBackgroundColor}
                  onChange={(e) => onSettingsChange({ sidebarBackgroundColor: e.target.value })}
                  className="flex-1 h-8 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* 侧边栏文字颜色 */}
          <div className="space-y-3">
            <Label>侧边栏文字颜色</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              {[
                { color: '#ffffff', name: '纯白' },
                { color: '#f8fafc', name: '浅灰白' },
                { color: '#e2e8f0', name: '亮灰' },
                { color: '#94a3b8', name: '中灰' },
                { color: '#475569', name: '深灰' },
                { color: '#1e293b', name: '藏青' },
                { color: '#000000', name: '纯黑' },
              ].map((item) => (
                <button
                  key={item.color}
                  onClick={() => onSettingsChange({ sidebarTextColor: item.color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                    settings.sidebarTextColor === item.color ? 'border-primary shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                >
                  {settings.sidebarTextColor === item.color && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
              <div className="flex items-center gap-2 w-full mt-2">
                <Input
                  type="color"
                  value={settings.sidebarTextColor}
                  onChange={(e) => onSettingsChange({ sidebarTextColor: e.target.value })}
                  className="w-10 h-8 p-0 border-none bg-transparent"
                />
                <Input
                  type="text"
                  value={settings.sidebarTextColor}
                  onChange={(e) => onSettingsChange({ sidebarTextColor: e.target.value })}
                  className="flex-1 h-8 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Favicon图标上传 */}
          <div className="space-y-2">
            <Label>Favicon图标</Label>
            <Tabs defaultValue="local" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="local">本地上传</TabsTrigger>
                <TabsTrigger value="online">在线图片</TabsTrigger>
              </TabsList>
              
              <TabsContent value="local" className="space-y-2">
                <FileUpload
                  accept="image/*"
                  onChange={(file) => handleFileUpload('favicon', file)}
                  value={settings.favicon}
                  onRemove={() => onSettingsChange({ favicon: '' })}
                  previewType="icon"
                  buttonText="选择图标"
                />
              </TabsContent>
              
              <TabsContent value="online" className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/icon.png"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                  />
                  <Button onClick={handleFaviconUrlSubmit} disabled={!faviconUrl.trim()}>
                    确定
                  </Button>
                </div>
                {settings.favicon && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <img
                      src={settings.favicon}
                      alt="Favicon"
                      className="w-8 h-8 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onSettingsChange({ favicon: '' })}
                    >
                      移除
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 背景设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">背景设置</h3>
          
          {/* 桌面端背景图片 */}
          <div className="space-y-2">
            <Label>桌面端背景图片</Label>
            <Tabs defaultValue="local" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="local">本地上传</TabsTrigger>
                <TabsTrigger value="online">在线图片</TabsTrigger>
              </TabsList>
              
              <TabsContent value="local" className="space-y-2">
                <FileUpload
                  accept="image/*"
                  onChange={(file) => handleFileUpload('background', file)}
                  value={settings.backgroundImage}
                  onRemove={() => onSettingsChange({ backgroundImage: '' })}
                  previewType="image"
                  buttonText="选择背景图片"
                />
              </TabsContent>
              
              <TabsContent value="online" className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/bg.jpg"
                    value={backgroundUrl}
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                  />
                  <Button onClick={handleBackgroundUrlSubmit} disabled={!backgroundUrl.trim()}>
                    确定
                  </Button>
                </div>
                {settings.backgroundImage && (
                  <div className="relative h-24 rounded overflow-hidden">
                    <img
                      src={settings.backgroundImage}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onSettingsChange({ backgroundImage: '' })}
                      className="absolute top-2 right-2"
                    >
                      移除
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              背景图片将显示在文档内容区域（推荐尺寸：1920x1080）
            </p>
          </div>

          {/* 不透明度调整 */}
          <div className="space-y-2">
            <Label htmlFor="opacity">
              内容不透明度: {settings.opacity}%
            </Label>
            <Slider
              id="opacity"
              min={0}
              max={100}
              step={1}
              value={[settings.opacity]}
              onValueChange={(value) => onSettingsChange({ opacity: value[0] })}
            />
            <p className="text-xs text-muted-foreground">
              调整不透明度可以让背景图片更清晰可见(100%为完全不透明)
            </p>
          </div>

          {/* 黑色遮罩开关 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="black-mask" className="text-base font-medium cursor-pointer">
                  使用黑色遮罩
                </Label>
                <p className="text-xs text-muted-foreground">
                  切换为黑色半透明遮罩,文字自动变为白色
                </p>
              </div>
              <Switch
                id="black-mask"
                checked={settings.useBlackMask}
                onCheckedChange={(checked) => onSettingsChange({ useBlackMask: checked })}
              />
            </div>

            {/* 黑色遮罩说明 */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                💡 提示:{settings.useBlackMask ? '当前使用黑色遮罩,适合浅色背景图片' : '当前使用白色遮罩,适合深色背景图片'}
              </p>
            </div>
          </div>

          {/* 毛玻璃效果 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="glass-effect" className="text-base font-medium cursor-pointer">
                  启用毛玻璃效果
                </Label>
                <p className="text-xs text-muted-foreground">
                  为内容区域添加模糊背景效果
                </p>
              </div>
              <Switch
                id="glass-effect"
                checked={settings.enableGlassEffect}
                onCheckedChange={(checked) => onSettingsChange({ enableGlassEffect: checked })}
              />
            </div>

            {/* 模糊程度调整（仅在开启时显示） */}
            {settings.enableGlassEffect && (
              <div className="space-y-2 pl-3 border-l-2 border-primary/30">
                <Label htmlFor="glass-blur">
                  模糊程度: {settings.glassBlur}px
                </Label>
                <Slider
                  id="glass-blur"
                  min={0}
                  max={30}
                  step={1}
                  value={[settings.glassBlur]}
                  onValueChange={(value) => onSettingsChange({ glassBlur: value[0] })}
                />
                <p className="text-xs text-muted-foreground">
                  调整模糊程度以获得最佳视觉效果（推荐：10-20px）
                </p>
              </div>
            )}

            {/* 毛玻璃效果说明 */}
            {!settings.enableGlassEffect && (
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  💡 提示：开启毛玻璃效果后，内容区域将呈现半透明模糊背景，让文档更具现代感
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 移动端设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">移动端设置</h3>
          
          {/* 移动端适配开关 */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="mobile-adaptation" className="text-base font-medium cursor-pointer">
                启用移动端适配
              </Label>
              <p className="text-xs text-muted-foreground">
                导出的HTML文件将针对移动设备进行优化
              </p>
            </div>
            <Switch
              id="mobile-adaptation"
              checked={settings.enableMobileAdaptation}
              onCheckedChange={(checked) => 
                onSettingsChange({ enableMobileAdaptation: checked })
              }
            />
          </div>

          {/* 移动端背景图片 */}
          {settings.enableMobileAdaptation && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              <Label>移动端背景图片（可选）</Label>
              <Tabs defaultValue="local" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="local">本地上传</TabsTrigger>
                  <TabsTrigger value="online">在线图片</TabsTrigger>
                </TabsList>
                
                <TabsContent value="local" className="space-y-2">
                  <FileUpload
                    accept="image/*"
                    onChange={(file) => handleFileUpload('mobileBackground', file)}
                    value={settings.mobileBackgroundImage}
                    onRemove={() => onSettingsChange({ mobileBackgroundImage: '' })}
                    previewType="image"
                    buttonText="选择移动端背景"
                  />
                </TabsContent>
                
                <TabsContent value="online" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/mobile-bg.jpg"
                      value={mobileBackgroundUrl}
                      onChange={(e) => setMobileBackgroundUrl(e.target.value)}
                    />
                    <Button 
                      onClick={handleMobileBackgroundUrlSubmit} 
                      disabled={!mobileBackgroundUrl.trim()}
                    >
                      确定
                    </Button>
                  </div>
                  {settings.mobileBackgroundImage && (
                    <div className="relative h-24 rounded overflow-hidden">
                      <img
                        src={settings.mobileBackgroundImage}
                        alt="Mobile Background"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onSettingsChange({ mobileBackgroundImage: '' })}
                        className="absolute top-2 right-2"
                      >
                        移除
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                移动端背景图片将在屏幕宽度≤768px时显示（留空则使用桌面端背景，推荐尺寸：1080x1920）
              </p>
            </div>
          )}

          {/* 移动端适配说明 */}
          {!settings.enableMobileAdaptation && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                💡 关闭移动端适配后，导出的HTML将使用桌面端样式，不会针对移动设备进行优化。
              </p>
            </div>
          )}
        </div>

        {/* 导出设置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">导出设置</h3>
          
          {/* 原文链接设置 */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="source-link" className="text-base font-medium cursor-pointer">
                显示原文链接
              </Label>
              <p className="text-xs text-muted-foreground">
                在导出HTML底部显示原文来源链接，尊重知识产权
              </p>
            </div>
            <Switch
              id="source-link"
              checked={settings.enableSourceLink}
              onCheckedChange={(checked) => onSettingsChange({ enableSourceLink: checked })}
            />
          </div>

          {settings.enableSourceLink && (
            <div className="space-y-1.5 px-1">
              <Label htmlFor="source-url" className="text-sm font-normal">
                原文链接地址
              </Label>
              <Input
                id="source-url"
                placeholder="https://example.com/original-article"
                value={settings.sourceUrl || ''}
                onChange={(e) => onSettingsChange({ sourceUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                填写原始文章或内容来源的完整URL
              </p>
            </div>
          )}

          {/* 回到顶部/底部设置 */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="scroll-buttons" className="text-base font-medium cursor-pointer">
                启用回到顶部/底部
              </Label>
              <p className="text-xs text-muted-foreground">
                在页面右侧显示跳转到页面顶部和底部的悬浮按钮
              </p>
            </div>
            <Switch
              id="scroll-buttons"
              checked={settings.enableScrollButtons}
              onCheckedChange={(checked) => onSettingsChange({ enableScrollButtons: checked })}
            />
          </div>

          {/* 导出HTML文件 */}
          <Button onClick={onExport} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            导出为HTML文件
          </Button>
          
          {/* 导入HTML按钮 - 在导出HTML下方，大小一致 */}
          {onImportHTML && (
            <Button 
              onClick={onImportHTML} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              导入HTML文件
            </Button>
          )}
          
          {/* 导入JSON和导出JSON按钮 - 左右并排，大小一致 */}
          <div className="grid grid-cols-2 gap-2">
            {onImportJSON && (
              <Button 
                onClick={onImportJSON} 
                variant="outline" 
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                导入JSON
              </Button>
            )}
            
            {onExportJSON && (
              <Button 
                onClick={onExportJSON} 
                variant="outline" 
                className="w-full"
              >
                <FileJson className="h-4 w-4 mr-2" />
                导出JSON
              </Button>
            )}
          </div>
          
          {/* 导入Markdown和导出Markdown按钮 - 左右并排，大小一致 */}
          <div className="grid grid-cols-2 gap-2">
            {onImportMarkdown && (
              <Button 
                onClick={onImportMarkdown} 
                variant="outline" 
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                导入Markdown
              </Button>
            )}
            
            {onExportMarkdown && (
              <Button 
                onClick={onExportMarkdown} 
                variant="outline" 
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                导出Markdown
              </Button>
            )}
          </div>
          
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 <strong>HTML导入</strong>：可以导入之前导出的HTML文件，自动提取内容和设置
            </p>
            <p className="text-xs text-muted-foreground">
              💡 <strong>JSON导出</strong>：保存文档内容和所有设置，方便下次继续编辑
            </p>
            <p className="text-xs text-muted-foreground">
              💡 <strong>Markdown导入/导出</strong>：支持本地图片（base64格式）、表格、代码块等，可在各种Markdown编辑器中使用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
