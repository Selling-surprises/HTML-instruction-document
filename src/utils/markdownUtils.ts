/**
 * HTML到Markdown转换工具
 * 支持本地图片（base64）和各种HTML元素
 */

/**
 * 将HTML内容转换为Markdown格式
 */
export function htmlToMarkdown(html: string): string {
  // 创建临时DOM元素
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 转换为Markdown
  return processNode(tempDiv);
}

/**
 * 处理DOM节点，递归转换为Markdown
 */
function processNode(node: Node): string {
  let result = '';
  
  // 文本节点
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }
  
  // 元素节点
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'h1':
        result = `# ${getTextContent(element)}\n\n`;
        break;
        
      case 'h2':
        result = `## ${getTextContent(element)}\n\n`;
        break;
        
      case 'h3':
        result = `### ${getTextContent(element)}\n\n`;
        break;
        
      case 'h4':
        result = `#### ${getTextContent(element)}\n\n`;
        break;
        
      case 'h5':
        result = `##### ${getTextContent(element)}\n\n`;
        break;
        
      case 'h6':
        result = `###### ${getTextContent(element)}\n\n`;
        break;
        
      case 'p':
        result = `${processChildren(element)}\n\n`;
        break;
        
      case 'strong':
      case 'b':
        result = `**${getTextContent(element)}**`;
        break;
        
      case 'em':
      case 'i':
        result = `*${getTextContent(element)}*`;
        break;
        
      case 'u':
        // Markdown没有下划线，使用HTML标签
        result = `<u>${getTextContent(element)}</u>`;
        break;
        
      case 's':
      case 'strike':
      case 'del':
        result = `~~${getTextContent(element)}~~`;
        break;
        
      case 'a':
        const href = element.getAttribute('href') || '';
        const linkText = getTextContent(element);
        result = `[${linkText}](${href})`;
        break;
        
      case 'img':
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || '图片';
        result = `![${alt}](${src})\n\n`;
        break;
        
      case 'br':
        result = '\n';
        break;
        
      case 'hr':
        result = '\n---\n\n';
        break;
        
      case 'ul':
        result = processUnorderedList(element) + '\n';
        break;
        
      case 'ol':
        result = processOrderedList(element) + '\n';
        break;
        
      case 'li':
        // 由ul/ol处理
        result = processChildren(element);
        break;
        
      case 'blockquote':
        const lines = processChildren(element).split('\n');
        result = lines.map(line => line ? `> ${line}` : '>').join('\n') + '\n\n';
        break;
        
      case 'code':
        // 检查是否在pre标签内（代码块）
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          // 由pre处理
          result = getTextContent(element);
        } else {
          // 行内代码
          result = `\`${getTextContent(element)}\``;
        }
        break;
        
      case 'pre':
        const codeElement = element.querySelector('code');
        const code = codeElement ? getTextContent(codeElement) : getTextContent(element);
        const language = codeElement?.getAttribute('class')?.replace('language-', '') || '';
        result = `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        break;
        
      case 'table':
        result = processTable(element) + '\n';
        break;
        
      case 'video':
        // 视频转换为HTML标签（Markdown不支持视频）
        const videoSrc = element.getAttribute('src') || '';
        result = `\n<video src="${videoSrc}" controls></video>\n\n`;
        break;
        
      case 'audio':
        // 音频转换为HTML标签（Markdown不支持音频）
        const audioSrc = element.getAttribute('src') || '';
        result = `\n<audio src="${audioSrc}" controls></audio>\n\n`;
        break;
        
      case 'iframe':
        // iframe保留为HTML
        result = `\n${element.outerHTML}\n\n`;
        break;
        
      case 'div':
        // 检查是否是特殊容器
        if (element.classList.contains('link-card')) {
          result = processLinkCard(element);
        } else if (element.querySelector('video, audio, iframe')) {
          // 包含媒体元素的div
          result = processChildren(element);
        } else {
          result = processChildren(element);
        }
        break;
        
      case 'span':
        // 检查是否有特殊样式
        const style = element.getAttribute('style') || '';
        const content = processChildren(element);
        
        if (style.includes('background-color') || style.includes('background:')) {
          // 高亮文本，使用HTML标签
          result = `<mark>${content}</mark>`;
        } else if (style.includes('color')) {
          // 彩色文本，使用HTML标签
          result = `<span style="${style}">${content}</span>`;
        } else {
          result = content;
        }
        break;
        
      default:
        // 其他元素，处理子节点
        result = processChildren(element);
        break;
    }
  }
  
  return result;
}

/**
 * 处理子节点
 */
function processChildren(element: HTMLElement): string {
  let result = '';
  for (const child of Array.from(element.childNodes)) {
    result += processNode(child);
  }
  return result;
}

/**
 * 获取元素的纯文本内容（递归处理格式）
 */
function getTextContent(element: HTMLElement): string {
  let result = '';
  
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as HTMLElement;
      const tagName = childElement.tagName.toLowerCase();
      
      switch (tagName) {
        case 'strong':
        case 'b':
          result += `**${getTextContent(childElement)}**`;
          break;
        case 'em':
        case 'i':
          result += `*${getTextContent(childElement)}*`;
          break;
        case 's':
        case 'strike':
        case 'del':
          result += `~~${getTextContent(childElement)}~~`;
          break;
        case 'code':
          result += `\`${childElement.textContent || ''}\``;
          break;
        case 'br':
          result += '\n';
          break;
        default:
          result += getTextContent(childElement);
          break;
      }
    }
  }
  
  return result;
}

/**
 * 处理无序列表
 */
function processUnorderedList(element: HTMLElement, indent = 0): string {
  let result = '';
  const items = element.querySelectorAll(':scope > li');
  
  for (const item of Array.from(items)) {
    const prefix = '  '.repeat(indent) + '- ';
    const content = processListItem(item as HTMLElement, indent);
    result += prefix + content + '\n';
  }
  
  return result;
}

/**
 * 处理有序列表
 */
function processOrderedList(element: HTMLElement, indent = 0): string {
  let result = '';
  const items = element.querySelectorAll(':scope > li');
  
  items.forEach((item, index) => {
    const prefix = '  '.repeat(indent) + `${index + 1}. `;
    const content = processListItem(item as HTMLElement, indent);
    result += prefix + content + '\n';
  });
  
  return result;
}

/**
 * 处理列表项
 */
function processListItem(item: HTMLElement, indent: number): string {
  let result = '';
  
  for (const child of Array.from(item.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      if (tagName === 'ul') {
        result += '\n' + processUnorderedList(element, indent + 1);
      } else if (tagName === 'ol') {
        result += '\n' + processOrderedList(element, indent + 1);
      } else {
        result += processNode(element);
      }
    }
  }
  
  return result.trim();
}

/**
 * 处理表格
 */
function processTable(table: HTMLElement): string {
  let result = '';
  
  // 获取所有行
  const rows = table.querySelectorAll('tr');
  if (rows.length === 0) return '';
  
  // 处理表头
  const headerRow = rows[0];
  const headerCells = headerRow.querySelectorAll('th, td');
  const headers: string[] = [];
  
  headerCells.forEach(cell => {
    headers.push(getTextContent(cell as HTMLElement).trim());
  });
  
  result += '| ' + headers.join(' | ') + ' |\n';
  result += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  // 处理数据行
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll('td');
    const cellContents: string[] = [];
    
    cells.forEach(cell => {
      cellContents.push(getTextContent(cell as HTMLElement).trim());
    });
    
    result += '| ' + cellContents.join(' | ') + ' |\n';
  }
  
  return result;
}

/**
 * 处理链接卡片
 */
function processLinkCard(element: HTMLElement): string {
  const titleElement = element.querySelector('.link-card-title');
  const descElement = element.querySelector('.link-card-description');
  const linkElement = element.querySelector('a');
  
  const title = titleElement?.textContent?.trim() || '';
  const desc = descElement?.textContent?.trim() || '';
  const url = linkElement?.getAttribute('href') || '';
  
  let result = '';
  
  if (title && url) {
    result += `### [${title}](${url})\n\n`;
    if (desc) {
      result += `${desc}\n\n`;
    }
  } else if (url) {
    result += `[${url}](${url})\n\n`;
  }
  
  return result;
}

/**
 * 清理Markdown文本
 */
export function cleanMarkdown(markdown: string): string {
  // 移除多余的空行（超过2个连续换行）
  let cleaned = markdown.replace(/\n{3,}/g, '\n\n');
  
  // 移除开头和结尾的空行
  cleaned = cleaned.trim();
  
  // 确保文件以换行符结尾
  if (!cleaned.endsWith('\n')) {
    cleaned += '\n';
  }
  
  return cleaned;
}

/**
 * 导出Markdown文件
 */
export function exportMarkdown(content: string, filename: string = '文档.md'): void {
  // 转换HTML到Markdown
  const markdown = htmlToMarkdown(content);
  
  // 清理Markdown
  const cleanedMarkdown = cleanMarkdown(markdown);
  
  // 创建Blob
  const blob = new Blob([cleanedMarkdown], { type: 'text/markdown;charset=utf-8' });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
