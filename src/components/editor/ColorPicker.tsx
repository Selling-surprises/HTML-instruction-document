import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  icon: React.ReactNode;
  title: string;
}

const PRESET_COLORS = [
  { name: '黑色', value: '#000000' },
  { name: '白色', value: '#FFFFFF' },
  { name: '深灰', value: '#4B5563' },
  { name: '灰色', value: '#9CA3AF' },
  { name: '浅灰', value: '#D1D5DB' },
  { name: '红色', value: '#EF4444' },
  { name: '橙色', value: '#F97316' },
  { name: '黄色', value: '#EAB308' },
  { name: '绿色', value: '#22C55E' },
  { name: '青色', value: '#06B6D4' },
  { name: '蓝色', value: '#3B82F6' },
  { name: '紫色', value: '#A855F7' },
  { name: '粉色', value: '#EC4899' },
  { name: '深红', value: '#DC2626' },
  { name: '深橙', value: '#EA580C' },
  { name: '深黄', value: '#CA8A04' },
  { name: '深绿', value: '#16A34A' },
  { name: '深青', value: '#0891B2' },
  { name: '深蓝', value: '#2563EB' },
  { name: '深紫', value: '#9333EA' },
  { name: '深粉', value: '#DB2777' },
];

export function ColorPicker({ onColorSelect, icon, title }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title={title}>
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{title}</h4>
          
          {/* 预设颜色 */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorSelect(color.value)}
                className="w-10 h-10 rounded border-2 hover:border-primary transition-smooth"
                style={{ 
                  backgroundColor: color.value,
                  borderColor: color.value === '#FFFFFF' ? '#D1D5DB' : 'hsl(var(--border))'
                }}
                title={color.name}
              />
            ))}
          </div>

          {/* 自定义颜色 */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-muted-foreground">自定义颜色:</span>
              <input
                type="color"
                onChange={(e) => onColorSelect(e.target.value)}
                className="w-12 h-8 rounded border border-border cursor-pointer"
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
