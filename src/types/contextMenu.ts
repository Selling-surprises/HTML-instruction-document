// 右键菜单项类型定义
export interface ContextMenuItem {
  label: string;
  command?: string;
  shortcut?: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
  value?: any;
  position?: string;
  align?: string;
  angle?: number;
  direction?: string;
  mode?: string;
}

// 上下文类型
export type ContextType = 
  | 'paragraph'
  | 'table-cell'
  | 'table-multi-select'
  | 'table-border'
  | 'image'
  | 'selection'
  | 'blank';

// 上下文信息
export interface ContextInfo {
  type: ContextType;
  element?: HTMLElement;
  table?: HTMLTableElement;
  cell?: HTMLTableCellElement;
  cells?: HTMLTableCellElement[];
  row?: number;
  col?: number;
  position?: { x: number; y: number };
  borderType?: 'row' | 'col';
  borderIndex?: number;
}

// 菜单位置
export interface MenuPosition {
  x: number;
  y: number;
}
