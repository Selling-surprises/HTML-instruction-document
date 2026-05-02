import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ParagraphDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (settings: ParagraphSettings) => void;
  initialSettings?: Partial<ParagraphSettings>;
}

export interface ParagraphSettings {
  // 缩进
  leftIndent: number;
  rightIndent: number;
  specialIndent: 'none' | 'first-line' | 'hanging';
  specialIndentValue: number;
  
  // 间距
  spaceBefore: number;
  spaceAfter: number;
  lineSpacing: 'single' | '1.5' | 'double' | 'fixed' | 'multiple';
  lineSpacingValue: number;
  
  // 对齐
  alignment: 'left' | 'center' | 'right' | 'justify';
}

const defaultSettings: ParagraphSettings = {
  leftIndent: 0,
  rightIndent: 0,
  specialIndent: 'none',
  specialIndentValue: 2,
  spaceBefore: 1,
  spaceAfter: 1,
  lineSpacing: 'single',
  lineSpacingValue: 1,
  alignment: 'left'
};

export function ParagraphDialog({ open, onClose, onApply, initialSettings }: ParagraphDialogProps) {
  const [settings, setSettings] = useState<ParagraphSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  const handleApply = () => {
    onApply(settings);
    onClose();
  };

  const updateSetting = <K extends keyof ParagraphSettings>(
    key: K,
    value: ParagraphSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>段落</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="indent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="indent">缩进和间距</TabsTrigger>
            <TabsTrigger value="alignment">对齐方式</TabsTrigger>
          </TabsList>

          <TabsContent value="indent" className="space-y-6 mt-4">
            {/* 缩进 */}
            <div className="space-y-4 border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium bg-muted px-3 py-1 -mx-4 -mt-4 mb-4 rounded-t-lg">
                缩进
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leftIndent">左侧(L):</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="leftIndent"
                      type="number"
                      value={settings.leftIndent}
                      onChange={(e) => updateSetting('leftIndent', Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">字符</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rightIndent">右侧(R):</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="rightIndent"
                      type="number"
                      value={settings.rightIndent}
                      onChange={(e) => updateSetting('rightIndent', Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">字符</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialIndent">特殊格式(S):</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={settings.specialIndent}
                    onValueChange={(value: any) => updateSetting('specialIndent', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">(无)</SelectItem>
                      <SelectItem value="first-line">首行缩进</SelectItem>
                      <SelectItem value="hanging">悬挂缩进</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {settings.specialIndent !== 'none' && (
                    <>
                      <Input
                        type="number"
                        value={settings.specialIndentValue}
                        onChange={(e) => updateSetting('specialIndentValue', Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">字符</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 间距 */}
            <div className="space-y-4 border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium bg-muted px-3 py-1 -mx-4 -mt-4 mb-4 rounded-t-lg">
                间距
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spaceBefore">段前(B):</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="spaceBefore"
                      type="number"
                      value={settings.spaceBefore}
                      onChange={(e) => updateSetting('spaceBefore', Number(e.target.value))}
                      className="w-20"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">行</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spaceAfter">段后(A):</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="spaceAfter"
                      type="number"
                      value={settings.spaceAfter}
                      onChange={(e) => updateSetting('spaceAfter', Number(e.target.value))}
                      className="w-20"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">行</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineSpacing">行距(N):</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={settings.lineSpacing}
                    onValueChange={(value: any) => updateSetting('lineSpacing', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">单倍行距</SelectItem>
                      <SelectItem value="1.5">1.5 倍行距</SelectItem>
                      <SelectItem value="double">2 倍行距</SelectItem>
                      <SelectItem value="fixed">固定值</SelectItem>
                      <SelectItem value="multiple">多倍行距</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(settings.lineSpacing === 'fixed' || settings.lineSpacing === 'multiple') && (
                    <Input
                      type="number"
                      value={settings.lineSpacingValue}
                      onChange={(e) => updateSetting('lineSpacingValue', Number(e.target.value))}
                      className="w-20"
                      step="0.1"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 预览 */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <h3 className="text-sm font-medium mb-2">预览</h3>
              <div 
                className="bg-card p-4 rounded border border-border text-sm"
                style={{
                  textAlign: settings.alignment,
                  paddingLeft: `${settings.leftIndent * 16}px`,
                  paddingRight: `${settings.rightIndent * 16}px`,
                  textIndent: settings.specialIndent === 'first-line' 
                    ? `${settings.specialIndentValue * 16}px` 
                    : settings.specialIndent === 'hanging'
                    ? `-${settings.specialIndentValue * 16}px`
                    : '0',
                  marginTop: `${settings.spaceBefore * 1.5}em`,
                  marginBottom: `${settings.spaceAfter * 1.5}em`,
                  lineHeight: settings.lineSpacing === 'single' ? '1.5'
                    : settings.lineSpacing === '1.5' ? '1.8'
                    : settings.lineSpacing === 'double' ? '2'
                    : settings.lineSpacing === 'multiple' ? `${settings.lineSpacingValue}`
                    : `${settings.lineSpacingValue}px`
                }}
              >
                这是一段示例文本，用于预览段落格式设置的效果。您可以看到缩进、间距和行距的变化。
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alignment" className="space-y-4 mt-4">
            <div className="space-y-4 border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium bg-muted px-3 py-1 -mx-4 -mt-4 mb-4 rounded-t-lg">
                对齐方式
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={settings.alignment === 'left' ? 'default' : 'outline'}
                  onClick={() => updateSetting('alignment', 'left')}
                  className="justify-start"
                >
                  左对齐
                </Button>
                <Button
                  variant={settings.alignment === 'center' ? 'default' : 'outline'}
                  onClick={() => updateSetting('alignment', 'center')}
                  className="justify-start"
                >
                  居中
                </Button>
                <Button
                  variant={settings.alignment === 'right' ? 'default' : 'outline'}
                  onClick={() => updateSetting('alignment', 'right')}
                  className="justify-start"
                >
                  右对齐
                </Button>
                <Button
                  variant={settings.alignment === 'justify' ? 'default' : 'outline'}
                  onClick={() => updateSetting('alignment', 'justify')}
                  className="justify-start"
                >
                  两端对齐
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleApply}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
