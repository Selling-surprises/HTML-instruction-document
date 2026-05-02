import { ContextInfo } from '@/types/contextMenu';

/**
 * 上下文检测工具类
 * 用于检测鼠标右键点击位置的上下文类型
 */
export class ContextDetector {
  /**
   * 检测点击位置的上下文
   */
  static detectContext(event: MouseEvent, editorElement: HTMLElement): ContextInfo {
    const target = event.target as HTMLElement;
    
    // 优先级：选区 > 表格 > 图片 > 段落 > 空白
    
    // 1. 检测是否有选区
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return {
        type: 'selection',
        position: { x: event.clientX, y: event.clientY }
      };
    }
    
    // 2. 检测表格
    const tableContext = this.detectTableContext(target, event);
    if (tableContext) {
      return tableContext;
    }
    
    // 3. 检测图片
    if (target.tagName === 'IMG' || target.closest('img')) {
      const img = (target.tagName === 'IMG' ? target : target.closest('img')) as HTMLImageElement;
      return {
        type: 'image',
        element: img,
        position: { x: event.clientX, y: event.clientY }
      };
    }
    
    // 4. 检测段落
    const paragraph = target.closest('p, h1, h2, h3, h4, h5, h6, div[contenteditable]');
    if (paragraph && paragraph !== editorElement) {
      return {
        type: 'paragraph',
        element: paragraph as HTMLElement,
        position: { x: event.clientX, y: event.clientY }
      };
    }
    
    // 5. 空白处
    return {
      type: 'blank',
      position: { x: event.clientX, y: event.clientY }
    };
  }

  /**
   * 检测表格上下文
   */
  private static detectTableContext(target: HTMLElement, event: MouseEvent): ContextInfo | null {
    // 查找最近的表格单元格
    const cell = target.closest('td, th') as HTMLTableCellElement;
    if (!cell) return null;

    // 查找表格
    const table = cell.closest('table') as HTMLTableElement;
    if (!table) return null;

    // 检测是否选中了多个单元格
    const selectedCells = this.getSelectedCells(table);
    if (selectedCells.length > 1) {
      return {
        type: 'table-multi-select',
        table,
        cells: selectedCells,
        position: { x: event.clientX, y: event.clientY }
      };
    }

    // 单个单元格
    const { row, col } = this.getCellPosition(cell);
    return {
      type: 'table-cell',
      table,
      cell,
      row,
      col,
      position: { x: event.clientX, y: event.clientY }
    };
  }

  /**
   * 获取选中的单元格
   */
  private static getSelectedCells(table: HTMLTableElement): HTMLTableCellElement[] {
    const cells = Array.from(table.querySelectorAll('td.selected, th.selected')) as HTMLTableCellElement[];
    return cells;
  }

  /**
   * 获取单元格的行列位置
   */
  private static getCellPosition(cell: HTMLTableCellElement): { row: number; col: number } {
    const row = cell.parentElement as HTMLTableRowElement;
    const table = row.parentElement?.parentElement as HTMLTableElement;
    
    if (!table) return { row: 0, col: 0 };

    const rows = Array.from(table.querySelectorAll('tr'));
    const rowIndex = rows.indexOf(row);
    
    const cells = Array.from(row.children) as HTMLTableCellElement[];
    const colIndex = cells.indexOf(cell);

    return { row: rowIndex, col: colIndex };
  }

  /**
   * 检查是否可以合并单元格
   */
  static canMergeCells(cells: HTMLTableCellElement[]): boolean {
    if (cells.length < 2) return false;

    // 检查是否形成矩形区域
    const positions = cells.map(cell => this.getCellPosition(cell));
    const rows = [...new Set(positions.map(p => p.row))].sort((a, b) => a - b);
    const cols = [...new Set(positions.map(p => p.col))].sort((a, b) => a - b);

    // 检查是否连续
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] - rows[i - 1] !== 1) return false;
    }
    for (let i = 1; i < cols.length; i++) {
      if (cols[i] - cols[i - 1] !== 1) return false;
    }

    // 检查是否所有位置都有单元格
    return cells.length === rows.length * cols.length;
  }
}
