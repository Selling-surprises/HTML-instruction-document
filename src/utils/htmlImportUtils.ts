/**
 * HTML导入工具
 * 用于导入之前导出的HTML文件（支持多页面格式）
 */

import type { EditorSettings } from '@/types/editor';

export interface ImportedPage {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  order: number;
}

export interface ImportHTMLResult {
  /** 多页面格式：包含完整页面树 */
  pages?: ImportedPage[];
  /** 单页面格式：仅包含正文内容 */
  content?: string;
  settings: Partial<EditorSettings>;
}

/**
 * 从HTML文件中提取内容和设置
 */
export function parseHTMLFile(htmlContent: string): ImportHTMLResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const settings = extractSettings(doc);

  // 检测是否为本工具导出的多页面格式
  const pageWrappers = doc.querySelectorAll('.page-content-wrapper');
  const sidebarContent = doc.querySelector('.sidebar-content');

  if (pageWrappers.length > 0 && sidebarContent) {
    // 多页面格式：递归从侧边栏 DOM 提取页面树
    const pages = extractPagesFromSidebar(doc, sidebarContent, null, 0);
    // 如果侧边栏解析失败则回退：按 DOM 顺序扁平导入
    if (pages.length === 0) {
      const fallback = extractPagesFallback(doc, pageWrappers);
      return { pages: fallback, settings };
    }
    return { pages, settings };
  }

  // 单页面格式
  const content = extractSingleContent(doc);
  return { content, settings };
}

/**
 * 递归从 .sidebar-item-group 树中提取页面（保留层级关系）
 */
function extractPagesFromSidebar(
  doc: Document,
  container: Element,
  parentId: string | null,
  startOrder: number,
): ImportedPage[] {
  const pages: ImportedPage[] = [];
  // 只选取直接子级的 .sidebar-item-group（避免跨层级混入）
  const groups = Array.from(container.children).filter(el =>
    el.classList.contains('sidebar-item-group'),
  );

  groups.forEach((group, idx) => {
    const anchor = group.querySelector(':scope > a.sidebar-item');
    if (!anchor) return;

    const dataId = anchor.getAttribute('data-id'); // "page-{uuid}"
    if (!dataId) return;

    const pageId = dataId.startsWith('page-') ? dataId.slice(5) : dataId;
    const titleEl = anchor.querySelector('.title');
    const title = titleEl?.textContent?.trim() || anchor.textContent?.trim() || '未命名页面';

    // 从对应的 page-content-wrapper 提取正文
    const wrapper = doc.getElementById(dataId) ?? doc.getElementById(pageId);
    let content = '';
    if (wrapper) {
      const cloned = wrapper.cloneNode(true) as HTMLElement;
      // 移除页面标题行（.page-title-header 或首个 h1）
      cloned.querySelectorAll('.page-title-header').forEach(el => el.remove());
      const firstH1 = cloned.querySelector('h1');
      if (firstH1) firstH1.remove();
      cleanupElement(cloned);
      content = cloned.innerHTML.trim();
    }

    pages.push({ id: pageId, title, content, parentId, order: startOrder + idx });

    // 递归处理子项
    const subItems = group.querySelector(':scope > .sidebar-sub-items');
    if (subItems) {
      const children = extractPagesFromSidebar(doc, subItems, pageId, 0);
      pages.push(...children);
    }
  });

  return pages;
}

/**
 * 回退方案：无法从侧边栏提取时，按 DOM 顺序扁平导入所有页面
 */
function extractPagesFallback(
  doc: Document,
  wrappers: NodeListOf<Element>,
): ImportedPage[] {
  return Array.from(wrappers).map((wrapper, idx) => {
    const rawId = wrapper.id; // "page-{uuid}"
    const pageId = rawId.startsWith('page-') ? rawId.slice(5) : rawId;
    const cloned = wrapper.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('.page-title-header').forEach(el => el.remove());
    const firstH1 = cloned.querySelector('h1');
    const title = firstH1?.textContent?.trim() || '未命名页面';
    if (firstH1) firstH1.remove();
    cleanupElement(cloned);
    return { id: pageId, title, content: cloned.innerHTML.trim(), parentId: null, order: idx };
  });
}

/**
 * 单页面格式：提取文档内容
 */
function extractSingleContent(doc: Document): string {
  const contentElement =
    doc.querySelector('.content') ??
    doc.querySelector('.container .content') ??
    doc.querySelector('body > .container') ??
    doc.body;

  if (!contentElement) throw new Error('无法找到文档内容');

  const cloned = contentElement.cloneNode(true) as HTMLElement;
  cleanupElement(cloned);
  return cloned.innerHTML;
}

/**
 * 清理导入元素：移除工具栏按钮、脚本、事件属性等
 * 注意：保留 contenteditable="false"（代码块、链接卡片需要）
 */
function cleanupElement(element: HTMLElement): void {
  // 移除侧边栏、图片查看器、脚本、样式
  element.querySelectorAll(
    '.floating-toc, .toc-toggle, .toc-collapse, .image-viewer, script, style, .card-actions, .link-edit-icon, .code-delete-btn, .code-edit-btn, .attachment-edit-btn, .attachment-delete-btn',
  ).forEach(el => el.remove());
  // 移除可能阻碍编辑的样式
  element.querySelectorAll('*').forEach(el => {
    if (el instanceof HTMLElement) {
      if (el.style.pointerEvents === 'none') {
        el.style.pointerEvents = '';
      }
      if (el.style.userSelect === 'none') {
        el.style.userSelect = '';
      }
    }
  });

  // 移除标题 ID（编辑器会重新生成）
  element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
    if (h.id?.startsWith('heading-')) h.removeAttribute('id');
  });

  // 清理链接卡片内联样式（保留 data-* 属性）
  element.querySelectorAll('.link-card').forEach(card => {
    card.removeAttribute('style');
    card.querySelectorAll('*').forEach(child => child.removeAttribute('style'));
  });

  // 清理表格内联样式（保留 border）
  element.querySelectorAll('table, td, th').forEach(el => {
    const style = el.getAttribute('style');
    if (style) {
      const borderMatch = style.match(/border:\s*([^;]+)/);
      el.setAttribute('style', borderMatch ? `border: ${borderMatch[1]}` : '');
      if (!borderMatch) el.removeAttribute('style');
    }
  });

  // 处理 contenteditable 属性
  // 移除所有 contenteditable="true"
  element.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.removeAttribute('contenteditable');
  });

  // 检查 contenteditable="false"，只保留特定组件的设置
  element.querySelectorAll('[contenteditable="false"]').forEach(el => {
    const isProtectedComponent = 
      el.classList.contains('code-block-wrapper') || 
      el.classList.contains('link-card') || 
      el.classList.contains('attachment-wrapper') ||
      el.closest('.code-block-wrapper, .link-card, .attachment-wrapper');
    
    if (!isProtectedComponent) {
      el.removeAttribute('contenteditable');
    }
  });

  // 移除事件属性
  element.querySelectorAll('[onclick], [onmouseover], [onmouseout]').forEach(el => {
    el.removeAttribute('onclick');
    el.removeAttribute('onmouseover');
    el.removeAttribute('onmouseout');
  });
}

/**
 * 清理HTML字符串（用于导入时修复编辑异常）
 */
export function cleanupHTMLString(html: string): string {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  cleanupElement(doc.body);
  return doc.body.innerHTML;
}

/**
 * 提取设置信息
 */
function extractSettings(doc: Document): Partial<EditorSettings> {
  const settings: Partial<EditorSettings> = {};

  const titleEl = doc.querySelector('title');
  if (titleEl?.textContent) settings.pageTitle = titleEl.textContent;

  const faviconEl = doc.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (faviconEl?.href) settings.favicon = faviconEl.href;

  const bodyStyle = doc.body?.getAttribute('style') ?? '';
  const bgMatch = bodyStyle.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
  if (bgMatch?.[1]) settings.backgroundImage = bgMatch[1];

  const contentEl = doc.querySelector('.content');
  if (contentEl) {
    const cStyle = contentEl.getAttribute('style') ?? '';
    const opacityMatch = cStyle.match(/background:\s*rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/);
    if (opacityMatch?.[1]) settings.opacity = parseFloat(opacityMatch[1]) * 100;
  }

  return settings;
}

/**
 * 导入HTML文件（支持多页面和单页面）
 */
export async function importHTMLFile(file: File): Promise<ImportHTMLResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const htmlContent = event.target?.result as string;
        if (!htmlContent) throw new Error('文件内容为空');
        resolve(parseHTMLFile(htmlContent));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('读取文件失败'));

    reader.readAsText(file, 'UTF-8');
  });
}
