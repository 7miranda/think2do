"use client";

/**
 * [INPUT]: 依赖 @react-three/fiber 的 Canvas/useFrame/useThree，three，@/lib/utils 的 cn。
 * [OUTPUT]: 对外提供 FluidFlow 组件 + FluidFlowProps —— 满屏、不透明、会发光有通透层次的暖色流体 shader。
 * [POS]: react-bits 自研平滑流体 shader。机制 = 域扭曲 simplex 噪声生成的连续标量场（base field），
 *        叠一层更慢更高对比的【发光核 glow field】制造「光从熔金里透出来」的亮脉络，
 *        再加 specular 高光项 + 可选 additive bloom，经【单一暖色家族】渐变 ramp 上色
 *        （深古铜阴影→琥珀中调→亮香槟金高光）。死守纪律：提的是 luminosity（明度层次：亮高光+深影），
 *        不是 saturation/hue spread——阴影端与高光端都比中调低饱和，天然把 meanSat 压在官方区间。
 *        对标官方 shader/ai-saas 那种「会发光、有通透层次、光从里面透出来」，而非平的大理石。
 *        preserveDrawingBuffer 支持 QA 真 readPixels。
 * [PROTOCOL]: 变更时更新此头部，然后检查 ../../CLAUDE.md
 */

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface FluidFlowProps {
  /** Container width */
  width?: string | number;
  /** Container height */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Content rendered above the effect */
  children?: React.ReactNode;
  /** Animation speed multiplier (organic drift) */
  speed?: number;
  /** Field scale — larger = more, smaller blobs */
  scale?: number;
  /** Domain-warp strength — how much the flow folds onto itself */
  warp?: number;
  /** Gamma applied to the field before ramp lookup (>1 darkens lows = more contrast room) */
  gamma?: number;
  /**
   * Contrast S-curve strength (0–1). Pushes the field's mid-tone cluster apart
   * into deep-shadow valleys + bright ridges in ONE op — the source of the
   * "亮高光段 + 深影段" value-histogram spread. 0 = flat mid marble. This is
   * LUMINANCE layering, not saturation.
   */
  contrast?: number;
  /**
   * Glow-core strength (0–1+). Drives a second slower high-contrast noise layer
   * that lights up bright veins/cores — the "light透出来 from inside molten gold"
   * read. This adds LUMINANCE layering, not saturation. 0 = flat marble.
   */
  glow?: number;
  /**
   * Specular highlight strength (0–1+). pow(field) pushed into the brightest
   * champagne ramp stop so highlights burst instead of sitting flat.
   */
  highlight?: number;
  /**
   * Warm color ramp, low→high luminance. Must stay in ONE warm hue family
   * (red/amber/gold) to read as harmonious, not as a clashing rainbow.
   * For the glowing look, widen the VALUE range (deep bronze shadow → amber mid
   * → bright champagne highlight), keeping hue locked warm. 5 stops are sampled.
   */
  ramp?: [string, string, string, string, string];
  /** Master alpha (kept 1 for full-bleed; lower only for edge fades) */
  opacity?: number;
  /** Maximum device pixel ratio */
  dpr?: number;
  /** Preserve the drawing buffer so QA can sample WebGL pixels */
  preserveDrawingBuffer?: boolean;
  /** Freeze the animation in place (reduced-motion) */
  paused?: boolean;
  /** Let the cursor add a soft local swell to the field */
  cursorInteraction?: boolean;
  /** Cursor swell strength (0–1) */
  cursorStrength?: number;
}

// ============================================================
// 自研平滑暖流体 GLSL —— 域扭曲 simplex 噪声 → 单暖色家族 ramp
//   noise: Ashima/Stefan Gustavson 2D simplex（无周期、无硬边，天然有机）
//   warp:  f = noise(p + warp*noise(p + warp*noise(p)))（域扭曲 = 流体折叠感）
//   color: 5-stop 暖 ramp 线性插值（深酒红→酒红→琥珀→暖金→暖白），全程同色相家族
// ============================================================
const SCREEN_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FLUID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;
uniform float uScale;
uniform float uWarp;
uniform float uGamma;
uniform float uContrast;
uniform float uGlow;
uniform float uHighlight;
uniform float uAlpha;

uniform vec3  uC0;
uniform vec3  uC1;
uniform vec3  uC2;
uniform vec3  uC3;
uniform vec3  uC4;

uniform vec2  uPointer;
uniform float uCursorActive;
uniform float uCursorStrength;

// --- Ashima 2D simplex noise (smooth, aperiodic, organic) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// 3-octave fbm —— 给场更细腻的有机层次
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return s;
}

// 5-stop 暖 ramp 线性插值（t∈[0,1]，全程单一暖色家族）
vec3 warmRamp(float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.25)      return mix(uC0, uC1, smoothstep(0.0, 0.25, t));
  else if (t < 0.50) return mix(uC1, uC2, smoothstep(0.25, 0.50, t));
  else if (t < 0.75) return mix(uC2, uC3, smoothstep(0.50, 0.75, t));
  else               return mix(uC3, uC4, smoothstep(0.75, 1.0, t));
}

// 对比 S 曲线：绕 pivot 把场的中调集群往两端推开 ——
//   一次操作同时挖出【深影谷】+ 抬起【亮脊】，消掉「只加光、地板卡死中调」的特殊情况。
//   k>0 增对比（谷更深脊更亮），k=0 恒等。这是 luminosity 层次的来源，不是 saturation。
float contrastS(float x, float k) {
  x = clamp(x, 0.0, 1.0);
  float c = clamp(k, 0.0, 1.0);
  // 平滑对比：低于 pivot 压向 0，高于 pivot 抬向 1，pivot 处不动
  float lo = pow(x, mix(1.0, 2.4, c));            // 压低暗部 → 深影谷
  float hi = 1.0 - pow(1.0 - x, mix(1.0, 2.4, c)); // 抬高亮部 → 亮脊
  return mix(lo, hi, smoothstep(0.0, 1.0, x));
}

void main() {
  // aspect-correct，居中坐标
  vec2 uv = (vUv - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  vec2 p = uv * uScale;

  float t = uTime * 0.12;

  // --- BASE FIELD：域扭曲让噪声场折叠成流体感（无周期 → 无硬边）---
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t * 0.8)));
  vec2 r = vec2(
    fbm(p + uWarp * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm(p + uWarp * q + vec2(8.3, 2.8) - 0.12 * t)
  );
  float f = fbm(p + uWarp * r);

  // 光标软隆起（可选）：在指针处给场加一点起伏，不破坏整体平滑
  vec2 pointerUv = (uPointer - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0) * uScale;
  float cd = length(p - pointerUv);
  float swell = smoothstep(2.4, 0.0, cd) * uCursorActive * uCursorStrength;
  f += swell * 0.5;

  // 归一化到 [0,1]，先 gamma 再对比 S 曲线 ——
  //   gamma 给基础偏置，contrastS 把中调集群推开成【深影谷 + 亮脊】（明度层次的根）
  float v = clamp(f * 0.5 + 0.5, 0.0, 1.0);
  v = pow(v, uGamma);
  v = contrastS(v, uContrast);
  float vBase = v; // 记住基底（谷/脊）——glow 要在脊上加光、让谷留黑

  // ============================================================
  // GLOW CORE FIELD —— 光从熔金里透出来的亮脉络
  //   独立的、更慢、错相位的扭曲场。它不是给材质换色，而是标出
  //   「光在哪里汇聚穿透」：用 q/r 的二级域扭曲折出连续亮核，
  //   smoothstep 把它收成有边界的发光脉络（不是整屏泛白）。
  //   这一层只加 LUMINANCE（明度），不动色相——核处把 v 往高光端推。
  // ============================================================
  float gt = uTime * 0.08;
  vec2 gq = vec2(fbm(p * 0.62 + vec2(11.3, gt)), fbm(p * 0.62 + vec2(3.7, -gt * 0.9)));
  float gcore = fbm(p * 0.62 + (uWarp * 0.85) * gq + vec2(19.1, 4.4));
  gcore = clamp(gcore * 0.5 + 0.5, 0.0, 1.0);
  // 只取场里最亮的脉络当发光核（阈值上提 → 亮核稀疏 → 有深浅对比，不是平）
  float vein = smoothstep(0.58, 0.92, gcore);
  // 发光核把明度往上抬，但用 vBase 门控：只在已经是「脊」的地方加光，
  //   深影谷(vBase 低)几乎不被抬 → 谷留黑、脊发光 → 真有深浅层次不是整屏泛白
  v += vein * uGlow * 0.5 * smoothstep(0.18, 0.62, vBase);

  // ============================================================
  // SPECULAR HIGHLIGHT —— 高光burst（不是平的中调）
  //   pow(v, 高次) 只保留场里最亮的尖，制造香槟金高光的「亮尖」，
  //   让亮高光段在直方图里独立出来（证明发光，不是一片中调）。
  // ============================================================
  float spec = pow(clamp(v, 0.0, 1.0), 3.2);
  v += spec * uHighlight * 0.35;
  v = clamp(v, 0.0, 1.0);

  // 单一暖色家族 ramp 上色（明度层次：深古铜→琥珀→亮香槟金）
  vec3 col = warmRamp(v);

  // ============================================================
  // ADDITIVE BLOOM —— 让最亮的核真的「发光」（往高光色加能量）
  //   只在 vein×spec 的交集处加，且加的是高光 ramp 端的暖色（uC4），
  //   不是纯白——保持色相在暖家族，只是让核处自发光、有通透感。
  // ============================================================
  float bloom = vein * spec * uGlow;
  col += uC4 * bloom * 0.45;

  gl_FragColor = vec4(col, uAlpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const n = parseInt(v.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

interface PointerState {
  active: boolean;
  nx: number;
  ny: number;
}

type SceneProps = Required<
  Omit<
    FluidFlowProps,
    | "width"
    | "height"
    | "className"
    | "children"
    | "dpr"
    | "preserveDrawingBuffer"
  >
> & {
  onPointerReady: (state: PointerState) => void;
};

const FluidScene: React.FC<SceneProps> = (props) => {
  const { gl, size } = useThree();

  const refs = useRef<{
    mat: THREE.ShaderMaterial;
    geom: THREE.PlaneGeometry;
    mesh: THREE.Mesh;
    scene: THREE.Scene;
    cam: THREE.OrthographicCamera;
    pointer: PointerState;
    smoothed: THREE.Vector2;
  } | null>(null);

  if (refs.current === null) {
    const geom = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: SCREEN_VERTEX,
      fragmentShader: FLUID_FRAGMENT,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uScale: { value: 1.6 },
        uWarp: { value: 2.6 },
        uGamma: { value: 1.0 },
        uContrast: { value: 0.5 },
        uGlow: { value: 1.0 },
        uHighlight: { value: 1.0 },
        uAlpha: { value: 1 },
        uC0: { value: new THREE.Vector3() },
        uC1: { value: new THREE.Vector3() },
        uC2: { value: new THREE.Vector3() },
        uC3: { value: new THREE.Vector3() },
        uC4: { value: new THREE.Vector3() },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uCursorActive: { value: 0 },
        uCursorStrength: { value: 0.5 },
      },
    });
    const mesh = new THREE.Mesh(geom, mat);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cam.position.z = 1;
    refs.current = {
      mat,
      geom,
      mesh,
      scene,
      cam,
      pointer: { active: false, nx: 0.5, ny: 0.5 },
      smoothed: new THREE.Vector2(0.5, 0.5),
    };
  }

  const onReady = props.onPointerReady;
  useEffect(() => {
    const r = refs.current;
    if (r) onReady(r.pointer);
  }, [onReady]);

  useEffect(() => {
    return () => {
      const r = refs.current;
      if (!r) return;
      r.mat.dispose();
      r.geom.dispose();
    };
  }, []);

  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    const r = refs.current;
    if (!r) return;
    const u = r.mat.uniforms;

    if (!props.paused) {
      elapsedRef.current += delta * Math.max(props.speed, 0);
    }
    u.uTime.value = elapsedRef.current;
    u.uRes.value.set(size.width, size.height);
    u.uScale.value = props.scale;
    u.uWarp.value = props.warp;
    u.uGamma.value = props.gamma;
    u.uContrast.value = props.contrast;
    u.uGlow.value = props.glow;
    u.uHighlight.value = props.highlight;
    u.uAlpha.value = props.opacity;

    const c0 = hexToRgb(props.ramp[0]);
    const c1 = hexToRgb(props.ramp[1]);
    const c2 = hexToRgb(props.ramp[2]);
    const c3 = hexToRgb(props.ramp[3]);
    const c4 = hexToRgb(props.ramp[4]);
    u.uC0.value.set(c0[0], c0[1], c0[2]);
    u.uC1.value.set(c1[0], c1[1], c1[2]);
    u.uC2.value.set(c2[0], c2[1], c2[2]);
    u.uC3.value.set(c3[0], c3[1], c3[2]);
    u.uC4.value.set(c4[0], c4[1], c4[2]);

    const p = r.pointer;
    const ease = 1 - Math.exp(-delta / 0.18);
    r.smoothed.x += (p.nx - r.smoothed.x) * ease;
    r.smoothed.y += (p.ny - r.smoothed.y) * ease;
    u.uPointer.value.set(r.smoothed.x, r.smoothed.y);
    u.uCursorActive.value = props.cursorInteraction && p.active ? 1 : 0;
    u.uCursorStrength.value = props.cursorStrength;

    gl.setRenderTarget(null);
    gl.render(r.scene, r.cam);
  }, 1);

  return null;
};

const FluidFlow: React.FC<FluidFlowProps> = ({
  width = "100%",
  height = "100%",
  className,
  children,
  speed = 1,
  scale = 1.6,
  warp = 2.6,
  gamma = 1.0,
  contrast = 0.5,
  glow = 1.0,
  highlight = 1.0,
  ramp = ["#2b1d15", "#69463a", "#a87a4e", "#d9ab6f", "#f6e3bf"],
  opacity = 1,
  dpr = 1.5,
  preserveDrawingBuffer = false,
  paused = false,
  cursorInteraction = true,
  cursorStrength = 0.5,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<PointerState | null>(null);

  const handlePointerReady = (state: PointerState) => {
    pointerRef.current = state;
  };

  const updatePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    const p = pointerRef.current;
    if (!el || !p) return;
    const rect = el.getBoundingClientRect();
    p.nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
    p.ny = 1 - (e.clientY - rect.top) / Math.max(rect.height, 1);
    p.active = true;
  };

  const handlePointerLeave = () => {
    const p = pointerRef.current;
    if (p) p.active = false;
  };

  const rampTuple = useMemo(
    () => ramp as [string, string, string, string, string],
    [ramp],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
      onPointerMove={cursorInteraction ? updatePointer : undefined}
      onPointerEnter={cursorInteraction ? updatePointer : undefined}
      onPointerLeave={cursorInteraction ? handlePointerLeave : undefined}
    >
      <Canvas
        className="absolute inset-0"
        dpr={[1, dpr]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer,
        }}
        orthographic
        camera={{
          position: [0, 0, 1],
          zoom: 1,
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
        }}
      >
        <FluidScene
          speed={speed}
          scale={scale}
          warp={warp}
          gamma={gamma}
          contrast={contrast}
          glow={glow}
          highlight={highlight}
          ramp={rampTuple}
          opacity={opacity}
          paused={paused}
          cursorInteraction={cursorInteraction}
          cursorStrength={cursorStrength}
          onPointerReady={handlePointerReady}
        />
      </Canvas>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};

FluidFlow.displayName = "FluidFlow";

export default FluidFlow;
