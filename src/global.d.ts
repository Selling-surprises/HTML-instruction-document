// global types

// 扩展 Window 接口，添加全局函数
interface Window {
  editLinkCard?: (cardId: string) => void;
  deleteLinkCard?: (cardId: string) => void;
  copyCodeBlock?: (codeBlockId: string, buttonElement?: HTMLButtonElement) => void;
  deleteCodeBlock?: (codeBlockId: string) => void;
}
