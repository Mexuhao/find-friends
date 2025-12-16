import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Find Friends - H5 Match',
  description: '匿名异性互抽，信息自愿提交，仅用于匹配展示'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

