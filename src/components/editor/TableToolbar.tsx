import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Minus,
  Palette,
  Grid3x3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TableToolbarProps {
  onTableAction: (action: string, data?: any) => void;
  hasSelectedCells: boolean;
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529',
  '#f44336', '#ff5252', '#ff8a80', '#e91e63', '#ff4081', '#ff80ab', '#9c27b0', '#e040fb', '#ea80fc', '#673ab7', '#7c4dff', '#b388ff',
  '#3f51b5', '#536dfe', '#8c9eff', '#2196f3', '#448aff', '#82b1ff', '#03a9f4', '#40c4ff', '#80d8ff', '#00bcd4', '#18ffff', '#84ffff',
  '#009688', '#64ffda', '#a7ffeb', '#4caf50', '#69f0ae', '#b9f6ca', '#8bc34a', '#b2ff59', '#ccff90', '#cddc39', '#eeff41', '#f4ff81',
  '#ffeb3b', '#ffff00', '#ffff8d', '#ffc107', '#ffd740', '#ffe57f', '#ff9800', '#ffab40', '#ffd180', '#ff5722', '#ff6e40', '#ff9e80',
  '#795548', '#607d8b', '#4361ee', '#3f37c9', '#4895ef', '#4cc9f0'
];

export function TableToolbar({ onTableAction, hasSelectedCells }: TableToolbarProps) {
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  return (
    <div className="flex items-center gap-1">
      {/* 插入行列 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="插入行列"
            disabled={!hasSelectedCells}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onTableAction('insertRowAbove')}>
            在上方插入行
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTableAction('insertRowBelow')}>
            在下方插入行
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onTableAction('insertColumnLeft')}>
            在左侧插入列
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTableAction('insertColumnRight')}>
            在右侧插入列
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除行列 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="删除行列"
            disabled={!hasSelectedCells}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onTableAction('deleteRow')}>
            删除行
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTableAction('deleteColumn')}>
            删除列
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onTableAction('deleteTable')}
            className="text-destructive"
          >
            删除表格
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 表格颜色 */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="表格颜色"
            disabled={!hasSelectedCells}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-64 p-3" 
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // 允许点击颜色块时不关闭菜单
            const target = e.target as HTMLElement;
            if (target.closest('.color-picker-area')) {
              e.preventDefault();
            }
          }}
        >
          <div className="space-y-4 color-picker-area">
            {/* 背景颜色 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                背景颜色
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-1 border border-border rounded-md bg-muted/20">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={`bg-${color}`}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-sm border border-border/50 transition-transform hover:scale-110 cursor-pointer",
                      bgColor === color && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setBgColor(color);
                      onTableAction('backgroundColor', color);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBgColor(e.target.value);
                    onTableAction('backgroundColor', e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-10 h-8 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBgColor(e.target.value);
                    onTableAction('backgroundColor', e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex-1 h-8 px-2 text-xs font-mono border border-border rounded bg-background"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* 文字颜色 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                文字颜色
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-1 border border-border rounded-md bg-muted/20">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={`text-${color}`}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-sm border border-border/50 transition-transform hover:scale-110 cursor-pointer",
                      textColor === color && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTextColor(color);
                      onTableAction('textColor', color);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTextColor(e.target.value);
                    onTableAction('textColor', e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-10 h-8 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTextColor(e.target.value);
                    onTableAction('textColor', e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex-1 h-8 px-2 text-xs font-mono border border-border rounded bg-background"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 边框样式 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="边框样式"
            disabled={!hasSelectedCells}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onTableAction('borderStyle', 'solid')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-foreground" />
              <span>实线</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTableAction('borderStyle', 'dashed')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-foreground border-t-2 border-dashed border-foreground" />
              <span>虚线</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTableAction('borderStyle', 'dotted')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-foreground border-t-2 border-dotted border-foreground" />
              <span>点线</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTableAction('borderStyle', 'double')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 border-y-2 border-double border-foreground" />
              <span>双线</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
