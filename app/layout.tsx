import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "색칠요정",
  description: "키워드로 만드는 아이용 색칠공부 도안",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
