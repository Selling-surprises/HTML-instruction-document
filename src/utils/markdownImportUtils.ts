/**
 * Markdown导入工具
 * 用于导入Markdown文件并转换为HTML
 */

import { marked } from 'marked';

/**
 * 配置marked选项
 */
function configureMarked() {
  marked.setOptions({
    gfm: true, // 启用GitHub Flavored Markdown
    breaks: true, // 支持换行符转换为<br>
  });
}

/**
 * 转义HTML特殊字符
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 将Markdown转换为HTML
 */
export function markdownToHtml(markdown: string): string {
  // 配置marked
  configureMarked();

  // 预处理Markdown
  let processedMarkdown = preprocessMarkdown(markdown);

  // 转换为HTML
  let html = marked.parse(processedMarkdown) as string;

  // 后处理HTML
  html = postprocessHtml(html);

  return html;
}

/**
 * 预处理Markdown
 */
function preprocessMarkdown(markdown: string): string {
  let processed = markdown;

  // 处理Windows换行符
  processed = processed.replace(/\r\n/g, '\n');

  // 处理连续的空行（保留最多2个）
  processed = processed.replace(/\n{3,}/g, '\n\n');

  return processed;
}

/**
 * 后处理HTML
 */
function postprocessHtml(html: string): string {
  let processed = html;

  // 移除marked添加的外层<p>标签（如果有）
  // processed = processed.trim();

  // 处理代码块，确保有正确的class
  processed = processed.replace(
    /<pre><code class="language-(\w+)">/g,
    '<pre><code class="language-$1">'
  );

  // 处理没有语言标识的代码块
  processed = processed.replace(
    /<pre><code class="language-">/g,
    '<pre><code>'
  );

  // 清理多余的空白
  processed = processed.trim();

  return processed;
}

/**
 * 从Markdown文件中提取元数据（如果有）
 */
export function extractMetadata(markdown: string): {
  title?: string;
  metadata: { [key: string]: string };
  content: string;
} {
  const result: {
    title?: string;
    metadata: { [key: string]: string };
    content: string;
  } = {
    metadata: {},
    content: markdown,
  };

  // 检查是否有YAML front matter
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontMatterRegex);

  if (match) {
    const frontMatter = match[1];
    result.content = match[2];

    // 解析front matter
    const lines = frontMatter.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        result.metadata[key] = value;

        // 提取标题
        if (key === 'title') {
          result.title = value;
        }
      }
    }
  } else {
    // 尝试从第一个标题提取标题
    const firstHeadingMatch = markdown.match(/^#\s+(.+)$/m);
    if (firstHeadingMatch) {
      result.title = firstHeadingMatch[1];
    }
  }

  return result;
}

/**
 * 导入Markdown文件
 */
export async function importMarkdownFile(file: File): Promise<{
  content: string;
  title?: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const markdownContent = event.target?.result as string;

        if (!markdownContent) {
          throw new Error('文件内容为空');
        }

        // 提取元数据
        const { title, content: markdownText } = extractMetadata(markdownContent);

        // 转换为HTML
        const htmlContent = markdownToHtml(markdownText);

        resolve({
          content: htmlContent,
          title,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 清理HTML（移除不必要的标签和属性）
 */
export function cleanupImportedHtml(html: string): string {
  // 创建临时DOM
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // 移除script标签
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // 移除style标签（保留内联样式）
  const styles = tempDiv.querySelectorAll('style');
  styles.forEach(style => style.remove());

  // 移除危险的事件属性
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(element => {
    // 移除事件属性
    const attributes = element.attributes;
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    }
  });

  return tempDiv.innerHTML;
}
