/**
 * 表格操作工具函数
 */

// 插入行
export function insertTableRow(table: HTMLTableElement, rowIndex: number, position: 'before' | 'after') {
  const targetRow = table.querySelectorAll('tr')[rowIndex] as HTMLTableRowElement;
  if (!targetRow) return;

  const newRow = table.insertRow(position === 'before' ? rowIndex : rowIndex + 1);
  const colCount = targetRow.cells.length;

  for (let i = 0; i < colCount; i++) {
    const newCell = newRow.insertCell();
    newCell.innerHTML = '&nbsp;';
    newCell.style.border = targetRow.cells[i].style.border || '1px solid #e2e8f0';
    newCell.style.padding = targetRow.cells[i].style.padding || '12px 20px';
    newCell.style.minHeight = '1.5em';
  }
}

// 插入列
export function insertTableColumn(table: HTMLTableElement, colIndex: number, position: 'before' | 'after') {
  const rows = table.querySelectorAll('tr');
  const targetColIndex = position === 'before' ? colIndex : colIndex + 1;

  rows.forEach(row => {
    const targetRow = row as HTMLTableRowElement;
    const newCell = targetRow.insertCell(targetColIndex);
    newCell.innerHTML = '&nbsp;';
    newCell.style.minHeight = '1.5em';
    
    // 复制相邻单元格的样式
    const sibling = targetRow.cells[colIndex];
    if (sibling) {
      newCell.style.border = sibling.style.border || '1px solid #e2e8f0';
      newCell.style.padding = sibling.style.padding || '12px 20px';
      newCell.style.width = sibling.style.width || '150px';
    } else {
      newCell.style.border = '1px solid #e2e8f0';
      newCell.style.padding = '12px 20px';
      newCell.style.width = '150px';
    }
  });
}

// 删除行
export function deleteTableRow(table: HTMLTableElement, rowIndex: number) {
  const rows = table.querySelectorAll('tr');
  if (rows.length <= 1) {
    table.remove();
    return;
  }
  table.deleteRow(rowIndex);
}

// 删除列
export function deleteTableColumn(table: HTMLTableElement, colIndex: number) {
  const rows = table.querySelectorAll('tr');
  const colCount = rows[0]?.cells.length || 0;
  
  if (colCount <= 1) {
    table.remove();
    return;
  }

  rows.forEach(row => {
    (row as HTMLTableRowElement).deleteCell(colIndex);
  });
}

// 合并单元格
export function mergeCells(cells: HTMLTableCellElement[]) {
  if (cells.length < 2) return;

  const table = cells[0].closest('table') as HTMLTableElement;
  if (!table) return;

  // 构建表格的逻辑网格（考虑 rowSpan 和 colSpan）
  const grid = buildTableGrid(table);
  
  // 获取所有要合并的单元格在逻辑网格中的位置
  const cellPositions = cells.map(cell => {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === cell) {
          return { row: r, col: c, cell };
        }
      }
    }
    return null;
  }).filter(pos => pos !== null) as Array<{ row: number; col: number; cell: HTMLTableCellElement }>;

  if (cellPositions.length < 2) return;

  // 找到合并区域的边界
  const minRow = Math.min(...cellPositions.map(p => p.row));
  const maxRow = Math.max(...cellPositions.map(p => p.row));
  const minCol = Math.min(...cellPositions.map(p => p.col));
  const maxCol = Math.max(...cellPositions.map(p => p.col));

  // 计算新的 rowSpan 和 colSpan
  const newRowSpan = maxRow - minRow + 1;
  const newColSpan = maxCol - minCol + 1;

  // 找到左上角的单元格（第一个单元格）
  const firstCell = grid[minRow][minCol];
  if (!firstCell) return;

  // 合并内容和宽度
  let combinedContent = '';
  let totalWidth = 0;
  let widthUnit = 'px';
  let hasSetWidth = false;

  cellPositions.forEach(({ cell }) => {
    // 合并内容
    if (cell.innerHTML && cell.innerHTML !== '<p><br></p>') {
      combinedContent += cell.innerHTML;
    }

    // 累加宽度（只考虑同一行的单元格）
    // 为了简化，我们只在横向合并时考虑累加宽度
    const cellRow = (cell.parentElement as HTMLTableRowElement).rowIndex;
    if (cellRow === minRow) {
      const cellWidthStr = cell.style.width || window.getComputedStyle(cell).width;
      if (cellWidthStr) {
        const match = cellWidthStr.match(/^(\d+(?:\.\d+)?)(px|%|em|rem|vh|vw|pt)?$/);
        if (match) {
          totalWidth += parseFloat(match[1]);
          widthUnit = match[2] || 'px';
          hasSetWidth = true;
        }
      }
    }
  });

  // 设置第一个单元格的跨度和内容
  firstCell.rowSpan = newRowSpan;
  firstCell.colSpan = newColSpan;
  firstCell.innerHTML = combinedContent || '&nbsp;';
  firstCell.style.minHeight = '1.5em';

  if (hasSetWidth) {
    firstCell.style.width = `${totalWidth}${widthUnit}`;
  }

  // 删除其他被合并的单元格（从 DOM 中移除）
  cellPositions.forEach(({ cell }) => {
    if (cell !== firstCell && cell.parentElement) {
      cell.remove();
    }
  });
}

/**
 * 构建表格的逻辑网格
 * 返回一个二维数组，每个元素是对应位置的单元格引用
 */
function buildTableGrid(table: HTMLTableElement): (HTMLTableCellElement | null)[][] {
  const rows = Array.from(table.rows);
  const grid: (HTMLTableCellElement | null)[][] = [];

  rows.forEach((row, rowIndex) => {
    if (!grid[rowIndex]) {
      grid[rowIndex] = [];
    }

    let colIndex = 0;
    Array.from(row.cells).forEach(cell => {
      // 跳过已被之前的单元格占据的列
      while (grid[rowIndex][colIndex]) {
        colIndex++;
      }

      const rowSpan = cell.rowSpan || 1;
      const colSpan = cell.colSpan || 1;

      // 在网格中标记这个单元格占据的所有位置
      for (let r = 0; r < rowSpan; r++) {
        for (let c = 0; c < colSpan; c++) {
          if (!grid[rowIndex + r]) {
            grid[rowIndex + r] = [];
          }
          grid[rowIndex + r][colIndex + c] = cell;
        }
      }

      colIndex += colSpan;
    });
  });

  return grid;
}

// 拆分单元格
export function splitCell(cell: HTMLTableCellElement) {
  const rowSpan = cell.rowSpan;
  const colSpan = cell.colSpan;

  if (rowSpan <= 1 && colSpan <= 1) return;

  const table = cell.closest('table') as HTMLTableElement;
  if (!table) return;

  const startRow = (cell.parentElement as HTMLTableRowElement).rowIndex;
  const grid = buildTableGrid(table);
  
  // 查找当前单元格在网格中的起始逻辑列
  let startCol = -1;
  for (let c = 0; c < grid[startRow].length; c++) {
    if (grid[startRow][c] === cell) {
      startCol = c;
      break;
    }
  }

  if (startCol === -1) return;

  // 恢复当前单元格为 1x1
  cell.rowSpan = 1;
  cell.colSpan = 1;

  // 重新创建并插入被合并掉的单元格
  for (let r = 0; r < rowSpan; r++) {
    const currentRowIndex = startRow + r;
    const row = table.rows[currentRowIndex];
    if (!row) continue;

    // 计算物理插入索引
    // 我们需要知道在当前行中，起始逻辑列 startCol 对应的物理单元格索引是多少
    // 物理索引是所有在 startCol 之前的单元格数量（不包括被 rowSpan 跨越到此行的单元格）
    
    // 对于第一行 (r=0)，我们跳过第一个单元格 (c=0)
    for (let c = (r === 0 ? 1 : 0); c < colSpan; c++) {
      const currentLogicalCol = startCol + c;
      
      // 计算物理索引：逻辑列 currentLogicalCol 之前的单元格数
      let physicalIndex = 0;
      for (let prevCol = 0; prevCol < currentLogicalCol; prevCol++) {
        const prevCell = grid[currentRowIndex][prevCol];
        // 如果该位置有单元格，且该单元格是在这一行定义的（其起始行是当前行）
        // 则它占据了一个物理索引位
        if (prevCell && (prevCell.parentElement as HTMLTableRowElement).rowIndex === currentRowIndex) {
          // 我们需要检查这个单元格是不是第一次出现（防止 colSpan 计入多次）
          // 这里通过判断网格中前一格是否相同来识别
          if (prevCol === 0 || grid[currentRowIndex][prevCol - 1] !== prevCell) {
            physicalIndex++;
          }
        }
      }

      const newCell = row.insertCell(physicalIndex);
      newCell.innerHTML = '&nbsp;';
      newCell.style.border = cell.style.border || '1px solid hsl(var(--border))';
      newCell.style.padding = cell.style.padding || '12px 20px';
      newCell.style.width = cell.style.width || '150px';
      newCell.style.minHeight = '1.5em';
    }
  }
}

// 设置单元格对齐方式
export function setCellAlignment(cells: HTMLTableCellElement[], alignment: string) {
  const [vertical, horizontal] = alignment.split('-');
  
  cells.forEach(cell => {
    cell.style.verticalAlign = vertical === 'top' ? 'top' : vertical === 'middle' ? 'middle' : 'bottom';
    cell.style.textAlign = horizontal === 'left' ? 'left' : horizontal === 'center' ? 'center' : 'right';
  });
}

// 选择单元格
export function selectCell(cell: HTMLTableCellElement) {
  cell.classList.add('selected');
}

// 选择行
export function selectRow(table: HTMLTableElement, rowIndex: number) {
  const row = table.rows[rowIndex];
  if (row) {
    Array.from(row.cells).forEach(cell => cell.classList.add('selected'));
  }
}

// 选择列
export function selectColumn(table: HTMLTableElement, colIndex: number) {
  Array.from(table.rows).forEach(row => {
    const cell = row.cells[colIndex];
    if (cell) cell.classList.add('selected');
  });
}

// 选择表格
export function selectTable(table: HTMLTableElement) {
  Array.from(table.querySelectorAll('td, th')).forEach(cell => cell.classList.add('selected'));
}
