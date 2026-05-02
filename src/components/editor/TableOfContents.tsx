import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Plus, MoreVertical, Trash, Edit2, Search, X, Palette } from 'lucide-react';
import type { PageNode } from '@/types/editor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// 拖拽落点位置：目标节点之前、之后、或成为其子节点
type DropPosition = 'before' | 'after' | 'child';

interface DropIndicator {
  targetId: string;
  position: DropPosition;
}

interface TableOfContentsProps {
  pages: PageNode[];
  onPageClick: (id: string) => void;
  activePageId?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onAddPage: (parentId: string | null) => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, newTitle: string) => void;
  onUpdatePageColor?: (id: string, color: string) => void;
  onMovePage: (dragId: string, targetId: string, position: DropPosition) => void;
  side?: 'left' | 'right';
  searchQuery?: string;
  opacity?: number;
  headerAlignWithPaper?: boolean;
  titleColor?: string;
  useBlackMask?: boolean;
}

export function TableOfContents({
  pages,
  onPageClick,
  activePageId,
  isCollapsed = false,
  onCollapsedChange,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onUpdatePageColor,
  onMovePage,
  side = 'left',
  searchQuery = '',
  opacity = 100,
  headerAlignWithPaper = false,
  titleColor,
  useBlackMask = false,
}: TableOfContentsProps) {
  // 记录节点的展开/折叠状态，默认全部展开
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // 拖拽状态
  const dragIdRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

  // 监听页面列表变化，确保新页面默认展开
  useEffect(() => {
    setExpandedNodes(prev => {
      const next = { ...prev };
      let changed = false;
      pages.forEach(p => {
        if (next[p.id] === undefined) {
          next[p.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [pages]);

  // 切换节点的展开/折叠状态
  const toggleNode = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  // ---- 拖拽事件处理 ----

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    dragIdRef.current = pageId;
    setDraggingId(pageId);
    e.dataTransfer.effectAllowed = 'move';
    // 防止拖拽时直接触发 click
    e.stopPropagation();
  };

  const handleDragEnd = () => {
    dragIdRef.current = null;
    setDraggingId(null);
    setDropIndicator(null);
  };

  /** 根据鼠标在节点行内的垂直位置决定落点：上 1/3 → before，中 1/3 → child，下 1/3 → after */
  const calcDropPosition = (e: React.DragEvent, el: HTMLElement): DropPosition => {
    const rect = el.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const ratio = relY / rect.height;
    if (ratio < 0.28) return 'before';
    if (ratio > 0.72) return 'after';
    return 'child';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string, rowEl: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();
    const dragId = dragIdRef.current;
    if (!dragId || dragId === targetId) {
      setDropIndicator(null);
      return;
    }
    // 不允许将节点拖到自身的后代上
    const isDescendant = (checkId: string): boolean => {
      const children = pages.filter(p => p.parentId === checkId);
      return children.some(c => c.id === targetId || isDescendant(c.id));
    };
    if (isDescendant(dragId)) {
      setDropIndicator(null);
      return;
    }
    const position = calcDropPosition(e, rowEl);
    setDropIndicator({ targetId, position });
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string, rowEl: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();
    const dragId = dragIdRef.current;
    if (!dragId || dragId === targetId) return;
    const position = calcDropPosition(e, rowEl);
    onMovePage(dragId, targetId, position);
    setDropIndicator(null);
    setDraggingId(null);
    dragIdRef.current = null;
  };

  // 渲染树形结构的递归函数
  const renderTree = (parentId: string | null, level: number = 0) => {
    const children = pages
      .filter(p => p.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    if (children.length === 0) return null;

    return (
      <div className="flex flex-col">
        {children.map(page => {
          const isActive = page.id === activePageId;
          const isExpanded = expandedNodes[page.id] !== false;
          const hasChildren = pages.some(p => p.parentId === page.id);
          const indentPx = level * 15 + 12;
          const isDragging = draggingId === page.id;

          // 指示线样式
          const ind = dropIndicator?.targetId === page.id ? dropIndicator : null;
          const showBefore = ind?.position === 'before';
          const showAfter  = ind?.position === 'after';
          const showChild  = ind?.position === 'child';

          return (
            <div key={page.id} className="flex flex-col relative">
              {/* 插入指示线：before */}
              {showBefore && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-[#2B579A] z-10 pointer-events-none"
                  style={{ top: 0 }}
                />
              )}

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, page.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, page.id, e.currentTarget as HTMLElement)}
                onDrop={(e) => handleDrop(e, page.id, e.currentTarget as HTMLElement)}
                className={`group flex items-center pr-2 cursor-pointer transition-colors select-none ${
                  isDragging ? 'opacity-40' : ''
                } ${showChild ? (useBlackMask ? 'bg-blue-900/30 ring-1 ring-inset ring-blue-500' : 'bg-[#dbeafe] ring-1 ring-inset ring-[#2B579A]') : ''} ${
                  isActive && !showChild ? (useBlackMask ? 'bg-blue-900/40 text-blue-200' : 'bg-[#eff6ff] text-[#1e40af]') : !showChild ? (useBlackMask ? 'hover:bg-white/5' : 'hover:bg-[#f1f5f9]') : (useBlackMask ? 'text-blue-300' : 'text-[#1e40af]')
                }`}
                style={{
                  paddingLeft: indentPx,
                  paddingTop: 9,
                  paddingBottom: 9,
                  borderLeft: isActive && !showChild ? '3px solid #2B579A' : showChild ? '3px solid #2B579A' : '3px solid transparent',
                  cursor: isDragging ? 'grabbing' : 'pointer',
                  color: page.titleColor || titleColor || (useBlackMask ? '#e5e7eb' : '#1e293b')
                }}
                onClick={() => !isDragging && onPageClick(page.id)}
              >
                {/* 展开/折叠箭头（与导出HTML风格一致：▶/▼ 文字） */}
                <span
                  className="inline-flex items-center justify-center shrink-0 text-[10px] text-[#94a3b8] transition-transform select-none"
                  style={{ width: 14, height: 14, visibility: hasChildren ? 'visible' : 'hidden', cursor: hasChildren ? 'pointer' : 'default' }}
                  onClick={(e) => hasChildren && toggleNode(page.id, e)}
                >
                  {hasChildren ? (isExpanded ? '▼' : '▶') : '▶'}
                </span>

                {/* 文件夹/文件 emoji 图标（与导出HTML一致） */}
                <span className="shrink-0 ml-1 text-sm leading-none" style={{ opacity: 0.85 }}>
                  {hasChildren ? '📁' : '📄'}
                </span>

                {/* 标题文字：层级0加粗，与导出HTML level-0 font-weight:600 对齐 */}
                <span
                  className={`flex-1 whitespace-nowrap ml-1.5 mr-1 text-sm ${level === 0 ? 'font-semibold' : 'font-normal'}`}
                  style={{ 
                    fontSize: 14,
                    color: page.titleColor || titleColor || (useBlackMask ? '#e5e7eb' : '#1e293b')
                  }}
                >
                  {page.title}
                </span>

                {/* 操作菜单（悬停显示） */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => onAddPage(page.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        添加子页面
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const newTitle = prompt('请输入新标题:', page.title);
                        if (newTitle) onRenamePage(page.id, newTitle);
                      }}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        重命名
                      </DropdownMenuItem>
                      
                      {onUpdatePageColor && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Palette className="h-4 w-4 mr-2" />
                            更改标题颜色
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="p-2">
                              <div className="grid grid-cols-5 gap-1 mb-2">
                                {[
                                  '#4361ee', '#3f37c9', '#ef4444', '#f59e0b', '#10b981',
                                  '#8b5cf6', '#ec4899', '#000000', '#64748b', '#94a3b8'
                                ].map(color => (
                                  <button
                                    key={color}
                                    className="w-6 h-6 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                    onClick={() => onUpdatePageColor(page.id, color)}
                                  />
                                ))}
                              </div>
                              <DropdownMenuSeparator />
                              <div className="flex items-center gap-2 mt-2 px-1">
                                <input
                                  type="color"
                                  value={page.titleColor || '#4361ee'}
                                  onChange={(e) => onUpdatePageColor(page.id, e.target.value)}
                                  className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                                />
                                <span className="text-xs text-muted-foreground">自定义颜色</span>
                              </div>
                              {page.titleColor && (
                                <DropdownMenuItem 
                                  className="mt-2 justify-center text-xs"
                                  onClick={() => onUpdatePageColor(page.id, '')}
                                >
                                  清除自定义颜色
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      )}

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeletePage(page.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 插入指示线：after */}
              {showAfter && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-[#2B579A] z-10 pointer-events-none"
                  style={{ bottom: 0 }}
                />
              )}

              {isExpanded && renderTree(page.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // 过滤后的页面
  const filteredPages = searchQuery.trim() 
    ? pages.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // 折叠状态：显示极窄竖条 + 展开按钮
  if (isCollapsed) {
    return (
      <div
        className="flex flex-col items-center h-full select-none"
        style={{ 
          width: 28, 
          background: 'transparent', 
          borderColor: '#e2e8f0',
        }}
      >
        {/* 展开按钮 */}
        <button
          onClick={() => onCollapsedChange?.(false)}
          title="展开目录"
          className={`w-full flex items-center justify-center py-2 transition-colors ${useBlackMask ? 'hover:bg-white/10' : 'hover:bg-[#e2e8f0]'}`}
          style={{ color: useBlackMask ? '#94a3b8' : '#64748b' }}
        >
          {side === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {/* 竖排"目录"文字 */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{
            writingMode: 'vertical-rl',
            fontSize: 11,
            color: '#888',
            letterSpacing: 2,
            userSelect: 'none',
          }}
        >
          目录
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ 
        background: 'transparent', 
        borderColor: '#e2e8f0',
      }}
    >
      {/* 侧边栏标题栏 */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b select-none shrink-0 ${headerAlignWithPaper ? 'border-t' : ''}`}
        style={{ background: 'transparent', borderColor: '#e2e8f0', minHeight: 44 }}
      >
        <div className="flex items-center gap-2" style={{ color: useBlackMask ? '#e5e7eb' : '#1e293b', fontSize: 13, fontWeight: 700 }}>
          <BookOpen className="h-4 w-4 shrink-0" style={{ color: useBlackMask ? '#60a5fa' : '#2B579A' }} />
          <span>目录</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAddPage(null)}
            title="添加根页面"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <button
            onClick={() => onCollapsedChange?.(true)}
            title="折叠目录"
            className={`p-1 rounded transition-colors ${useBlackMask ? 'hover:bg-white/10' : 'hover:bg-[#e2e8f0]'}`}
            style={{ color: useBlackMask ? '#94a3b8' : '#64748b' }}
          >
            {side === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 目录列表 - 横向+竖向双向滚动；竖向滚动条常驻 */}
      <div
        className="flex-1 overflow-y-scroll overflow-x-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
      >
        {/* min-w-max 确保内容宽度超出侧边栏时触发横向滚动 */}
        <div className="min-w-max min-h-full">
        {pages.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400">
            <p className="text-sm">暂无目录</p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => onAddPage(null)}
              className="mt-2 text-xs"
            >
              新建页面
            </Button>
          </div>
        ) : searchQuery.trim() ? (
          <div className="flex flex-col py-1">
            {filteredPages.length > 0 ? (
              filteredPages.map(page => (
                <div
                  key={page.id}
                  className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors border-l-2 whitespace-nowrap ${
                    page.id === activePageId 
                      ? (useBlackMask ? 'bg-blue-900/40 border-blue-500 text-blue-200' : 'bg-[#eff6ff] border-[#2B579A] text-[#1e40af]') 
                      : (useBlackMask ? 'hover:bg-white/5 text-slate-300 border-transparent' : 'hover:bg-[#f1f5f9] text-[#475569] border-transparent')
                  }`}
                  onClick={() => onPageClick(page.id)}
                >
                  <span className="shrink-0 mr-2 text-sm" style={{ opacity: 0.85 }}>📄</span>
                  <div className="flex flex-col">
                    <span className="font-semibold whitespace-nowrap" style={{ fontSize: 14 }}>{page.title}</span>
                    <span className="opacity-60 whitespace-nowrap" style={{ fontSize: 12 }}>
                      {page.content.replace(/<[^>]*>/g, '').substring(0, 40)}...
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400">
                <p className="text-xs">未找到匹配内容</p>
              </div>
            )}
          </div>
        ) : (
          renderTree(null)
        )}
        </div>
      </div>
    </div>
  );
}
