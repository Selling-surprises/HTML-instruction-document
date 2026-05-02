/**
 * 段落数据结构 - 处理缩进、间距和对齐
 */
export class Paragraph {
  text: string;
  runs: any[]; // 文本片段（带格式）
  indent: {
    firstLine: number; // 首行缩进：字符数（如 2 表示缩进 2 字符）
    hanging: number;   // 悬挂缩进：字符数
    left: number;      // 左缩进：整个段落左缩进字符数
    right: number;     // 右缩进：整个段落右缩进字符数
  };
  spacing: {
    before: number;    // 段前间距（行数）
    after: number;     // 段后间距（行数）
    line: any;         // 行距（倍数或固定值）
  };
  align: 'left' | 'center' | 'right' | 'justify';

  constructor(text = '') {
    this.text = text;
    this.runs = [{ text, fontSize: 16, fontFamily: 'Arial' }];
    
    // 初始化缩进设置
    this.indent = {
      firstLine: 0,
      hanging: 0,
      left: 0,
      right: 0
    };
    
    // 初始化间距设置
    this.spacing = {
      before: 0,
      after: 0,
      line: 1.5
    };
    
    this.align = 'left';
  }

  /**
   * 从对话框数据应用设置
   */
  applyDialogSettings(settings: any) {
    // 缩进
    this.indent.left = parseFloat(settings.leftIndent) || 0;
    this.indent.right = parseFloat(settings.rightIndent) || 0;
    
    // 处理特殊格式
    switch (settings.specialIndent) {
      case 'first-line':
        this.indent.firstLine = parseFloat(settings.specialIndentValue) || 0;
        this.indent.hanging = 0;
        break;
      case 'hanging':
        this.indent.hanging = parseFloat(settings.specialIndentValue) || 0;
        this.indent.firstLine = 0;
        break;
      default:
        this.indent.firstLine = 0;
        this.indent.hanging = 0;
    }
    
    // 间距
    this.spacing.before = parseFloat(settings.spaceBefore) || 0;
    this.spacing.after = parseFloat(settings.spaceAfter) || 0;
    
    // 行距
    if (settings.lineSpacing === 'fixed') {
      this.spacing.line = { type: 'fixed', value: parseFloat(settings.lineSpacingValue) };
    } else if (settings.lineSpacing === 'multiple') {
      this.spacing.line = { type: 'multiple', value: parseFloat(settings.lineSpacingValue) };
    } else {
      this.spacing.line = settings.lineSpacing || 'single';
    }
    
    // 对齐
    this.align = settings.alignment;
  }
}
