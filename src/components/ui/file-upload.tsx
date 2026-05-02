import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface FileUploadProps {
  accept?: string;
  onChange: (file: File) => void;
  value?: string;
  onRemove?: () => void;
  previewType?: 'image' | 'icon';
  buttonText?: string;
  className?: string;
}

export function FileUpload({
  accept = 'image/*',
  onChange,
  value,
  onRemove,
  previewType = 'image',
  buttonText = '选择文件',
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onChange(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 上传按钮区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              {buttonText}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              或拖拽文件到此处
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 预览区域 */}
      {value && (
        <div className={`relative rounded overflow-hidden ${
          previewType === 'icon' 
            ? 'flex items-center gap-2 p-2 bg-muted' 
            : 'h-24'
        }`}>
          <img
            src={value}
            alt="预览"
            className={
              previewType === 'icon'
                ? 'w-8 h-8 object-contain'
                : 'w-full h-full object-cover'
            }
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className={
                previewType === 'icon'
                  ? ''
                  : 'absolute top-2 right-2'
              }
            >
              <X className="h-4 w-4 mr-1" />
              移除
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
