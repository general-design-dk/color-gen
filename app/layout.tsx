import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "색칠요정",
  description: "키워드로 만드는 아이용 색칠공부 도안",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Pretendard 웹폰트 (CDN). React 19의 <link rel="stylesheet">를 head에 둔다 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
