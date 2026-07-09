import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "契合 Qihe - 品牌资产",
  description: "契合 Qihe logo 与品牌基础图像。",
};

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-6 py-10 text-[#07111f] md:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f2] bg-white px-4 text-[14px] font-medium text-[#1d2d44] transition hover:border-[#125dff]"
        >
          <ArrowLeft className="size-4" />
          返回官网首页
        </Link>

        <div className="mt-12 grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-end">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#125dff]">
              BRAND ASSETS
            </p>
            <h1 className="mt-5 text-[clamp(44px,7vw,92px)] font-semibold leading-[1.14] tracking-[0.01em]">
              契合品牌<br />基础图像
            </h1>
            <p className="mt-7 text-[17px] leading-[1.85] text-[#53657c]">
              此页面用于放置品牌基础图形和应用示意，不作为官网首页的信息结构。
            </p>
          </div>
          <div className="rounded-[34px] border border-[#dce6f2] bg-white p-3 shadow-[0_24px_70px_rgba(27,85,160,0.08)]">
            <Image
              src="/brand/qihe-new-logo-board.png"
              alt="契合 Qihe 新 logo 设计稿"
              width={1878}
              height={1272}
              className="h-auto w-full rounded-[24px]"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
