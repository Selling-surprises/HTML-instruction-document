/**
 * 段落渲染引擎 - 实现 Canvas 渲染逻辑，修复基线对齐问题
 */
export class ParagraphRenderer {
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * 渲染段落 - 处理首行缩进和悬挂缩进，确保基线对齐
   */
  render(paragraph: any, x: number, y: number, availableWidth: number) {
    // 【关键】计算实际可用宽度（减去左右缩进）
    const leftIndentPx = this.charsToPixels(paragraph.indent.left);
    const rightIndentPx = this.charsToPixels(paragraph.indent.right);
    const contentWidth = availableWidth - leftIndentPx - rightIndentPx;
    
    // 【关键】计算首行和后续行的起始 X 坐标
    const firstLineIndentPx = this.charsToPixels(paragraph.indent.firstLine);
    const hangingIndentPx = this.charsToPixels(paragraph.indent.hanging);
    
    // 第一行的起始 X = 段落 X + 左缩进 + 首行缩进
    const firstLineX = x + leftIndentPx + firstLineIndentPx;
    
    // 后续行的起始 X = 段落 X + 左缩进 + 悬挂缩进（如果有）
    const otherLinesX = x + leftIndentPx + hangingIndentPx;
    
    // 预计算文本布局（折行）
    const lines = this.layoutText(paragraph, contentWidth);
    
    // 【关键】统一计算行高和基线偏移
    const lineHeight = this.getLineHeight(paragraph);
    const fontSize = paragraph.runs[0]?.fontSize || 16;
    
    // 设置字体以测量度量
    this.ctx.font = this.buildFont(paragraph.runs[0] || { fontSize: 16, fontFamily: 'SimSun' });
    
    // 【关键】测量字体度量
    const fontMetrics = this.measureFontMetrics(fontSize);
    
    // 【关键】计算基线偏移：使文字在行框内垂直居中
    // 基线位置 = 行顶部 + (行高 / 2) + (ascent - descent) / 2
    const baselineFromLineTop = (lineHeight / 2) + ((fontMetrics.ascent - fontMetrics.descent) / 2);
    
    console.log('=== 段落渲染调试（基线对齐） ===');
    console.log('行高:', lineHeight);
    console.log('字体大小:', fontSize);
    console.log('ascent:', fontMetrics.ascent, 'descent:', fontMetrics.descent);
    console.log('基线偏移（从行顶部）:', baselineFromLineTop);
    
    // 绘制每一行
    let currentLineTopY = y; // 当前行的顶部 Y 坐标
    
    lines.forEach((line: any, lineIndex: number) => {
      // 【关键】判断是第一行还是后续行，应用不同的缩进（只影响 X，不影响 Y）
      const isFirstLine = (lineIndex === 0);
      const startX = isFirstLine ? firstLineX : otherLinesX;
      
      // 处理对齐
      const lineX = this.applyAlignment(
        startX,
        line.width,
        contentWidth,
        paragraph.align
      );
      
      // 【关键】计算该行的基线 Y 坐标（所有行使用相同的计算方式）
      // 基线 Y = 行顶部 Y + 基线偏移
      const baselineY = currentLineTopY + baselineFromLineTop;
      
      // 调试日志：打印前两行的基线位置
      if (lineIndex <= 1) {
        console.log(`行 ${lineIndex}: lineTopY=${currentLineTopY.toFixed(2)}, baselineY=${baselineY.toFixed(2)}, X=${lineX.toFixed(2)}`);
      }
      
      // 【关键】绘制文本，传入基线 Y 坐标
      this.drawTextLine(line, lineX, baselineY);
      
      // 移动到下一行（增加行高）
      currentLineTopY += lineHeight;
    });
    
    return currentLineTopY; // 返回下一段落的起始 Y
  }

  /**
   * 【关键】测量字体度量（ascent, descent, height）
   */
  measureFontMetrics(fontSize: number) {
    // 方法 1：使用 actualBoundingBox（较新浏览器支持）
    const metrics = this.ctx.measureText('M');
    
    if (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) {
      return {
        ascent: metrics.actualBoundingBoxAscent,
        descent: metrics.actualBoundingBoxDescent,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      };
    }
    
    // 方法 2：使用近似值（兼容性更好）
    return {
      ascent: fontSize * 0.8,    // 基线到顶部的近似距离
      descent: fontSize * 0.2,   // 基线到底部的近似距离
      height: fontSize           // 总高度近似为字体大小
    };
  }

  /**
   * 字符数转换为像素
   */
  charsToPixels(chars: number) {
    if (chars === 0) return 0;
    
    // 【关键】测量当前字体下一个字符的平均宽度
    const metrics = this.ctx.measureText('中');
    const avgCharWidth = metrics.width;
    
    return chars * avgCharWidth;
  }

  /**
   * 文本折行计算
   */
  layoutText(paragraph: any, maxWidth: number) {
    const lines: any[] = [];
    let currentLine: any = { text: '', width: 0, chars: [] };
    
    for (const run of paragraph.runs) {
      this.ctx.font = this.buildFont(run);
      
      for (const char of run.text) {
        const charWidth = this.ctx.measureText(char).width;
        
        // 检查是否超出行宽
        if (currentLine.width + charWidth > maxWidth && currentLine.chars.length > 0) {
          lines.push(currentLine);
          currentLine = { text: '', width: 0, chars: [] };
        }
        
        currentLine.chars.push({ char, width: charWidth, style: run });
        currentLine.text += char;
        currentLine.width += charWidth;
      }
    }
    
    if (currentLine.chars.length > 0) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * 应用对齐方式
   */
  applyAlignment(startX: number, lineWidth: number, contentWidth: number, align: string) {
    switch (align) {
      case 'center':
        return startX + (contentWidth - lineWidth) / 2;
      case 'right':
        return startX + (contentWidth - lineWidth);
      default:
        return startX;
    }
  }

  /**
   * 绘制单行文本
   * @param line 行数据
   * @param x 行起始 X 坐标
   * @param baselineY 基线 Y 坐标（已经计算好的）
   */
  drawTextLine(line: any, x: number, baselineY: number) {
    let currentX = x;
    
    // 【关键】不要在这里重新计算基线偏移！直接使用传入的 baselineY
    for (const charInfo of line.chars) {
      this.ctx.font = this.buildFont(charInfo.style);
      this.ctx.fillStyle = charInfo.style.color || '#000';
      
      // 【关键】fillText 的 y 参数是基线位置，直接使用 baselineY
      this.ctx.fillText(charInfo.char, currentX, baselineY);
      
      currentX += charInfo.width;
    }
  }

  buildFont(style: any) {
    let font = '';
    if (style.italic) font += 'italic ';
    if (style.bold) font += 'bold ';
    font += `${style.fontSize || 16}px ${style.fontFamily || 'SimSun, serif'}`;
    return font;
  }

  getLineHeight(paragraph: any) {
    const fontSize = paragraph.runs[0]?.fontSize || 16;
    
    if (typeof paragraph.spacing.line === 'object') {
      if (paragraph.spacing.line.type === 'fixed') {
        return paragraph.spacing.line.value;
      } else {
        return fontSize * paragraph.spacing.line.value;
      }
    } else if (typeof paragraph.spacing.line === 'number') {
        return fontSize * paragraph.spacing.line;
    }
    
    return fontSize * 1.5;
  }
}
