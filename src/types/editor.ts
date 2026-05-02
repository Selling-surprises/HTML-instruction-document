// 编辑器类型定义

export interface EditorSettings {
  pageTitle: string;
  favicon: string;
  backgroundImage: string;
  opacity: number;
  enableMobileAdaptation: boolean;
  mobileBackgroundImage: string;
  enableGlassEffect: boolean;
  glassBlur: number;
  useBlackMask: boolean; // 是否使用黑色遮罩(false为白色遮罩)
  codeTheme: string; // 代码高亮主题
  enableScrollButtons: boolean; // 是否启用回到顶部/底部按钮
  enableSourceLink: boolean; // 是否在导出HTML中显示原链接按钮
  sourceUrl: string; // 原文链接地址
  pageTitleColor: string; // 文档标题颜色
  sidebarBackgroundColor: string; // 侧边栏背景颜色
}

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  element: HTMLElement;
}

export interface PageNode {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  order: number;
  titleColor?: string; // 自定义标题颜色
}


export interface EditorState {
  content: string;
  history: string[];
  historyIndex: number;
  characterCount: number;
  wordCount: number;
}

export type FontFamily = 
  | 'Arial'
  | 'Times New Roman'
  | 'Courier New'
  | 'Georgia'
  | 'Verdana'
  | 'Comic Sans MS'
  | 'Microsoft YaHei'
  | 'SimSun';

export type FontSize = 
  | '8px'
  | '10px'
  | '12px'
  | '14px'
  | '16px'
  | '18px'
  | '20px'
  | '24px'
  | '28px'
  | '32px'
  | '36px'
  | '48px'
  | '64px'
  | '72px';

export type HeadingLevel = 'h1' | 'h2' | 'h3';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type CodeTheme = 
  | 'atom-one-dark'
  | 'github'
  | 'monokai'
  | 'dracula'
  | 'vs'
  | 'vs2015'
  | 'nord'
  | 'tokyo-night'
  | 'solarized-light'
  | 'solarized-dark'
  | 'gruvbox-light'
  | 'gruvbox-dark'
  | 'tomorrow-night-bright'
  | 'zenburn'
  | 'androidstudio'
  | 'xcode'
  | 'night-owl'
  | 'shades-of-purple'
  | 'a11y-light'
  | 'a11y-dark'
  | 'rainbow'
  | 'gradient-light'
  | 'gradient-dark';

export const CODE_THEMES: { value: CodeTheme; label: string; description: string; category: string }[] = [
  // 经典主题
  { value: 'atom-one-dark', label: 'Atom One Dark', description: '柔和对比，护眼舒适', category: '经典' },
  { value: 'github', label: 'GitHub', description: '清新简洁，GitHub风格', category: '经典' },
  { value: 'monokai', label: 'Monokai', description: '经典配色，高对比度', category: '经典' },
  { value: 'dracula', label: 'Dracula', description: '紫色调，优雅神秘', category: '经典' },
  { value: 'vs', label: 'Visual Studio', description: '专业风格，VS经典配色', category: '经典' },
  { value: 'vs2015', label: 'VS 2015', description: '专业风格，VS深色主题', category: '经典' },
  
  // 现代主题
  { value: 'nord', label: 'Nord', description: '冷色调，北欧风格', category: '现代' },
  { value: 'tokyo-night', label: 'Tokyo Night', description: '夜间主题，护眼舒适', category: '现代' },
  { value: 'night-owl', label: 'Night Owl', description: '夜猫子主题，蓝紫色调', category: '现代' },
  { value: 'shades-of-purple', label: 'Shades of Purple', description: '紫色渐变，独特炫彩', category: '现代' },
  
  // 复古主题
  { value: 'solarized-light', label: 'Solarized Light', description: '经典Solarized浅色', category: '复古' },
  { value: 'solarized-dark', label: 'Solarized Dark', description: '经典Solarized深色', category: '复古' },
  { value: 'gruvbox-light', label: 'Gruvbox Light', description: '复古暖色调浅色', category: '复古' },
  { value: 'gruvbox-dark', label: 'Gruvbox Dark', description: '复古暖色调深色', category: '复古' },
  { value: 'zenburn', label: 'Zenburn', description: '低对比度，护眼舒适', category: '复古' },
  
  // 明亮主题
  { value: 'tomorrow-night-bright', label: 'Tomorrow Night Bright', description: '明亮的深色主题', category: '明亮' },
  { value: 'xcode', label: 'Xcode', description: 'Apple Xcode风格', category: '明亮' },
  { value: 'androidstudio', label: 'Android Studio', description: 'Android Studio风格', category: '明亮' },
  
  // 特殊主题
  { value: 'a11y-light', label: 'A11y Light', description: '高对比度浅色，无障碍', category: '特殊' },
  { value: 'a11y-dark', label: 'A11y Dark', description: '高对比度深色，无障碍', category: '特殊' },
  { value: 'rainbow', label: 'Rainbow', description: '彩虹配色，多彩炫丽', category: '特殊' },
  { value: 'gradient-light', label: 'Gradient Light', description: '渐变浅色，现代时尚', category: '特殊' },
  { value: 'gradient-dark', label: 'Gradient Dark', description: '渐变深色，现代时尚', category: '特殊' },
];
