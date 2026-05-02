/**
 * Sample Page
 */

import { useEffect, useRef } from 'react';
import PageMeta from "../components/common/PageMeta";
import { Paragraph } from '../utils/Paragraph';
import { ParagraphRenderer } from '../utils/ParagraphRenderer';

export default function SamplePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. 创建测试段落
    const text = '这是一段很长的测试文字，用于测试首行缩进功能是否正确工作。我们需要确保第一行有缩进，而后续行没有缩进。我们将设置首行缩进为 2 字符，并验证所有行的基线是否对齐。';
    const p = new Paragraph(text);
    
    // 2. 模拟对话框设置
    p.applyDialogSettings({
      specialIndent: 'first-line',
      specialIndentValue: 2,  // 2 字符
      leftIndent: 0,
      rightIndent: 0,
      alignment: 'left',
      spaceBefore: 0,
      spaceAfter: 0,
      lineSpacing: 'single'
    });

    // 调试日志输出
    console.log('=== 段落渲染调试 ===');
    console.log('段落文本:', p.text.substring(0, 20) + '...');
    console.log('缩进设置:', JSON.stringify(p.indent));
    
    const charWidth = ctx.measureText('中').width;
    console.log('参考字符宽度(中):', charWidth);
    
    const firstLineX = 100 + (p.indent.left * charWidth) + (p.indent.firstLine * charWidth);
    console.log('首行起始 X:', firstLineX, '(期望 > 100)');

    // 3. 渲染
    const renderer = new ParagraphRenderer(ctx);
    const startY = 100;
    const endY = renderer.render(p, 100, startY, 400); // x=100, y=100, 宽度=400

    // 绘制辅助线（在渲染后）
    ctx.save();
    
    // 左边界线
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, startY - 20);
    ctx.lineTo(100, endY + 20);
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.font = '12px Arial';
    ctx.fillText('左边界 (x=100)', 100, startY - 25);
    
    // 首行缩进参考线
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(firstLineX, startY - 20);
    ctx.lineTo(firstLineX, startY + 30);
    ctx.stroke();
    ctx.fillStyle = 'blue';
    ctx.fillText(`首行起始 (x=${firstLineX.toFixed(0)})`, firstLineX, startY - 25);
    
    // 绘制基线参考线（水平虚线）
    ctx.strokeStyle = 'rgba(0, 200, 0, 0.2)';
    ctx.setLineDash([2, 2]);
    const lineHeight = 16 * 1.5; // fontSize * spacing
    for (let i = 0; i < 4; i++) {
      const baselineY = startY + (lineHeight / 2) + (16 * 0.8 - 16 * 0.2) / 2 + i * lineHeight;
      ctx.beginPath();
      ctx.moveTo(90, baselineY);
      ctx.lineTo(510, baselineY);
      ctx.stroke();
    }
    
    ctx.restore();

  }, []);

  return (
    <>
      <PageMeta title="Canvas 渲染验证" description="验证首行缩进修复结果" />
      <div className="p-8">
        <h3 className="text-xl font-bold mb-4">Canvas 首行缩进渲染验证（基线对齐修复）</h3>
        <p className="mb-4 text-sm text-gray-600">
          下图演示了基于 Canvas 的段落渲染，首行应缩进 2 字符（蓝色虚线）。
          <strong className="text-green-600">绿色水平虚线</strong>表示每行的基线位置，所有行的文字应该对齐在这些线上。
        </p>
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={400} 
          className="border border-gray-300 shadow-sm rounded bg-white"
        />
        <div className="mt-4 bg-gray-100 p-4 rounded text-xs font-mono space-y-2">
          <p className="font-bold">控制台已输出调试日志。关键验证点：</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li><strong>首行缩进只影响 X 坐标</strong>：firstLineX = x + leftIndentPx + firstLineIndentPx</li>
            <li><strong>所有行的基线计算一致</strong>：baselineY = lineTopY + baselineFromLineTop</li>
            <li><strong>行间距固定</strong>：第一行和第二行的 baselineY 差值应该等于 lineHeight（约 24px）</li>
            <li><strong>视觉检查</strong>：所有文字应该对齐在绿色水平虚线上，第一行不应该向上或向下偏移</li>
          </ul>
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800"><strong>⚠️ 如果第一行向上偏移：</strong></p>
            <p className="text-yellow-700 ml-2">检查是否错误地将 indent 值加到了 Y 坐标上</p>
          </div>
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800"><strong>✅ 修复后的效果：</strong></p>
            <p className="text-green-700 ml-2">所有行的文字基线对齐，首行只是水平向右缩进</p>
          </div>
        </div>
      </div>
    </>
  );
}
