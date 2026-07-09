"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GitCompareArrows,
  History,
  LockKeyhole,
  PenLine,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import GradientBars from "@/components/react-bits/gradient-bars";
import GlassFlow from "@/components/react-bits/glass-flow";
import BlurHighlight from "@/components/react-bits/blur-highlight";
import ClickStack from "@/components/react-bits/click-stack";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${BASE_PATH}${path}`;

const draftSteps = [
  {
    title: "录入交易意图",
    body: "选择合同类型，填写交易对象、金额、交付节点和特殊约定。",
    icon: PenLine,
  },
  {
    title: "生成合同初稿",
    body: "自动组织结构、条款和附件清单，输出可直接编辑的草案。",
    icon: WandSparkles,
  },
  {
    title: "补齐关键条款",
    body: "围绕付款、验收、违约、保密、数据安全提示缺失项。",
    icon: ClipboardCheck,
  },
  {
    title: "审查与定稿",
    body: "定位风险、写出修改建议，并保留每一次版本变化。",
    icon: FileCheck2,
  },
];

const templates = [
  {
    title: "房屋租赁合同",
    body: "适合住宅整租、合租、续租场景，覆盖租期、租金、押金、维修和提前退租。",
    tags: ["租期", "租金", "押金"],
    parties: ["出租方：张某", "承租方：上海某科技有限公司"],
    clauses: ["租期：2026.08.01 至 2027.07.31", "租金：每月 18,000 元，押二付一", "维修：主体结构由出租方负责", "退租：提前 30 日书面通知"],
  },
  {
    title: "商铺租赁合同",
    body: "适合沿街商铺、写字楼底商、快闪店场景，重点处理经营用途和装修恢复。",
    tags: ["用途", "装修", "转租"],
    parties: ["出租方：某商业管理有限公司", "承租方：某餐饮品牌"],
    clauses: ["用途：仅限轻餐饮经营", "装修期：免租 30 日", "转租：须经出租方书面同意", "恢复：退租时恢复至交付状态"],
  },
  {
    title: "办公场地租赁合同",
    body: "适合办公室、联合办公、研发空间，覆盖物业费、工位、门禁和交付清单。",
    tags: ["物业", "交付", "门禁"],
    parties: ["出租方：某产业园运营方", "承租方：某智能科技公司"],
    clauses: ["面积：建筑面积 420 平方米", "物业费：每月每平方米 18 元", "交付：含空调、门禁、网络端口", "续租：同等条件下承租方优先"],
  },
  {
    title: "设备租赁合同",
    body: "适合摄影器材、工程设备、办公设备等租赁，明确损耗、保养和逾期返还。",
    tags: ["设备", "损耗", "返还"],
    parties: ["出租方：某设备服务商", "承租方：某活动执行公司"],
    clauses: ["设备：Aputure 灯具套装 6 组", "租期：7 日，自签收日起算", "损坏：按维修报价承担费用", "逾期：每日按租金 150% 计收"],
  },
];

const reviewItems = [
  "付款节点缺少验收前置条件",
  "违约责任上限未与合同金额挂钩",
  "数据处理角色与安全通知机制不清晰",
];

const enterpriseControls = [
  {
    title: "权限隔离",
    body: "按部门、角色和合同类型控制模板、字段与审查规则。",
    icon: LockKeyhole,
  },
  {
    title: "版本留痕",
    body: "每次生成、编辑、采纳建议和导出都有记录可追溯。",
    icon: History,
  },
  {
    title: "差异比对",
    body: "对方回传版本自动标记新增、删除和改写条款。",
    icon: GitCompareArrows,
  },
];

function HeroStage({ children }: { children: React.ReactNode }) {
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty("--cursor-x", `${x}%`);
    event.currentTarget.style.setProperty("--cursor-y", `${y}%`);
    event.currentTarget.style.setProperty("--tilt-x", `${((50 - y) / 50) * 3.2}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${((x - 50) / 50) * 4.2}deg`);
  };

  return (
    <section
      id="top"
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--tilt-x", "0deg");
        event.currentTarget.style.setProperty("--tilt-y", "0deg");
      }}
      className="hero-stage relative min-h-[760px] overflow-hidden bg-[#dcebf6] md:min-h-[720px] lg:min-h-[760px]"
    >
      {children}
      <div className="hero-scanline-x" />
      <div className="hero-scanline-y" />
      <div className="hero-cursor-light" />
      <div className="hero-cursor-orb" />
      <div className="hero-cursor-reticle">
        <span />
      </div>
    </section>
  );
}

function BrandButton({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light";
}) {
  return (
    <a
      href={href}
      style={variant === "dark" ? { color: "#f8fbff" } : undefined}
      className={[
        "magnetic-cta group inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition duration-300",
        variant === "dark"
          ? "bg-[#07111f] text-white hover:bg-[#125dff]"
          : "border border-[#c9d9ed] bg-white/70 text-[#07111f] backdrop-blur-xl hover:border-[#125dff] hover:bg-white",
      ].join(" ")}
    >
      {children}
      <ArrowUpRight className="size-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

function DraftWorkbench() {
  return (
    <div className="draft-workbench relative mx-auto w-full max-w-[800px] overflow-hidden rounded-[38px] border border-white/70 bg-white/78 p-4 shadow-[0_34px_90px_rgba(27,85,160,0.18)] backdrop-blur-2xl">
      <div className="workbench-sheen" />
      <div className="flex items-center justify-between border-b border-[#dce6f2] px-2 pb-4">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center overflow-hidden rounded-[14px] bg-[#eef6ff] shadow-[0_10px_24px_rgba(18,93,255,0.18)]">
            <Image
              src={assetPath("/brand/crops/qihe-symbol-transparent.png")}
              alt="契合 Qihe"
              width={52}
              height={38}
              className="h-8 w-auto object-contain"
            />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-[#07111f]">合同拟定工作台</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#738399]">draft console</p>
          </div>
        </div>
        <span className="pulse-dot rounded-full bg-[#eaf7ff] px-3 py-1 text-[12px] font-medium text-[#125dff]">生成中</span>
      </div>

      <div className="grid gap-4 pt-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[26px] bg-[#07111f] p-5 text-white">
          <p className="mb-4 flex items-center gap-2 text-[14px] font-medium">
            <Sparkles className="size-4 text-[#54d3ea]" />
            起草需求
          </p>
          <div className="space-y-3">
            {["采购一套年度设计服务", "合同金额 48 万，分三期付款", "交付物包含品牌页、活动页和物料模板"].map((item) => (
              <div key={item} className="readonly-field rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-[13px] leading-[1.65] text-white/78">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white/92 text-[13px] font-semibold text-[#07111f]">
            合同初稿预览
            <FileCheck2 className="size-4 text-[#125dff]" />
          </div>
        </div>

        <div className="rounded-[26px] border border-[#dce6f2] bg-[#fbfdff] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#07111f]">服务采购合同</p>
            <span className="rounded-full bg-[#dff4ff] px-3 py-1 text-[11px] text-[#125dff]">草案 v1</span>
          </div>
          <div className="contract-lines document-preview space-y-3">
            <span className="!w-full" />
            <span />
            <span className="!w-[88%]" />
            <span className="!w-full" />
            <span className="!w-[64%]" />
            <span className="!w-[94%]" />
            <span />
          </div>
          <div className="mt-5 rounded-2xl border border-[#bde8f8] bg-[#eefaff] p-4">
            <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[#125dff]">
              <CircleAlert className="size-4" />
              缺失条款提示
            </p>
            <p className="text-[13px] leading-[1.7] text-[#53657c]">
              建议补充验收标准、逾期交付整改期和资料保密边界。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  title,
  body,
  tags,
  parties,
  clauses,
}: {
  title: string;
  body: string;
  tags: string[];
  parties: string[];
  clauses: string[];
}) {
  return (
    <div className="flex h-full flex-col justify-between bg-[#fbfdff] p-6">
      <div>
        <div className="mb-7 flex items-center justify-between">
          <FileText className="size-7 text-[#125dff]" />
          <span className="rounded-full border border-[#d8e5f2] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#607086]">
            lease template
          </span>
        </div>
        <h3 className="text-2xl font-semibold tracking-[0.01em] text-[#07111f]">{title}</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-[#53657c]">{body}</p>

        <div className="mt-5 rounded-2xl border border-[#dce6f2] bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b9ab0]">contract fields</p>
          <div className="mt-3 space-y-2">
            {parties.map((item) => (
              <div key={item} className="rounded-xl bg-[#f3f8ff] px-3 py-2 text-[12px] text-[#31445e]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {clauses.map((item) => (
            <div key={item} className="flex gap-2 rounded-xl border border-[#e1eaf5] bg-white/80 px-3 py-2 text-[12px] leading-[1.45] text-[#1d2d44]">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#125dff]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[#eaf3ff] px-3 py-1 text-[12px] font-medium text-[#125dff]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const templateStack = templates.map((template) => <TemplateCard key={template.title} {...template} />);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-[#07111f]">
      <div className="site-frame" />
      <div className="noise" />

      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/72 px-3 shadow-[0_18px_45px_rgba(23,55,115,0.08)] backdrop-blur-2xl">
          <a href="#top" className="flex items-center rounded-full pl-2 pr-3">
            <Image
              src={assetPath("/brand/crops/qihe-wordmark-transparent.png")}
              alt="Qihe"
              width={210}
              height={78}
              className="h-8 w-auto object-contain"
              priority
            />
          </a>
          <div className="hidden items-center gap-7 text-[13px] text-[#53657c] md:flex">
            <a href="#draft" className="hover:text-[#07111f]">拟定</a>
            <a href="#templates" className="hover:text-[#07111f]">模板</a>
            <a href="#review" className="hover:text-[#07111f]">审查</a>
            <a href="#security" className="hover:text-[#07111f]">企业控制</a>
          </div>
          <a
            href="#contact"
            style={{ color: "#f8fbff" }}
            className="group inline-flex h-10 min-w-[96px] items-center justify-center gap-1 rounded-full bg-[#07111f] px-4 text-[13px] font-semibold text-white transition hover:bg-[#125dff]"
          >
            预约演示
            <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
          </a>
        </nav>
      </header>

      <HeroStage>
        <GradientBars
          className="absolute inset-0"
          height="100%"
          barCount={18}
          speed={0.045}
          gradientPower={0.58}
          balance={0.42}
          phaseSpread={7}
          mirrorRepeat={1.7}
          alternateDirection={0.24}
          invertSpeed={0.055}
          phaseRange={1.8}
          curvePower={2.2}
          easingMode={2}
          vertical={false}
          color="#edfaff"
          backgroundColor="#125dff"
          opacity={0.86}
          cursorInteraction
        />
        <div className="hero-quiet-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.72),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(18,93,255,0.28),transparent_34%),linear-gradient(180deg,rgba(246,248,251,0.06),rgba(246,248,251,0.86)_88%)]" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col justify-end px-6 pb-10 pt-28 md:min-h-[720px] md:px-10 md:pb-12 lg:min-h-[760px]">
          <div className="grid items-end gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#1d4b80]">
                QIHE CONTRACT DRAFTING
              </p>
              <h1 className="hero-title max-w-[880px] text-[clamp(42px,6.8vw,92px)] font-semibold leading-[1.12] tracking-[0.01em] text-[#061426]">
                <span>把合同拟定</span>
                <span>变成可控流程</span>
              </h1>
              <p className="mt-7 max-w-2xl text-[18px] leading-[1.85] text-[#1d2d44] md:text-[20px]">
                契合面向企业合同拟定场景，把起草需求、模板条款、风险审查和版本留痕串成一条工作流。输入交易意图，得到一份结构完整、可审可改的合同草案。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <BrandButton href="#draft">查看拟定流程</BrandButton>
                <BrandButton href="#templates" variant="light">浏览合同模板</BrandButton>
              </div>
            </div>

            <div className="hero-panel relative pb-4 lg:pb-0">
              <DraftWorkbench />
            </div>
          </div>
        </div>
      </HeroStage>

      <section id="draft" className="relative bg-[#f6f8fb] px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#125dff]">
                DRAFT PIPELINE
              </p>
              <h2 className="mt-5 max-w-3xl text-[clamp(40px,5.8vw,76px)] font-semibold leading-[1.18] tracking-[0.01em]">
                从一句需求，<br />到一份合同草案。
              </h2>
              <BlurHighlight
                highlightedBits={["交易意图", "合同类型", "条款结构"]}
                highlightColor="rgba(84, 211, 234, 0.32)"
                blurAmount={7}
                blurDuration={0.9}
                highlightDelay={0.35}
                className="mt-8 block max-w-2xl text-[18px] leading-[1.9] text-[#42536a]"
              >
                拟定合同不应该从空白页开始。契合先理解交易意图，再按合同类型组织条款结构，把法务经验前置到起草阶段。
              </BlurHighlight>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {draftSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="lift min-h-[230px] rounded-[30px] border border-[#dce6f2] bg-white p-6">
                    <div className="mb-8 flex items-center justify-between">
                      <Icon className="size-7 text-[#125dff]" />
                      <span className="font-mono text-[12px] text-[#9aa8ba]">0{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-4 text-[15px] leading-[1.8] text-[#5d6f87]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className="relative overflow-hidden bg-[#07111f] px-6 py-24 text-white md:px-10 md:py-32">
        <div className="absolute inset-0 opacity-35">
          <GlassFlow
            imageSrc={assetPath("/brand/flow-field.svg")}
            stripeCount={9}
            angle={-18}
            refraction={0.08}
            edgeBrightness={0.08}
            chromaticAberration={0.42}
            waveSpeed={1.2}
            waveAmount={0.24}
            frostAmount={0.1}
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#54d3ea]">
              TEMPLATE LIBRARY
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(40px,5.8vw,76px)] font-semibold leading-[1.18] tracking-[0.01em]">
              常用合同模板，<br />按场景开始拟定。
            </h2>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.9] text-white/70">
              从采购、销售、SaaS、保密到渠道合作，模板不只是空文本，而是带着字段、条款、风险点和补充问题的拟定入口。
            </p>
            <div className="mt-10 flex flex-wrap gap-3 text-[13px] text-white/72">
              {["字段化输入", "条款自动补齐", "附件清单", "审查规则"].map((item) => (
                <span key={item} className="rounded-full border border-white/18 bg-white/[0.06] px-4 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative h-[660px] overflow-visible">
            <ClickStack
              items={templateStack}
              cardWidth={360}
              cardHeight={560}
              spreadX={34}
              spreadY={-28}
              visibleCount={4}
              depthScale={0.055}
              depthOpacity={0.08}
              borderRadius={28}
              shadowBlur={54}
              shadowOpacity={0.34}
              cardClassName="border border-white/20"
              className="h-full"
            />
          </div>
        </div>
      </section>

      <section id="review" className="bg-[#eef4fb] px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.06fr_0.94fr]">
          <div className="overflow-hidden rounded-[42px] border border-[#dce6f2] bg-white p-5 shadow-[0_24px_70px_rgba(27,85,160,0.08)]">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
              <div className="rounded-[30px] border border-[#dce6f2] bg-[#fbfdff] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#607086]">draft v2</p>
                    <h3 className="mt-2 text-2xl font-semibold">服务采购合同</h3>
                  </div>
                  <FileText className="size-7 text-[#125dff]" />
                </div>
                <div className="contract-lines space-y-3">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <span key={index} className={index === 4 ? "!w-[46%] bg-[#f7c948]/70" : undefined} />
                  ))}
                </div>
              </div>
              <div className="rounded-[30px] bg-[#07111f] p-6 text-white">
                <p className="mb-5 flex items-center gap-2 text-[15px] font-semibold">
                  <ShieldCheck className="size-5 text-[#54d3ea]" />
                  审查意见
                </p>
                <div className="space-y-3">
                  {reviewItems.map((item, index) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#54d3ea]">risk 0{index + 1}</p>
                      <p className="mt-2 text-[14px] leading-[1.7] text-white/78">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#125dff]">
              REVIEW BEFORE SIGNING
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(40px,5.8vw,76px)] font-semibold leading-[1.18] tracking-[0.01em]">
              拟定时就审查，<br />定稿前再复核。
            </h2>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.9] text-[#53657c]">
              契合把审查规则放进拟定过程，边生成边发现缺失条款。到定稿前，再对主体、金额、付款、违约、数据和保密进行完整复核。
            </p>
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#f6f8fb] px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#125dff]">
                ENTERPRISE CONTROL
              </p>
              <h2 className="mt-5 text-[clamp(40px,5.8vw,76px)] font-semibold leading-[1.18] tracking-[0.01em]">
                企业合同，<br />需要可控边界。
              </h2>
            </div>
            <p className="max-w-xl text-[17px] leading-[1.85] text-[#53657c]">
              权限、模板、版本、审批和审计记录都在同一套控制面里，确保合同拟定不是个人文档，而是企业流程。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {enterpriseControls.map(({ title, body, icon: Icon }) => {
              return (
                <div key={title} className="lift rounded-[32px] border border-[#dce6f2] bg-white p-7">
                  <Icon className="mb-12 size-8 text-[#125dff]" />
                  <h3 className="text-2xl font-semibold">{title}</h3>
                  <p className="mt-4 text-[15px] leading-[1.8] text-[#5d6f87]">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#07111f] px-6 pb-8 pt-20 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#54d3ea]">
                START DRAFTING WITH QIHE
              </p>
              <h2 className="mt-5 max-w-3xl text-[clamp(42px,7vw,92px)] font-semibold leading-[1.12] tracking-[0.01em]">
                让合同从起草开始，<br />就更接近定稿。
              </h2>
            </div>
            <div className="self-end">
              <p className="text-[17px] leading-[1.9] text-white/68">
                适合采购、销售、法务、财务和经营团队共用的合同生成与拟定入口。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <BrandButton href="mailto:hello@qihe.contract" variant="light">
                  hello@qihe.contract
                </BrandButton>
              </div>
            </div>
          </div>

          <div className="mt-20 overflow-hidden border-t border-white/12 pt-8">
            <div className="marquee flex w-[200%] gap-8 font-mono text-[12vw] font-semibold leading-none tracking-[0.02em] text-white/10">
              <span>QIHE CONTRACT DRAFTING</span>
              <span>QIHE CONTRACT DRAFTING</span>
            </div>
            <div className="mt-8 flex flex-col justify-between gap-4 text-[13px] text-white/42 md:flex-row">
              <span>© 2026 Qihe. Contract drafting workspace.</span>
              <span>Draft · Template · Review · Trace</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
