import { useState, useCallback, useRef, useEffect } from 'react';
import { ContextMenuItem, ContextInfo, MenuPosition } from '@/types/contextMenu';
import { ContextDetector } from '@/utils/contextDetector';
import { ContextMenuBuilder } from '@/utils/contextMenuBuilder';
import { ParagraphSettings } from '@/components/editor/ParagraphDialog';
import { TableSettings } from '@/components/editor/TablePropertiesDialog';
import { 
  insertTableRow, 
  insertTableColumn, 
  deleteTableRow, 
  deleteTableColumn, 
  mergeCells, 
  splitCell, 
  setCellAlignment, 
  selectCell, 
  selectRow, 
  selectColumn, 
  selectTable 
} from '@/utils/tableUtils';

interface UseContextMenuOptions {
  editorRef: React.RefObject<HTMLDivElement>;
  onCommand?: (command: string, item: ContextMenuItem, context: ContextInfo) => void;
  onContentChange?: () => void;
}

export function useContextMenu({ editorRef, onCommand, onContentChange }: UseContextMenuOptions) {
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    items: ContextMenuItem[];
    position: MenuPosition;
    context: ContextInfo | null;
  }>({
    visible: false,
    items: [],
    position: { x: 0, y: 0 },
    context: null
  });

  const [paragraphDialogOpen, setParagraphDialogOpen] = useState(false);
  const [tablePropertiesDialogOpen, setTablePropertiesDialogOpen] = useState(false);
  
  // 保存当前操作的元素引用
  const currentElementRef = useRef<HTMLElement | null>(null);
  const currentTableRef = useRef<HTMLTableElement | null>(null);
  const savedSelectionRef = useRef<{
    anchorNode: Node;
    anchorOffset: number;
    focusNode: Node;
    focusOffset: number;
  } | null>(null);

  /**
   * 处理右键菜单事件
   */
  const handleContextMenu = useCallback((event: MouseEvent) => {
    // 兼容 EditorContentRef 对象和 HTML 元素
    const editor = editorRef.current;
    if (!editor) return;
    const editorElement = (editor as any).getElement ? (editor as any).getElement() : editor;
    if (!editorElement || typeof editorElement.addEventListener !== 'function') return;

    // 检测上下文
    const context = ContextDetector.detectContext(event, editorElement as HTMLElement);
    
    // 构建菜单
    const items = ContextMenuBuilder.buildMenu(context);

    // 如果没有自定义菜单项，则不拦截，允许显示浏览器默认菜单
    if (items.length === 0) {
      setMenuState(prev => ({ ...prev, visible: false }));
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // 显示菜单
    setMenuState({
      visible: true,
      items,
      position: { x: event.clientX, y: event.clientY },
      context
    });
  }, [editorRef]);

  /**
   * 关闭菜单
   */
  const closeMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, visible: false }));
  }, []);

  /**
   * 执行命令
   */
  const executeCommand = useCallback((command: string, item: ContextMenuItem) => {
    const context = menuState.context;
    if (!context) return;

    console.log('执行命令:', command, '参数:', item, '上下文:', context);

    // 确保编辑器获得焦点，否则 execCommand 可能会失效
    if (editorRef.current) {
      if (typeof (editorRef.current as any).focus === 'function') {
        (editorRef.current as any).focus();
      }
    }

    // 基本编辑命令
    switch (command) {
      case 'cut':
        document.execCommand('cut');
        onContentChange?.();
        break;
      case 'copy':
        document.execCommand('copy');
        break;
      case 'paste':
        document.execCommand('paste');
        onContentChange?.();
        break;
      case 'selectAll':
        document.execCommand('selectAll');
        break;
      case 'delete':
        document.execCommand('delete');
        onContentChange?.();
        break;

      // 对话框命令
      case 'paragraphDialog':
        // 【关键】立即保存当前选区和元素，防止对话框打开时选区丢失
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          savedSelectionRef.current = {
            anchorNode: selection.anchorNode!,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode!,
            focusOffset: selection.focusOffset
          };
          
          // 【关键】保存 Range 对象，以便后续恢复
          try {
            const clonedRange = range.cloneRange();
            (savedSelectionRef.current as any).range = clonedRange;
          } catch (e) {
            console.warn('无法克隆选区:', e);
          }
        }
        
        // 保存当前元素
        if (context.element) {
          currentElementRef.current = context.element;
        } else if (selection && selection.anchorNode) {
          const element = (selection.anchorNode as HTMLElement).nodeType === Node.ELEMENT_NODE
            ? selection.anchorNode as HTMLElement
            : (selection.anchorNode as Node).parentElement;
          currentElementRef.current = element?.closest('p, div, h1, h2, h3, h4, h5, h6') as HTMLElement;
        }
        
        setParagraphDialogOpen(true);
        return; // 不关闭菜单，等对话框关闭
        
      case 'tableProperties':
        // 保存当前表格
        if (context.table) {
          currentTableRef.current = context.table;
        }
        setTablePropertiesDialogOpen(true);
        return;

      // 格式化命令
      case 'bullet':
        if (item.value === 'none') {
          document.execCommand('insertUnorderedList');
        } else {
          document.execCommand('insertUnorderedList');
          // 设置列表样式
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
            const listItem = (selection.anchorNode as HTMLElement).closest('ul');
            if (listItem) {
              listItem.style.listStyleType = item.value as string;
            }
          }
        }
        onContentChange?.();
        break;

      case 'numbering':
        if (item.value === 'none') {
          document.execCommand('insertOrderedList');
        } else {
          document.execCommand('insertOrderedList');
          // 设置编号样式
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
            const listItem = (selection.anchorNode as HTMLElement).closest('ol');
            if (listItem) {
              listItem.style.listStyleType = item.value as string;
            }
          }
        }
        onContentChange?.();
        break;

      // 表格命令
      case 'insertRow':
        if (context.table && context.cell) {
          insertTableRow(context.table, context.row!, item.position === 'above' ? 'before' : 'after');
        }
        break;

      case 'insertCol':
        if (context.table && context.cell) {
          insertTableColumn(context.table, context.col!, item.position === 'left' ? 'before' : 'after');
        }
        break;

      case 'deleteRow':
        if (context.table && context.cell) {
          deleteTableRow(context.table, context.row!);
        }
        break;

      case 'deleteCol':
        if (context.table && context.cell) {
          deleteTableColumn(context.table, context.col!);
        }
        break;

      case 'deleteTable':
        if (context.table) {
          context.table.remove();
        }
        break;

      case 'mergeCells':
        if (context.cells && context.cells.length > 1) {
          mergeCells(context.cells);
        }
        break;

      case 'splitCell':
        if (context.cell) {
          splitCell(context.cell);
        }
        break;

      case 'cellAlign':
        if (context.cell || context.cells) {
          const cells = context.cells || [context.cell!];
          setCellAlignment(cells, item.align as string);
        }
        break;

      case 'selectCell':
        if (context.cell) {
          selectCell(context.cell);
        }
        break;

      case 'selectRow':
        if (context.table && context.row !== undefined) {
          selectRow(context.table, context.row);
        }
        break;

      case 'selectCol':
        if (context.table && context.col !== undefined) {
          selectColumn(context.table, context.col);
        }
        break;

      case 'selectTable':
        if (context.table) {
          selectTable(context.table);
        }
        break;

      // 图片命令
      case 'wrapText':
        if (context.element && context.element.tagName === 'IMG') {
          setImageWrap(context.element as HTMLImageElement, item.value as string);
        }
        break;

      case 'rotate':
        if (context.element && context.element.tagName === 'IMG') {
          rotateImage(context.element as HTMLImageElement, item.angle as number);
        }
        break;

      case 'flip':
        if (context.element && context.element.tagName === 'IMG') {
          flipImage(context.element as HTMLImageElement, item.direction as 'horizontal' | 'vertical');
        }
        break;

      case 'alignImage':
        if (context.element && context.element.tagName === 'IMG') {
          alignImage(context.element as HTMLImageElement, item.align as string);
        }
        break;

      // 插入命令
      case 'insertPageBreak':
        document.execCommand('insertHTML', false, '<hr style="page-break-after: always;">');
        break;

      case 'insertColumnBreak':
        document.execCommand('insertHTML', false, '<div style="column-break-after: always;"></div>');
        break;

      case 'insertSectionBreak':
        document.execCommand('insertHTML', false, '<hr style="break-after: page;">');
        break;

      case 'insertImage':
        // 触发图片上传
        if (onCommand) {
          onCommand('insertImage', item, context);
        }
        break;

      case 'insertTable':
        // 触发表格插入
        if (onCommand) {
          onCommand('insertTable', item, context);
        }
        break;

      case 'insertHyperlink':
      case 'hyperlink':
        // 触发超链接对话框
        if (onCommand) {
          onCommand('insertHyperlink', item, context);
        }
        break;

      // 字体对话框
      case 'fontDialog':
        // 暂时使用浏览器默认行为或提示用户使用工具栏
        console.log('字体对话框功能请使用顶部工具栏');
        break;

      // 其他命令
      case 'newComment':
        console.log('批注功能暂未实现');
        break;

      case 'insertSymbol':
        console.log('插入符号功能暂未实现');
        break;

      case 'insertNumbering':
        document.execCommand('insertOrderedList');
        break;

      case 'insertBullet':
        document.execCommand('insertUnorderedList');
        break;

      case 'tabsDialog':
        console.log('制表位功能暂未实现');
        break;

      case 'pasteSpecial':
        // 粘贴特殊格式
        if (item.value === 'text-only') {
          document.execCommand('insertText', false, '');
        } else {
          document.execCommand('paste');
        }
        break;

      case 'changeImage':
        console.log('更改图片功能暂未实现');
        break;

      case 'saveImageAs':
        if (context.element && context.element.tagName === 'IMG') {
          const img = context.element as HTMLImageElement;
          const link = document.createElement('a');
          link.href = img.src;
          link.download = 'image.png';
          link.click();
        }
        break;

      case 'imageSizeDialog':
        console.log('图片大小对话框暂未实现');
        break;

      case 'imageFormat':
        console.log('图片格式设置暂未实现');
        break;

      case 'cropImage':
        console.log('裁剪图片功能暂未实现');
        break;

      case 'insertCaption':
        console.log('插入题注功能暂未实现');
        break;

      case 'tableBorders':
        console.log('边框和底纹功能请使用表格属性对话框');
        break;

      case 'autoFit':
        if (context.table) {
          const table = context.table;
          switch (item.mode) {
            case 'content':
              table.style.width = 'auto';
              break;
            case 'window':
              table.style.width = '100%';
              break;
            case 'fixed':
              table.style.tableLayout = 'fixed';
              break;
          }
        }
        break;

      case 'textDirection':
        console.log('文字方向功能暂未实现');
        break;

      case 'sortTable':
        console.log('表格排序功能暂未实现');
        break;

      case 'deleteCell':
        if (context.cell) {
          context.cell.remove();
        }
        break;

      default:
        // 调用外部命令处理器
        if (onCommand) {
          onCommand(command, item, context);
        } else {
          console.warn('未实现的命令:', command);
        }
    }

    // 对于非对话框命令，且修改了DOM的操作，通知内容变化
    const domChangingCommands = [
      'cut', 'paste', 'delete', 'bullet', 'numbering', 
      'insertRow', 'insertCol', 'deleteRow', 'deleteCol', 'deleteTable', 
      'mergeCells', 'splitCell', 'cellAlign', 'wrapText', 'rotate', 
      'flip', 'alignImage', 'insertPageBreak', 'insertColumnBreak', 
      'insertSectionBreak', 'insertNumbering', 'insertBullet', 'autoFit', 'deleteCell'
    ];
    
    if (domChangingCommands.includes(command)) {
      onContentChange?.();
    }

    closeMenu();
  }, [menuState.context, onCommand, closeMenu, onContentChange]);

  /**
   * 应用段落设置
   */
  const applyParagraphSettings = useCallback((settings: ParagraphSettings) => {
    // 使用保存的元素引用
    let element = currentElementRef.current;
    
    // 如果没有保存的元素，尝试从当前选区获取
    if (!element) {
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        const node = selection.anchorNode.nodeType === Node.ELEMENT_NODE
          ? selection.anchorNode as HTMLElement
          : (selection.anchorNode as Node).parentElement;
        element = node?.closest('p, div, h1, h2, h3, h4, h5, h6') as HTMLElement;
      }
    }
    
    if (!element) {
      console.warn('未找到要应用段落设置的元素');
      return;
    }

    console.log('应用段落设置到元素:', element, '设置:', settings);

    // 获取元素当前样式
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseInt(computedStyle.fontSize) || 16;
    const charWidth = fontSize; 

    // 【关键】确保元素是块级元素，且垂直对齐稳定
    if (element.style.display !== 'block' && element.style.display !== 'flex') {
      element.style.display = 'block';
    }
    
    // 【关键】确保垂直方向上的属性完全标准化，防止缩进引起微量位移
    // 强制使用 baseline，并清空所有偏移
    element.style.verticalAlign = 'baseline';
    element.style.position = 'relative';
    element.style.top = '0';
    element.style.bottom = '0';
    element.style.transform = 'none';
    
    // 很多"上移"实际上是因为 line-height 的突然改变或内边距的不稳定导致的
    // 显式重置 padding-top 以确保对齐
    element.style.paddingTop = '0px';

    // 应用缩进
    const leftIndentPx = settings.leftIndent * charWidth;
    const rightIndentPx = settings.rightIndent * charWidth;
    element.style.paddingLeft = `${leftIndentPx}px`;
    element.style.paddingRight = `${rightIndentPx}px`;
    
    // 应用特殊缩进
    if (settings.specialIndent === 'first-line') {
      const firstLineIndentPx = settings.specialIndentValue * charWidth;
      // 使用 textIndent，并确保它不带任何垂直偏移
      element.style.textIndent = `${firstLineIndentPx}px`;
    } else if (settings.specialIndent === 'hanging') {
      const hangingIndentPx = settings.specialIndentValue * charWidth;
      element.style.textIndent = `-${hangingIndentPx}px`;
      element.style.paddingLeft = `${leftIndentPx + hangingIndentPx}px`;
    } else {
      element.style.textIndent = '0';
    }

    // 应用间距 (注意单位)
    // 如果 spaceBefore 为 0，我们设为 0px 以确保彻底一致
    element.style.marginTop = settings.spaceBefore === 0 ? '0px' : `${settings.spaceBefore}em`;
    element.style.marginBottom = settings.spaceAfter === 0 ? '0px' : `${settings.spaceAfter}em`;

    // 应用行距
    switch (settings.lineSpacing) {
      case 'single':
        element.style.lineHeight = '1.5';
        break;
      case '1.5':
        element.style.lineHeight = '1.8';
        break;
      case 'double':
        element.style.lineHeight = '2';
        break;
      case 'multiple':
        element.style.lineHeight = `${settings.lineSpacingValue}`;
        break;
      case 'fixed':
        element.style.lineHeight = `${settings.lineSpacingValue}px`;
        break;
      default:
        element.style.lineHeight = '1.5';
    }

    // 应用对齐
    element.style.textAlign = settings.alignment;

    // 清除可能引起问题的 background 偏移
    element.style.backgroundPosition = '';
    element.style.backgroundAttachment = '';

    // 【关键】恢复选区
    if (savedSelectionRef.current) {
      try {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          
          // 如果保存了 Range 对象，直接使用
          if ((savedSelectionRef.current as any).range) {
            selection.addRange((savedSelectionRef.current as any).range);
          } else {
            // 否则重新创建 Range
            const range = document.createRange();
            range.setStart(savedSelectionRef.current.anchorNode, savedSelectionRef.current.anchorOffset);
            range.setEnd(savedSelectionRef.current.focusNode, savedSelectionRef.current.focusOffset);
            selection.addRange(range);
          }
        }
      } catch (e) {
        console.warn('无法恢复选区:', e);
      }
    }

    // 清除保存的引用
    currentElementRef.current = null;
    savedSelectionRef.current = null;

    onContentChange?.();
    setParagraphDialogOpen(false);
  }, [onContentChange]);

  /**
   * 应用表格设置
   */
  const applyTableSettings = useCallback((settings: TableSettings) => {
    // 使用保存的表格引用
    const table = currentTableRef.current;
    
    if (!table) {
      console.warn('未找到要应用设置的表格');
      return;
    }

    console.log('应用表格设置到表格:', table, '设置:', settings);

    // 应用尺寸
    if (settings.widthUnit === 'auto') {
      table.style.width = 'auto';
    } else {
      table.style.width = `${settings.width}${settings.widthUnit}`;
    }
    
    if (settings.heightUnit !== 'auto') {
      table.style.height = `${settings.height}px`;
    } else {
      table.style.height = 'auto';
    }

    // 应用间距
    if (settings.cellSpacing > 0) {
      table.style.borderCollapse = 'separate';
      table.style.borderSpacing = `${settings.cellSpacing}px`;
    } else {
      table.style.borderCollapse = 'collapse';
    }

    // 【关键】应用边框样式类型
    const borderValue = `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`;
    const cells = table.querySelectorAll('td, th');
    const rows = table.querySelectorAll('tr');

    // 应用背景色
    table.style.backgroundColor = settings.backgroundColor;
    cells.forEach(cell => {
      const cellEl = cell as HTMLElement;
      // 如果不是表头，或者表头没有特殊背景要求，应用背景色
      if (cellEl.tagName === 'TD') {
        cellEl.style.backgroundColor = settings.backgroundColor;
      }
    });

    // 应用对齐
    if (settings.alignment === 'left') {
      table.style.marginLeft = '0';
      table.style.marginRight = 'auto';
    } else if (settings.alignment === 'center') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = 'auto';
    } else if (settings.alignment === 'right') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = '0';
    }
    
    // 同时也尝试在容器上设置对齐，以防万一
    const container = table.parentElement;
    if (container) {
      container.style.textAlign = settings.alignment;
    }
    
    // 先清除所有边框
    table.style.border = 'none';
    cells.forEach(cell => {
      (cell as HTMLElement).style.border = 'none';
      (cell as HTMLElement).style.borderTop = 'none';
      (cell as HTMLElement).style.borderBottom = 'none';
      (cell as HTMLElement).style.borderLeft = 'none';
      (cell as HTMLElement).style.borderRight = 'none';
      (cell as HTMLElement).style.padding = `${settings.cellPadding}px`;
      (cell as HTMLElement).style.minHeight = '1.5em';
    });

    // 根据边框样式类型应用边框
    switch (settings.borderStyleType) {
      case 'none':
        // 无框线 - 已经清除了所有边框
        break;
        
      case 'all':
        // 所有框线
        table.style.border = borderValue;
        cells.forEach(cell => {
          (cell as HTMLElement).style.border = borderValue;
        });
        break;
        
      case 'outer':
        // 外侧框线
        table.style.border = borderValue;
        break;
        
      case 'inner':
        // 内部框线
        cells.forEach((cell, index) => {
          const cellEl = cell as HTMLElement;
          const row = cellEl.parentElement as HTMLTableRowElement;
          const cellIndex = Array.from(row.cells).indexOf(cellEl as HTMLTableCellElement);
          const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
          const totalRows = rows.length;
          const totalCols = row.cells.length;
          
          // 不是第一行，添加上边框
          if (rowIndex > 0) {
            cellEl.style.borderTop = borderValue;
          }
          // 不是最后一行，添加下边框
          if (rowIndex < totalRows - 1) {
            cellEl.style.borderBottom = borderValue;
          }
          // 不是第一列，添加左边框
          if (cellIndex > 0) {
            cellEl.style.borderLeft = borderValue;
          }
          // 不是最后一列，添加右边框
          if (cellIndex < totalCols - 1) {
            cellEl.style.borderRight = borderValue;
          }
        });
        break;
        
      case 'horizontal':
        // 内部横框线
        cells.forEach((cell) => {
          const cellEl = cell as HTMLElement;
          const row = cellEl.parentElement as HTMLTableRowElement;
          const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
          const totalRows = rows.length;
          
          // 不是第一行，添加上边框
          if (rowIndex > 0) {
            cellEl.style.borderTop = borderValue;
          }
          // 不是最后一行，添加下边框
          if (rowIndex < totalRows - 1) {
            cellEl.style.borderBottom = borderValue;
          }
        });
        break;
        
      case 'vertical':
        // 内部竖框线
        cells.forEach((cell) => {
          const cellEl = cell as HTMLElement;
          const row = cellEl.parentElement as HTMLTableRowElement;
          const cellIndex = Array.from(row.cells).indexOf(cellEl as HTMLTableCellElement);
          const totalCols = row.cells.length;
          
          // 不是第一列，添加左边框
          if (cellIndex > 0) {
            cellEl.style.borderLeft = borderValue;
          }
          // 不是最后一列，添加右边框
          if (cellIndex < totalCols - 1) {
            cellEl.style.borderRight = borderValue;
          }
        });
        break;
        
      case 'top':
        // 上框线
        table.style.borderTop = borderValue;
        break;
        
      case 'bottom':
        // 下框线
        table.style.borderBottom = borderValue;
        break;
        
      case 'left':
        // 左框线
        table.style.borderLeft = borderValue;
        break;
        
      case 'right':
        // 右框线
        table.style.borderRight = borderValue;
        break;
    }

    // 清除保存的引用
    currentTableRef.current = null;

    onContentChange?.();
    setTablePropertiesDialogOpen(false);
  }, [onContentChange]);

  // 绑定右键事件
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // 兼容 EditorContentRef 对象和 HTML 元素
    const targetElement = (editor as any).getElement ? (editor as any).getElement() : editor;
    if (!targetElement || typeof targetElement.addEventListener !== 'function') return;

    targetElement.addEventListener('contextmenu', handleContextMenu);
    return () => {
      targetElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [editorRef, handleContextMenu]);

  return {
    menuState,
    closeMenu,
    executeCommand,
    paragraphDialogOpen,
    setParagraphDialogOpen,
    applyParagraphSettings,
    tablePropertiesDialogOpen,
    setTablePropertiesDialogOpen,
    applyTableSettings
  };
}

// 图片处理函数
function setImageWrap(img: HTMLImageElement, mode: string) {
  switch (mode) {
    case 'inline':
      img.style.display = 'inline-block';
      img.style.float = 'none';
      img.style.position = 'static';
      break;
    case 'square':
    case 'tight':
    case 'through':
      img.style.display = 'block';
      img.style.float = 'left';
      img.style.margin = '0 1em 1em 0';
      break;
    case 'top-bottom':
      img.style.display = 'block';
      img.style.float = 'none';
      img.style.margin = '1em auto';
      break;
    case 'behind':
      img.style.position = 'absolute';
      img.style.zIndex = '-1';
      break;
    case 'in-front':
      img.style.position = 'absolute';
      img.style.zIndex = '1';
      break;
  }
}

function rotateImage(img: HTMLImageElement, angle: number) {
  const currentRotation = img.dataset.rotation ? parseInt(img.dataset.rotation) : 0;
  const newRotation = currentRotation + angle;
  img.style.transform = `rotate(${newRotation}deg)`;
  img.dataset.rotation = newRotation.toString();
}

function flipImage(img: HTMLImageElement, direction: 'horizontal' | 'vertical') {
  if (direction === 'horizontal') {
    const scaleX = img.dataset.scaleX === '-1' ? '1' : '-1';
    img.style.transform = `${img.style.transform || ''} scaleX(${scaleX})`.trim();
    img.dataset.scaleX = scaleX;
  } else {
    const scaleY = img.dataset.scaleY === '-1' ? '1' : '-1';
    img.style.transform = `${img.style.transform || ''} scaleY(${scaleY})`.trim();
    img.dataset.scaleY = scaleY;
  }
}

function alignImage(img: HTMLImageElement, align: string) {
  img.style.display = 'block';
  switch (align) {
    case 'left':
      img.style.marginLeft = '0';
      img.style.marginRight = 'auto';
      break;
    case 'center':
      img.style.marginLeft = 'auto';
      img.style.marginRight = 'auto';
      break;
    case 'right':
      img.style.marginLeft = 'auto';
      img.style.marginRight = '0';
      break;
  }
}

