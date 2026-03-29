import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeNova — 코드로 여는 미래",
  description: "Python 기초부터 알고리즘까지. 체계적인 커리큘럼으로 개발자 여정을 시작하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
