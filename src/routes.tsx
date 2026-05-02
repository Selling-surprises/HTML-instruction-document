import Editor from './pages/Editor';
import SamplePage from './pages/SamplePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'HTML说明文档制作工具',
    path: '/',
    element: <Editor />
  },
  {
    name: 'Canvas 渲染测试',
    path: '/test',
    element: <SamplePage />
  }
];

export default routes;
