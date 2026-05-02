import { FileText, Type, Hash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EditorStatusBarProps {
  characterCount: number;
  wordCount: number;
  currentFont?: string;
  currentFontSize?: string;
  currentHeadingLevel?: string;
}

export function EditorStatusBar({ 
  characterCount, 
  wordCount, 
  currentFont, 
  currentFontSize, 
  currentHeadingLevel 
}: EditorStatusBarProps) {
  return (
    <div className="bg-card/95 backdrop-blur-md border-t border-border px-4 py-2.5 flex items-center justify-between text-xs md:text-sm shadow-sm">
      <div className="flex items-center gap-3 md:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{characterCount}</span> 字符
          </span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{wordCount}</span> 字
          </span>
        </div>
        
        {(currentFont || currentFontSize || currentHeadingLevel) && (
          <>
            <Separator orientation="vertical" className="h-4 hidden md:block" />
            
            <div className="flex items-center gap-3 text-muted-foreground hidden md:flex">
              {currentFont && (
                <div className="flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">{currentFont}</span>
                </div>
              )}
              {currentFontSize && (
                <span className="text-muted-foreground">
                  {currentFontSize}
                </span>
              )}
              {currentHeadingLevel && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium">
                  {currentHeadingLevel}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground hidden sm:block">
        <span className="text-muted-foreground">HTML说明文档制作工具</span>
      </div>
    </div>
  );
}
