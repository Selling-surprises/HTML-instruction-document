import { ContextMenuItem, ContextInfo } from '@/types/contextMenu';

/**
 * 上下文菜单构建器
 * 根据不同的上下文类型生成对应的菜单项
 */
export class ContextMenuBuilder {
  /**
   * 构建通用菜单项（剪切、复制、粘贴）
   */
  private static getCommonItems(): ContextMenuItem[] {
    return [
      { label: '剪切(T)', command: 'cut', shortcut: 'Ctrl+X' },
      { label: '复制(C)', command: 'copy', shortcut: 'Ctrl+C' },
      { label: '粘贴(P)', command: 'paste', shortcut: 'Ctrl+V', divider: true }
    ];
  }

  /**
   * 构建插入子菜单
   */
  private static getInsertSubmenu(): ContextMenuItem[] {
    return [
      { label: '分页符', command: 'insertPageBreak' },
      { label: '分栏符', command: 'insertColumnBreak' },
      { label: '分节符', command: 'insertSectionBreak', divider: true },
      { label: '图片', command: 'insertImage' },
      { label: '表格', command: 'insertTable' },
      { label: '超链接', command: 'insertHyperlink' }
    ];
  }

  /**
   * 构建段落菜单
   */
  private static getParagraphMenu(): ContextMenuItem[] {
    return [
      ...this.getCommonItems(),
      { label: '字体(F)...', command: 'fontDialog', divider: true },
      { label: '段落(P)...', command: 'paragraphDialog' },
      {
        label: '项目符号(N)',
        submenu: [
          { label: '● 实心圆', command: 'bullet', value: 'disc' },
          { label: '○ 空心圆', command: 'bullet', value: 'circle' },
          { label: '■ 实心方框', command: 'bullet', value: 'square' },
          { label: '▪ 小方块', command: 'bullet', value: 'square-small' },
          { label: '无', command: 'bullet', value: 'none' }
        ]
      },
      {
        label: '编号(G)',
        submenu: [
          { label: '1. 2. 3.', command: 'numbering', value: 'decimal' },
          { label: 'I. II. III.', command: 'numbering', value: 'upper-roman' },
          { label: 'i. ii. iii.', command: 'numbering', value: 'lower-roman' },
          { label: 'A. B. C.', command: 'numbering', value: 'upper-alpha' },
          { label: 'a. b. c.', command: 'numbering', value: 'lower-alpha' },
          { label: '无', command: 'numbering', value: 'none' }
        ],
        divider: true
      },
      { label: '插入(I)', submenu: this.getInsertSubmenu() },
      { label: '删除(D)', command: 'delete' },
      { label: '全选(A)', command: 'selectAll', shortcut: 'Ctrl+A', divider: true },
      { label: '新建批注(M)', command: 'newComment' },
      { label: '链接(K)...', command: 'hyperlink' }
    ];
  }

  /**
   * 构建表格菜单
   */
  private static getTableMenu(context: ContextInfo): ContextMenuItem[] {
    const canMerge = context.cells && context.cells.length > 1;
    const canSplit = context.cell && 
      (context.cell.rowSpan > 1 || context.cell.colSpan > 1);

    return [
      ...this.getCommonItems(),
      {
        label: '插入(I)',
        submenu: [
          { label: '在上方插入行', command: 'insertRow', position: 'above' },
          { label: '在下方插入行', command: 'insertRow', position: 'below' },
          { label: '在左侧插入列', command: 'insertCol', position: 'left' },
          { label: '在右侧插入列', command: 'insertCol', position: 'right' }
        ],
        divider: true
      },
      {
        label: '删除单元格(D)',
        submenu: [
          { label: '删除单元格', command: 'deleteCell' },
          { label: '删除行', command: 'deleteRow' },
          { label: '删除列', command: 'deleteCol' },
          { label: '删除表格', command: 'deleteTable' }
        ],
        divider: true
      },
      {
        label: '选择(S)',
        submenu: [
          { label: '选择单元格', command: 'selectCell' },
          { label: '选择列', command: 'selectCol' },
          { label: '选择行', command: 'selectRow' },
          { label: '选择表格', command: 'selectTable' }
        ]
      },
      { 
        label: '合并单元格(M)', 
        command: 'mergeCells',
        disabled: !canMerge 
      },
      { 
        label: '拆分单元格(P)...', 
        command: 'splitCell',
        disabled: !canSplit,
        divider: true
      },
      { label: '表格属性(R)...', command: 'tableProperties' },
      { label: '边框和底纹(B)...', command: 'tableBorders', divider: true },
      {
        label: '单元格对齐方式(A)',
        submenu: [
          { label: '顶端左对齐', command: 'cellAlign', align: 'top-left' },
          { label: '顶端居中', command: 'cellAlign', align: 'top-center' },
          { label: '顶端右对齐', command: 'cellAlign', align: 'top-right' },
          { label: '中部左对齐', command: 'cellAlign', align: 'middle-left' },
          { label: '中部居中', command: 'cellAlign', align: 'middle-center' },
          { label: '中部右对齐', command: 'cellAlign', align: 'middle-right' },
          { label: '底端左对齐', command: 'cellAlign', align: 'bottom-left' },
          { label: '底端居中', command: 'cellAlign', align: 'bottom-center' },
          { label: '底端右对齐', command: 'cellAlign', align: 'bottom-right' }
        ]
      },
      {
        label: '自动调整(F)',
        submenu: [
          { label: '根据内容调整表格', command: 'autoFit', mode: 'content' },
          { label: '根据窗口调整表格', command: 'autoFit', mode: 'window' },
          { label: '固定列宽', command: 'autoFit', mode: 'fixed' }
        ],
        divider: true
      },
      { label: '文字方向(X)', command: 'textDirection' },
      { label: '排序(O)...', command: 'sortTable' }
    ];
  }

  /**
   * 构建图片菜单
   */
  private static getImageMenu(): ContextMenuItem[] {
    return [
      ...this.getCommonItems(),
      { label: '更改图片(C)', command: 'changeImage' },
      { label: '另存为图片(S)...', command: 'saveImageAs' },
      { label: '大小和位置(Z)...', command: 'imageSizeDialog', divider: true },
      { label: '设置图片格式(F)...', command: 'imageFormat' },
      {
        label: '环绕文字(W)',
        submenu: [
          { label: '嵌入型', command: 'wrapText', value: 'inline' },
          { label: '四周型', command: 'wrapText', value: 'square' },
          { label: '紧密型', command: 'wrapText', value: 'tight' },
          { label: '穿越型', command: 'wrapText', value: 'through' },
          { label: '上下型环绕', command: 'wrapText', value: 'top-bottom' },
          { label: '衬于文字下方', command: 'wrapText', value: 'behind' },
          { label: '浮于文字上方', command: 'wrapText', value: 'in-front' }
        ],
        divider: true
      },
      {
        label: '对齐方式(G)',
        submenu: [
          { label: '左对齐', command: 'alignImage', align: 'left' },
          { label: '居中', command: 'alignImage', align: 'center' },
          { label: '右对齐', command: 'alignImage', align: 'right' }
        ]
      },
      {
        label: '旋转(R)',
        submenu: [
          { label: '向右旋转 90°', command: 'rotate', angle: 90 },
          { label: '向左旋转 90°', command: 'rotate', angle: -90 },
          { label: '垂直翻转', command: 'flip', direction: 'vertical' },
          { label: '水平翻转', command: 'flip', direction: 'horizontal' }
        ]
      },
      { label: '裁剪(P)', command: 'cropImage', divider: true },
      { label: '插入题注(N)...', command: 'insertCaption' },
      { label: '超链接(K)...', command: 'hyperlink' }
    ];
  }

  /**
   * 构建空白处菜单
   */
  private static getBlankMenu(): ContextMenuItem[] {
    return [
      { label: '粘贴(P)', command: 'paste', shortcut: 'Ctrl+V' },
      {
        label: '粘贴选项',
        submenu: [
          { label: '保留源格式', command: 'pasteSpecial', value: 'keep-source' },
          { label: '合并格式', command: 'pasteSpecial', value: 'merge-format' },
          { label: '只保留文本', command: 'pasteSpecial', value: 'text-only' }
        ],
        divider: true
      },
      { label: '段落(P)...', command: 'paragraphDialog' },
      { label: '制表位(T)...', command: 'tabsDialog', divider: true },
      { label: '插入符号(I)', command: 'insertSymbol' },
      { label: '编号(N)', command: 'insertNumbering' },
      { label: '项目符号(B)', command: 'insertBullet', divider: true },
      { label: '全选(A)', command: 'selectAll', shortcut: 'Ctrl+A' },
      { label: '字体(F)...', command: 'fontDialog' }
    ];
  }

  /**
   * 根据上下文构建菜单
   * 只为表格显示右键菜单，其他情况不显示
   */
  static buildMenu(context: ContextInfo): ContextMenuItem[] {
    switch (context.type) {
      case 'table-cell':
      case 'table-multi-select':
        return this.getTableMenu(context);
      
      case 'paragraph':
      case 'selection':
      case 'image':
      case 'blank':
      default:
        // 不显示菜单
        return [];
    }
  }
}
