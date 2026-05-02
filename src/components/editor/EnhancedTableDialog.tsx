import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedTableDialogProps {
  onInsertTable: (rows: number, cols: number, data: string[][]) => void;
}

export function EnhancedTableDialog({ onInsertTable }: EnhancedTableDialogProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>([]);
  const { toast } = useToast();

  // 当行列变化时初始化表格数据
  useEffect(() => {
    const newData = Array.from({ length: rows }, (_, r) => 
      Array.from({ length: cols }, (_, c) => 
        tableData[r]?.[c] || ''
      )
    );
    setTableData(newData);
  }, [rows, cols]);

  const handleCellChange = (r: number, c: number, value: string) => {
    const newData = [...tableData];
    if (!newData[r]) newData[r] = [];
    newData[r][c] = value;
    setTableData(newData);
  };

  const handleInsert = () => {
    if (rows < 1 || rows > 20) {
      toast({
        title: '错误',
        description: '行数必须在1-20之间',
        variant: 'destructive',
      });
      return;
    }

    if (cols < 1 || cols > 10) {
      toast({
        title: '错误',
        description: '列数必须在1-10之间',
        variant: 'destructive',
      });
      return;
    }

    onInsertTable(rows, cols, tableData);
    setOpen(false);
    
    toast({
      title: '成功',
      description: '表格已插入',
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="插入表格"
        onClick={() => setOpen(true)}
      >
        <Table2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[800px] max-h-[90dvh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle>插入专业表格</DialogTitle>
              <DialogDescription>
                设置表格结构并填写初始内容，将以专业 HTML 格式插入到文档中
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="rows" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">行数 (1-20)</Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cols" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">列数 (1-10)</Label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-6 pt-2 min-h-[300px]">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">填写表格内容 (首行为表头)</Label>
            <ScrollArea className="h-full border rounded-md bg-muted/30">
              <div className="p-4">
                <div 
                  className="grid gap-px bg-border border border-border rounded-sm overflow-hidden"
                  style={{ 
                    gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))` 
                  }}
                >
                  {Array.from({ length: rows }).map((_, r) => (
                    Array.from({ length: cols }).map((_, c) => (
                      <div key={`${r}-${c}`} className="bg-background">
                        <Input
                          value={tableData[r]?.[c] || ''}
                          onChange={(e) => handleCellChange(r, c, e.target.value)}
                          placeholder={r === 0 ? `标题 ${c + 1}` : `数据`}
                          className={`border-none rounded-none focus-visible:ring-1 focus-visible:ring-primary h-10 px-3 text-sm ${r === 0 ? 'font-bold bg-primary/5' : ''}`}
                        />
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 pt-2 border-t bg-muted/10">
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={handleInsert} className="bg-primary hover:bg-primary/90">插入专业表格</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
