import { useEffect, useState, RefObject, useImperativeHandle, forwardRef } from 'react';
import { EditorContentRef } from './EditorContent';
import { useToast } from '@/hooks/use-toast';

interface EnhancedTableToolbarProps {
  editorRef: RefObject<EditorContentRef | null>;
  onContentChange: (content: string) => void;
}

export interface EnhancedTableToolbarRef {
  getSelectedCells: () => HTMLTableCellElement[];
  handleTableAction: (action: string, data?: any) => void;
}

export const EnhancedTableToolbar = forwardRef<EnhancedTableToolbarRef, EnhancedTableToolbarProps>(
  ({ editorRef, onContentChange }, ref) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedCells, setSelectedCells] = useState<HTMLTableCellElement[]>([]);
  const [currentTable, setCurrentTable] = useState<HTMLTableElement | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<HTMLTableCellElement | null>(null);
  const { toast } = useToast();

  // 清除选择
  const clearSelection = () => {
    const editor = editorRef.current?.getElement();
    if (!editor) return;
    
    editor.querySelectorAll('td.selected, th.selected').forEach(cell => {
      cell.classList.remove('selected');
    });
    setSelectedCells([]);
  };

  // 选择单元格范围
  const selectRange = (start: HTMLTableCellElement, end: HTMLTableCellElement) => {
    const table = start.closest('table');
    if (!table) return;

    const cells = Array.from(table.querySelectorAll('td, th')) as HTMLTableCellElement[];
    const startIndex = cells.indexOf(start);
    const endIndex = cells.indexOf(end);

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    // 获取表格的行列信息
    const rows = Array.from(table.querySelectorAll('tr'));
    const startRow = start.parentElement as HTMLTableRowElement;
    const endRow = end.parentElement as HTMLTableRowElement;
    const startRowIndex = rows.indexOf(startRow);
    const endRowIndex = rows.indexOf(endRow);

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);

    const startCellIndex = Array.from(startRow.children).indexOf(start);
    const endCellIndex = Array.from(endRow.children).indexOf(end);
    const minCol = Math.min(startCellIndex, endCellIndex);
    const maxCol = Math.max(startCellIndex, endCellIndex);

    // 清除之前的选择
    clearSelection();

    // 选择范围内的所有单元格
    const selected: HTMLTableCellElement[] = [];
    for (let i = minRow; i <= maxRow; i++) {
      const row = rows[i];
      const rowCells = Array.from(row.children) as HTMLTableCellElement[];
      for (let j = minCol; j <= maxCol && j < rowCells.length; j++) {
        const cell = rowCells[j];
        cell.classList.add('selected');
        selected.push(cell);
      }
    }

    setSelectedCells(selected);
  };

  useEffect(() => {
    const editor = editorRef.current?.getElement();
    if (!editor) return;

    // 处理鼠标按下开始选择
    const handleMouseDown = (e: MouseEvent) => {
      // 忽略右键点击
      if (e.button === 2) return;
      
      const target = e.target as HTMLElement;
      const cell = target.closest('td, th') as HTMLTableCellElement;
      
      if (cell) {
        const table = cell.closest('table');
        if (!table) return;

        setCurrentTable(table as HTMLTableElement);

        // Ctrl/Cmd键多选模式
        if (e.ctrlKey || e.metaKey) {
          // 切换当前单元格的选中状态
          if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            setSelectedCells(prev => prev.filter(c => c !== cell));
          } else {
            cell.classList.add('selected');
            setSelectedCells(prev => [...prev, cell]);
          }
          return;
        }

        // 普通选择模式
        setIsSelecting(true);
        setSelectionStart(cell);

        clearSelection();
        cell.classList.add('selected');
        setSelectedCells([cell]);
      }
    };

    // 处理鼠标移动进行拖拽选择
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting || !selectionStart) return;

      const target = e.target as HTMLElement;
      const cell = target.closest('td, th') as HTMLTableCellElement;
      
      if (cell && cell.closest('table') === currentTable) {
        selectRange(selectionStart, cell);
      }
    };

    // 处理鼠标释放结束选择
    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    // 处理右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest('td, th') as HTMLTableCellElement;
      
      if (cell) {
        e.preventDefault();
        e.stopPropagation();
        
        const table = cell.closest('table') as HTMLTableElement;
        setCurrentTable(table);
        
        // 如果右键的单元格不在选中范围内,则只选中当前单元格
        if (!cell.classList.contains('selected')) {
          clearSelection();
          cell.classList.add('selected');
          setSelectedCells([cell]);
        } else {
          // 如果右键的单元格已经在选中范围内,保持当前选择状态
          // 更新selectedCells状态以确保包含所有选中的单元格
          const selected = Array.from(table.querySelectorAll('td.selected, th.selected')) as HTMLTableCellElement[];
          setSelectedCells(selected);
        }
        
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setContextMenuVisible(true);
      }
    };

    // 处理点击关闭菜单
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        setContextMenuVisible(false);
      }
    };

    editor.addEventListener('mousedown', handleMouseDown);
    editor.addEventListener('mousemove', handleMouseMove);
    editor.addEventListener('mouseup', handleMouseUp);
    // 移除了 contextmenu 监听，由 useContextMenu 统一处理
    // editor.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      editor.removeEventListener('mousedown', handleMouseDown);
      editor.removeEventListener('mousemove', handleMouseMove);
      editor.removeEventListener('mouseup', handleMouseUp);
      // editor.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [editorRef, isSelecting, selectionStart, currentTable]);

  // 处理右键菜单操作
  const handleContextMenuAction = (action: string, data?: any) => {
    const editor = editorRef.current?.getElement();
    if (!editor || selectedCells.length === 0) return;

    switch (action) {
      case 'selectAll':
        handleSelectAll();
        break;
      case 'align':
        handleAlign(data);
        break;
      case 'insertRowAbove':
        handleInsertRow('above');
        break;
      case 'insertRowBelow':
        handleInsertRow('below');
        break;
      case 'insertColumnLeft':
        handleInsertColumn('left');
        break;
      case 'insertColumnRight':
        handleInsertColumn('right');
        break;
      case 'deleteRow':
        handleDeleteRow();
        break;
      case 'deleteColumn':
        handleDeleteColumn();
        break;
      case 'deleteTable':
        handleDeleteTable();
        break;
      case 'merge':
        handleMerge();
        break;
      case 'split':
        handleSplit();
        break;
      case 'backgroundColor':
        handleBackgroundColor(data);
        break;
      case 'textColor':
        handleTextColor(data);
        break;
      case 'borderStyle':
        handleBorderStyle(data);
        break;
      case 'clear':
        handleClear();
        break;
      case 'clearAll':
        handleClearAll();
        break;
    }

    // 更新内容
    onContentChange(editor.innerHTML);
  };

  // 对齐
  const handleAlign = (alignment: string) => {
    selectedCells.forEach(cell => {
      cell.style.textAlign = alignment;
    });
    toast({ title: '对齐已设置', description: `单元格已设置为${alignment}对齐` });
  };

  // 插入行
  const handleInsertRow = (position: 'above' | 'below') => {
    if (!currentTable || selectedCells.length === 0) return;

    const firstCell = selectedCells[0];
    const row = firstCell.parentElement as HTMLTableRowElement;
    const newRow = document.createElement('tr');
    
    // 计算表格的总逻辑列数（累加第一行各单元格的 colSpan）
    const firstRow = currentTable.querySelector('tr');
    if (!firstRow) return;
    const totalCols = Array.from(firstRow.children).reduce((acc, cell) => acc + ((cell as HTMLTableCellElement).colSpan || 1), 0);
    const cellWidth = (100 / totalCols).toFixed(2) + '%';
    
    for (let i = 0; i < totalCols; i++) {
      const newCell = document.createElement('td');
      newCell.contentEditable = 'true';
      newCell.style.border = '1px solid #e2e8f0';
      newCell.style.padding = '12px 20px';
      newCell.style.width = cellWidth;
      newCell.style.maxWidth = cellWidth;
      newCell.style.overflowWrap = 'break-word';
      newCell.style.wordBreak = 'break-all';
      newCell.style.verticalAlign = 'top';
      newCell.style.cursor = 'text';
      newCell.style.boxSizing = 'border-box';
      newCell.style.lineHeight = '1.5';
      newCell.style.fontSize = '14px';
      newCell.style.color = '#475569';
      newCell.innerHTML = '<br>';
      newRow.appendChild(newCell);
    }

    if (position === 'above') {
      row.parentElement?.insertBefore(newRow, row);
    } else {
      row.parentElement?.insertBefore(newRow, row.nextSibling);
    }

    toast({ title: '行已插入', description: `已在${position === 'above' ? '上方' : '下方'}插入新行` });
  };

  // 插入列
  const handleInsertColumn = (position: 'left' | 'right') => {
    if (!currentTable || selectedCells.length === 0) return;

    const firstCell = selectedCells[0];
    const cellIndex = Array.from((firstCell.parentElement as HTMLTableRowElement).children).indexOf(firstCell);
    const rows = Array.from(currentTable.querySelectorAll('tr'));

    rows.forEach(row => {
      const cells = Array.from(row.children);
      const referenceCell = cells[cellIndex] as HTMLTableCellElement;
      const newCell = document.createElement(referenceCell.tagName.toLowerCase() as 'td' | 'th');
      newCell.contentEditable = 'true';
      newCell.style.border = '1px solid #e2e8f0';
      newCell.style.padding = '12px 20px';
      
      // 重新计算并设置新行宽比例
      const newCellCount = cells.length + 1;
      const newWidth = (100 / newCellCount).toFixed(2) + '%';
      
      // 设置新列中各单元格的基础样式
      newCell.style.width = newWidth;
      newCell.style.maxWidth = newWidth;
      newCell.style.overflowWrap = 'break-word';
      newCell.style.wordBreak = 'break-all';
      newCell.style.verticalAlign = 'top';
      newCell.style.cursor = 'text';
      newCell.style.boxSizing = 'border-box';
      newCell.style.lineHeight = '1.5';
      newCell.style.fontSize = '14px';
      newCell.style.color = '#475569';
      newCell.innerHTML = '<br>';

      // 更新同行的所有单元格宽度
      cells.forEach(c => {
        const ce = c as HTMLElement;
        ce.style.width = newWidth;
        ce.style.maxWidth = newWidth;
      });

      if (position === 'left') {
        row.insertBefore(newCell, referenceCell);
      } else {
        row.insertBefore(newCell, referenceCell.nextSibling);
      }
    });

    toast({ title: '列已插入', description: `已在${position === 'left' ? '左侧' : '右侧'}插入新列` });
  };

  // 删除行
  const handleDeleteRow = () => {
    if (selectedCells.length === 0) return;

    const rows = new Set(selectedCells.map(cell => cell.parentElement));
    rows.forEach(row => row?.remove());

    clearSelection();
    toast({ title: '行已删除', description: '选中的行已删除' });
  };

  // 删除列
  const handleDeleteColumn = () => {
    if (!currentTable || selectedCells.length === 0) return;

    const firstCell = selectedCells[0];
    const cellIndex = Array.from((firstCell.parentElement as HTMLTableRowElement).children).indexOf(firstCell);
    const rows = Array.from(currentTable.querySelectorAll('tr'));

    rows.forEach(row => {
      const cells = Array.from(row.children);
      if (cells[cellIndex]) {
        cells[cellIndex].remove();
      }
    });

    clearSelection();
    toast({ title: '列已删除', description: '选中的列已删除' });
  };

  // 删除表格
  const handleDeleteTable = () => {
    if (!currentTable) return;

    currentTable.remove();
    clearSelection();
    setCurrentTable(null);
    toast({ title: '表格已删除', description: '表格已从文档中删除' });
  };

  // 合并单元格
  const handleMerge = () => {
    if (selectedCells.length < 2) return;

    const firstCell = selectedCells[0];
    const table = firstCell.closest('table');
    if (!table) return;

    // 计算合并范围
    const rows = Array.from(table.querySelectorAll('tr'));
    const cellPositions = selectedCells.map(cell => {
      const row = cell.parentElement as HTMLTableRowElement;
      const rowIndex = rows.indexOf(row);
      const cellIndex = Array.from(row.children).indexOf(cell);
      return { rowIndex, cellIndex, cell };
    });

    const minRow = Math.min(...cellPositions.map(p => p.rowIndex));
    const maxRow = Math.max(...cellPositions.map(p => p.rowIndex));
    const minCol = Math.min(...cellPositions.map(p => p.cellIndex));
    const maxCol = Math.max(...cellPositions.map(p => p.cellIndex));

    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;

    // 合并内容
    const content = selectedCells.map(cell => cell.textContent).filter(t => t).join(' ');
    firstCell.textContent = content;
    firstCell.rowSpan = rowSpan;
    firstCell.colSpan = colSpan;
    
    // 【关键修复】累加宽度属性（如果存在）
    if (firstCell.style.width) {
      const widthMatch = firstCell.style.width.match(/^([\d.]+)(%|px)$/);
      if (widthMatch) {
        const value = parseFloat(widthMatch[1]);
        const unit = widthMatch[2];
        // 累加所跨逻辑列的宽度之和
        firstCell.style.width = (value * colSpan).toFixed(2) + unit;
        firstCell.style.maxWidth = (value * colSpan).toFixed(2) + unit;
      }
    }
    
    // 移除固定高度，让单元格自适应内容
    firstCell.style.height = 'auto';

    // 隐藏其他单元格并清除其宽度，以免干扰布局
    selectedCells.slice(1).forEach(cell => {
      cell.style.display = 'none';
      cell.style.width = '0'; // 关键：被隐藏的单元格宽度清零
    });

    clearSelection();
    
    // 更新编辑器内容
    const editor = editorRef.current?.getElement();
    if (editor) {
      onContentChange(editor.innerHTML);
    }
    
    toast({ title: '单元格已合并', description: `已合并${selectedCells.length}个单元格` });
  };

  // 拆分单元格
  const handleSplit = () => {
    if (selectedCells.length !== 1) return;

    const cell = selectedCells[0];
    if (cell.rowSpan === 1 && cell.colSpan === 1) {
      toast({ title: '无法拆分', description: '该单元格未合并', variant: 'destructive' });
      return;
    }

    const colSpan = cell.colSpan;
    const rowSpan = cell.rowSpan;
    
    // 记录原始列宽以便恢复
    let originalUnitWidth = '';
    if (cell.style.width) {
      const widthMatch = cell.style.width.match(/^([\d.]+)(%|px)$/);
      if (widthMatch) {
        const value = parseFloat(widthMatch[1]);
        const unit = widthMatch[2];
        originalUnitWidth = (value / colSpan).toFixed(2) + unit;
        cell.style.width = originalUnitWidth;
        cell.style.maxWidth = originalUnitWidth;
      }
    }
    
    cell.rowSpan = 1;
    cell.colSpan = 1;
    
    // 恢复单元格高度为自适应
    cell.style.height = 'auto';

    // 显示被隐藏的单元格并恢复其属性
    const table = cell.closest('table');
    if (table) {
      // 遍历所有隐藏的单元格并恢复显示
      const hiddenCells = Array.from(table.querySelectorAll('td[style*="display: none"], th[style*="display: none"]')) as HTMLTableCellElement[];
      hiddenCells.forEach(cellElement => {
        cellElement.style.display = '';
        cellElement.style.height = 'auto';
        if (originalUnitWidth) {
          cellElement.style.width = originalUnitWidth;
          cellElement.style.maxWidth = originalUnitWidth;
        }
      });
    }

    clearSelection();
    
    // 更新编辑器内容
    const editor = editorRef.current?.getElement();
    if (editor) {
      onContentChange(editor.innerHTML);
    }
    
    toast({ title: '单元格已拆分', description: '单元格已拆分为原始大小' });
  };

  // 设置背景颜色
  const handleBackgroundColor = (color: string) => {
    selectedCells.forEach(cell => {
      // 移除 contenteditable 属性以避免编辑状态干扰
      const wasEditable = cell.contentEditable;
      cell.contentEditable = 'false';
      cell.style.backgroundColor = color;
      // 恢复 contenteditable 状态
      setTimeout(() => {
        cell.contentEditable = wasEditable;
      }, 0);
    });
    toast({ title: '背景颜色已设置', description: '单元格背景颜色已更新' });
  };

  // 设置文字颜色
  const handleTextColor = (color: string) => {
    selectedCells.forEach(cell => {
      // 移除 contenteditable 属性以避免编辑状态干扰
      const wasEditable = cell.contentEditable;
      cell.contentEditable = 'false';
      cell.style.color = color;
      // 恢复 contenteditable 状态
      setTimeout(() => {
        cell.contentEditable = wasEditable;
      }, 0);
    });
    toast({ title: '文字颜色已设置', description: '单元格文字颜色已更新' });
  };

  // 清除内容
  const handleClear = () => {
    selectedCells.forEach(cell => {
      cell.textContent = '';
    });
    toast({ title: '内容已清除', description: '选中单元格的内容已清除' });
  };

  // 全选表格
  const handleSelectAll = () => {
    if (!currentTable) return;

    clearSelection();
    const allCells = Array.from(currentTable.querySelectorAll('td, th')) as HTMLTableCellElement[];
    allCells.forEach(cell => {
      cell.classList.add('selected');
    });
    setSelectedCells(allCells);
    toast({ title: '已全选', description: '已选中表格的所有单元格' });
  };

  // 清空整个表格
  const handleClearAll = () => {
    if (!currentTable) return;

    const allCells = Array.from(currentTable.querySelectorAll('td, th')) as HTMLTableCellElement[];
    allCells.forEach(cell => {
      cell.textContent = '';
    });
    toast({ title: '表格已清空', description: '整个表格的内容已清空' });
  };

  // 设置边框样式
  const handleBorderStyle = (style: string) => {
    if (!currentTable) return;

    // 根据边框样式设置合适的宽度和颜色
    // 虚线、点线、双线需要更粗的边框和更深的颜色才能显示清楚
    const borderWidth = (style === 'dashed' || style === 'dotted' || style === 'double') ? '2px' : '1px';
    const borderColor = '#333'; // 使用更深的颜色确保可见性

    // 设置表格本身的边框样式
    currentTable.style.borderStyle = style;
    currentTable.style.borderWidth = borderWidth;
    currentTable.style.borderColor = borderColor;
    
    // 设置所有单元格的边框样式
    const allCells = Array.from(currentTable.querySelectorAll('td, th')) as HTMLTableCellElement[];
    allCells.forEach(cell => {
      cell.style.borderStyle = style;
      cell.style.borderWidth = borderWidth;
      cell.style.borderColor = borderColor;
    });
    
    const styleNames: Record<string, string> = {
      solid: '实线',
      dashed: '虚线',
      dotted: '点线',
      double: '双线'
    };
    
    toast({ title: '边框样式已设置', description: `表格边框已设置为${styleNames[style] || style}` });
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getSelectedCells: () => selectedCells,
    handleTableAction: handleContextMenuAction,
  }));

  // 移除了 TableContextMenu 的渲染，由 useContextMenu 统一处理
  return null;
});
