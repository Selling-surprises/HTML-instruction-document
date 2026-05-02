import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuItem, MenuPosition } from '@/types/contextMenu';

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: MenuPosition;
  onClose: () => void;
  onCommand: (command: string, item: ContextMenuItem) => void;
}

export function ContextMenu({ items, position, onClose, onCommand }: ContextMenuProps) {
  const [submenuState, setSubmenuState] = useState<{
    items: ContextMenuItem[];
    position: MenuPosition;
    parentIndex: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // 边界检测和位置调整
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let newX = position.x;
      let newY = position.y;

      // 右边界检测
      if (rect.right > window.innerWidth) {
        newX = position.x - rect.width;
      }

      // 底部边界检测
      if (rect.bottom > window.innerHeight) {
        newY = position.y - rect.height;
      }

      // 左边界检测
      if (newX < 0) {
        newX = 0;
      }

      // 顶部边界检测
      if (newY < 0) {
        newY = 0;
      }

      if (newX !== position.x || newY !== position.y) {
        setAdjustedPosition({ x: newX, y: newY });
      }
    }
  }, [position]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled || item.submenu) return;
    
    if (item.command) {
      onCommand(item.command, item);
    }
    onClose();
  }, [onCommand, onClose]);

  const handleMouseEnter = useCallback((item: ContextMenuItem, index: number, event: React.MouseEvent) => {
    if (item.submenu) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setSubmenuState({
        items: item.submenu,
        position: {
          x: rect.right,
          y: rect.top
        },
        parentIndex: index
      });
    } else {
      setSubmenuState(null);
    }
  }, []);

  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    if (item.divider) {
      return (
        <div
          key={`divider-${index}`}
          className="h-px bg-border my-1"
        />
      );
    }

    const isActive = submenuState?.parentIndex === index;

    return (
      <div
        key={index}
        className={`
          px-3 py-1.5 flex items-center justify-between cursor-pointer
          transition-colors text-sm
          ${item.disabled 
            ? 'text-muted-foreground cursor-not-allowed' 
            : 'hover:bg-[#e5f3ff] hover:text-foreground'
          }
          ${isActive ? 'bg-[#e5f3ff]' : ''}
        `}
        onClick={() => handleItemClick(item)}
        onMouseEnter={(e) => handleMouseEnter(item, index, e)}
      >
        <div className="flex items-center gap-2 flex-1">
          {item.icon && <span className="text-base">{item.icon}</span>}
          <span className="whitespace-nowrap">{item.label}</span>
        </div>
        
        <div className="flex items-center gap-3 ml-6">
          {item.shortcut && (
            <span className="text-xs text-muted-foreground">
              {item.shortcut}
            </span>
          )}
          {item.submenu && (
            <span className="text-xs text-muted-foreground">▶</span>
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    <>
      <div
        ref={menuRef}
        className="fixed bg-card border border-border shadow-xl rounded-md py-1 min-w-[180px] max-w-[280px] z-[10000]"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          fontFamily: "'Microsoft YaHei', 'Segoe UI', sans-serif"
        }}
      >
        {items.map((item, index) => renderMenuItem(item, index))}
      </div>

      {/* 子菜单 */}
      {submenuState && (
        <ContextMenu
          items={submenuState.items}
          position={submenuState.position}
          onClose={onClose}
          onCommand={onCommand}
        />
      )}
    </>,
    document.body
  );
}
