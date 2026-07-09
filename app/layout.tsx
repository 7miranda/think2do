import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "契合 Qihe - 合同生成与审查",
  description: "契合是面向企业合同起草、审查、比对和留痕的智能合同工作台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
