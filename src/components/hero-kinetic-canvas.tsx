"use client";

import Link from "next/link";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type EngineMode = "cad3d" | "wave" | "boids" | "arcade";

interface ModeConfig {
  id: EngineMode;
  code: string;
  label: string;
  tech: string;
  slug: string;
  skillName: string;
}

const MODES: ModeConfig[] = [
  {
    id: "cad3d",
    code: "01",
    label: "3D 世界场景",
    tech: "THREE.JS + SCROLL WORLDS",
    slug: "build-threejs-scroll-worlds",
    skillName: "Three.js 沉浸式 3D 关卡与空间穿行 (MengTo)",
  },
  {
    id: "wave",
    code: "02",
    label: "GLSL 拟真海洋",
    tech: "GERSTNER WAVE + WEBGL2",
    slug: "3d-ultra-realistic-water",
    skillName: "WebGL2 物理海浪与折射着色器 (MengTo)",
  },
  {
    id: "boids",
    code: "03",
    label: "Boids 群体光学",
    tech: "AUTONOMOUS FISH SWARM",
    slug: "3d-underwater-god-rays",
    skillName: "水下体积光束与群体生态着色器 (MengTo)",
  },
  {
    id: "arcade",
    code: "04",
    label: "3D 游戏战斗 VFX",
    tech: "ICE FROST & SHADER VFX",
    slug: "ice-frost-skill-vfx",
    skillName: "Three.js 冰霜裂变游戏战斗特效 (MengTo)",
  },
];

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export function HeroKineticCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const [mode, setMode] = useState<EngineMode>("cad3d");
  const [playing, setPlaying] = useState(true);
  const [cursorHud, setCursorHud] = useState("X:0.50 Y:0.50");

  const activeConfig = MODES.find((m) => m.id === mode) ?? MODES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const boids: Boid[] = Array.from({ length: 44 }, (_, i) => ({
      x: ((i * 73) % 520) + 40,
      y: ((i * 47) % 300) + 30,
      vx: Math.cos(i) * 1.9,
      vy: Math.sin(i * 1.3) * 1.9,
      color: i % 4 === 0 ? "#ff3b1d" : i % 3 === 0 ? "#0052ff" : "#111216",
    }));

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(300, Math.floor(rect.width * dpr));
      canvas.height = Math.max(240, Math.floor(rect.height * dpr));
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function drawDraftingPaper(w: number, h: number) {
      if (!ctx) return;
      ctx.fillStyle = "#faf9f5";
      ctx.fillRect(0, 0, w, h);

      // Subtle architectural grid
      ctx.strokeStyle = "rgba(17, 18, 22, 0.055)";
      ctx.lineWidth = 1;
      const step = 28;
      ctx.beginPath();
      for (let x = step; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = step; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Registration crosshair at center
      ctx.strokeStyle = "rgba(0, 82, 255, 0.16)";
      ctx.beginPath();
      ctx.moveTo(w / 2 - 12, h / 2);
      ctx.lineTo(w / 2 + 12, h / 2);
      ctx.moveTo(w / 2, h / 2 - 12);
      ctx.lineTo(w / 2, h / 2 + 12);
      ctx.stroke();
    }

    function drawCad3D(w: number, h: number, t: number) {
      if (!ctx) return;
      const mx = (pointerRef.current.x - 0.5) * 0.9;
      const my = (pointerRef.current.y - 0.5) * 0.65;
      const angleY = t * 0.65 + mx * 2.1;
      const angleX = 0.58 + my * 1.1;

      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = 320 / (320 + z2 * 0.45);
        return {
          px: w / 2 + x1 * scale,
          py: h / 2 + y2 * scale,
        };
      };

      const explode = 24 + Math.sin(t * 1.4) * 14;
      const layers = [
        { y: explode * 1.4, label: "CHASSIS_SHELL", stroke: "#111216", fill: "rgba(17,18,22,0.06)" },
        { y: 0, label: "PCB_CORE_LOGIC", stroke: "#0052ff", fill: "rgba(0,82,255,0.12)" },
        { y: -explode * 1.4, label: "OPTICAL_LCD", stroke: "#ff3b1d", fill: "rgba(255,59,29,0.12)" },
      ];

      // Central explosion alignment axis
      const axisTop = project(0, -explode * 2.1, 0);
      const axisBot = project(0, explode * 2.1, 0);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#7a808f";
      ctx.beginPath();
      ctx.moveTo(axisTop.px, axisTop.py);
      ctx.lineTo(axisBot.px, axisBot.py);
      ctx.stroke();
      ctx.restore();

      const size = 66;
      layers.forEach((layer, idx) => {
        const corners = [
          project(-size, layer.y, -size * 0.72),
          project(size, layer.y, -size * 0.72),
          project(size, layer.y, size * 0.72),
          project(-size, layer.y, size * 0.72),
        ];

        ctx.beginPath();
        corners.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        });
        ctx.closePath();
        ctx.fillStyle = layer.fill;
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = layer.stroke;
        ctx.stroke();

        // Corner nodes
        corners.forEach((pt) => {
          ctx.fillStyle = idx === 1 ? "#c8ff29" : layer.stroke;
          ctx.fillRect(pt.px - 2.5, pt.py - 2.5, 5, 5);
        });

        // Layer callout leader
        const anchor = corners[1];
        ctx.beginPath();
        ctx.moveTo(anchor.px, anchor.py);
        ctx.lineTo(anchor.px + 28, anchor.py - 12);
        ctx.lineTo(anchor.px + 96, anchor.py - 12);
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#111216";
        ctx.font = "600 9px monospace";
        ctx.fillText(layer.label, anchor.px + 32, anchor.py - 16);
      });

      // Orbiting 3D octahedron inside center layer
      const r = 24;
      const oct = [
        project(0, -r, 0),
        project(r, 0, 0),
        project(0, 0, r),
        project(-r, 0, 0),
        project(0, 0, -r),
        project(0, r, 0),
      ];
      ctx.strokeStyle = "#111216";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      [1, 2, 3, 4].forEach((idx) => {
        ctx.moveTo(oct[0].px, oct[0].py);
        ctx.lineTo(oct[idx].px, oct[idx].py);
        ctx.moveTo(oct[5].px, oct[5].py);
        ctx.lineTo(oct[idx].px, oct[idx].py);
      });
      ctx.moveTo(oct[1].px, oct[1].py);
      ctx.lineTo(oct[2].px, oct[2].py);
      ctx.lineTo(oct[3].px, oct[3].py);
      ctx.lineTo(oct[4].px, oct[4].py);
      ctx.closePath();
      ctx.stroke();
    }

    function drawWaveField(w: number, h: number, t: number) {
      if (!ctx) return;
      const cols = 22;
      const rows = 14;
      const mx = pointerRef.current.x;
      const my = pointerRef.current.y;

      const pts: { x: number; y: number; amp: number }[][] = [];
      for (let r = 0; r < rows; r++) {
        const rowPts: { x: number; y: number; amp: number }[] = [];
        for (let c = 0; c < cols; c++) {
          const nx = c / (cols - 1);
          const nz = r / (rows - 1);
          const dx = nx - mx;
          const dz = nz - my;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const ripple = Math.sin(dist * 18 - t * 3.2) * Math.exp(-dist * 2.5);
          const harmonic =
            Math.sin(nx * 6 + t * 1.4) * Math.cos(nz * 5 - t * 1.1) * 0.65;
          const elev = (harmonic + ripple * 1.3) * 24;

          const perspective = 0.62 + nz * 0.58;
          const sx = w / 2 + (nx - 0.5) * w * 0.78 * perspective;
          const sy = h * 0.25 + nz * h * 0.56 - elev;
          rowPts.push({ x: sx, y: sy, amp: elev });
        }
        pts.push(rowPts);
      }

      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = pts[r][c];
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = r % 3 === 0 ? "#0052ff" : "rgba(17, 18, 22, 0.45)";
        ctx.lineWidth = r % 3 === 0 ? 1.5 : 1;
        ctx.stroke();

        for (let c = 0; c < cols; c++) {
          const p = pts[r][c];
          if (p.amp > 11) {
            ctx.fillStyle = "#ff3b1d";
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          } else if (p.amp < -11) {
            ctx.fillStyle = "#c8ff29";
            ctx.strokeStyle = "#111216";
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          }
        }
      }
    }

    function drawBoids(w: number, h: number, step: boolean) {
      if (!ctx) return;
      const tx = pointerRef.current.x * w;
      const ty = pointerRef.current.y * h;

      if (step) {
        boids.forEach((b) => {
          const dx = tx - b.x;
          const dy = ty - b.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 220) {
            b.vx += (dx / dist) * 0.095;
            b.vy += (dy / dist) * 0.095;
          }
          // Gentle swirl
          b.vx += (-dy / dist) * 0.025;
          b.vy += (dx / dist) * 0.025;

          const speed = Math.hypot(b.vx, b.vy) || 1;
          const maxSpeed = 3.2;
          if (speed > maxSpeed) {
            b.vx = (b.vx / speed) * maxSpeed;
            b.vy = (b.vy / speed) * maxSpeed;
          }

          b.x += b.vx;
          b.y += b.vy;
          if (b.x < 16) b.x = w - 16;
          if (b.x > w - 16) b.x = 16;
          if (b.y < 16) b.y = h - 16;
          if (b.y > h - 16) b.y = 16;
        });
      }

      // Draw proximity links
      ctx.strokeStyle = "rgba(0, 82, 255, 0.16)";
      ctx.lineWidth = 1;
      for (let i = 0; i < boids.length; i++) {
        for (let j = i + 1; j < boids.length; j++) {
          const d = Math.hypot(boids[i].x - boids[j].x, boids[i].y - boids[j].y);
          if (d < 58) {
            ctx.beginPath();
            ctx.moveTo(boids[i].x, boids[i].y);
            ctx.lineTo(boids[j].x, boids[j].y);
            ctx.stroke();
          }
        }
      }

      // Target cursor ring
      ctx.beginPath();
      ctx.arc(tx, ty, 18, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff3b1d";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw directional triangle boids
      boids.forEach((b) => {
        const ang = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-6, -4.5);
        ctx.lineTo(-3.5, 0);
        ctx.lineTo(-6, 4.5);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      });
    }

    function drawArcade(w: number, h: number, t: number) {
      if (!ctx) return;
      const steer = (pointerRef.current.x - 0.5) * 140;
      const horizonY = h * 0.42 + (pointerRef.current.y - 0.5) * 28;
      const vanishX = w / 2 + steer;

      // Upper sky sun & scan bars
      ctx.beginPath();
      ctx.arc(vanishX, horizonY - 38, 36, Math.PI, 0);
      ctx.fillStyle = "#c8ff29";
      ctx.fill();
      ctx.strokeStyle = "#111216";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.strokeStyle = "#111216";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Perspective lanes
      const lanes = 12;
      for (let i = -lanes; i <= lanes; i++) {
        ctx.beginPath();
        ctx.moveTo(vanishX + i * 8, horizonY);
        ctx.lineTo(w / 2 + i * 68, h);
        ctx.strokeStyle = Math.abs(i) <= 2 ? "#0052ff" : "rgba(17,18,22,0.22)";
        ctx.lineWidth = Math.abs(i) <= 2 ? 1.5 : 1;
        ctx.stroke();
      }

      // Scrolling horizontal speed bars
      for (let i = 0; i < 9; i++) {
        const p = ((i / 9 + t * 0.45) % 1) ** 2;
        const y = horizonY + p * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = "#111216";
        ctx.lineWidth = 0.8 + p * 1.4;
        ctx.stroke();
      }

      // Player racer silhouette
      const carX = w / 2 - steer * 0.35;
      const carY = h * 0.78;
      ctx.fillStyle = "#ff3b1d";
      ctx.strokeStyle = "#111216";
      ctx.lineWidth = 2;
      ctx.fillRect(carX - 32, carY - 12, 64, 22);
      ctx.strokeRect(carX - 32, carY - 12, 64, 22);
      ctx.fillStyle = "#c8ff29";
      ctx.fillRect(carX - 18, carY - 22, 36, 12);
      ctx.strokeRect(carX - 18, carY - 22, 36, 12);
    }

    function frame() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (playing) {
        time += 0.018;
      }

      drawDraftingPaper(w, h);
      if (mode === "cad3d") {
        drawCad3D(w, h, time);
      } else if (mode === "wave") {
        drawWaveField(w, h, time);
      } else if (mode === "boids") {
        drawBoids(w, h, playing);
      } else {
        drawArcade(w, h, time);
      }

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [mode, playing]);

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    pointerRef.current = { x: nx, y: ny, active: true };
    setCursorHud(`X:${nx.toFixed(2)} Y:${ny.toFixed(2)}`);
  }

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[3px] border border-[#111216] bg-white shadow-[6px_6px_0_#111216]">
      {/* Viewport Top Telemetry Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#111216] bg-[#eae8e0] px-3.5 py-2 font-mono text-[10px]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff3b1d]" />
          <span className="truncate font-bold tracking-wider text-[#111216]">
            LIVE VIEWPORT // {activeConfig.tech}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[#4e5361] sm:inline">{cursorHud}</span>
          <span className="rounded-[2px] border border-[#111216] bg-[#c8ff29] px-1.5 py-0.5 font-bold text-[#111216]">
            60 FPS
          </span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "暂停画布动画" : "继续画布动画"}
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] border border-[#111216]/30 bg-white text-[#111216] hover:border-[#111216]"
          >
            {playing ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Interactive Canvas */}
      <div className="relative h-[300px] w-full sm:h-[340px]">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          className="block h-full w-full cursor-crosshair"
        />
        <div className="pointer-events-none absolute bottom-2.5 left-3 rounded-[2px] border border-[#111216]/20 bg-white/85 px-2 py-0.5 font-mono text-[10px] text-[#4e5361] backdrop-blur-xs">
          移动鼠标实时交互视角与物理场
        </div>
      </div>

      {/* Mode Switcher Console */}
      <div className="grid grid-cols-2 border-t border-[#111216] sm:grid-cols-4">
        {MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex cursor-pointer flex-col border-[#111216]/15 px-3 py-2.5 text-left transition-colors odd:border-r border-b nth-[n+3]:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                active
                  ? "bg-[#111216] text-white"
                  : "bg-white text-[#111216] hover:bg-[#f4f3ee]"
              }`}
            >
              <span
                className={`font-mono text-[9px] font-bold ${
                  active ? "text-[#c8ff29]" : "text-[#0052ff]"
                }`}
              >
                MODE {m.code}
              </span>
              <span className="mt-0.5 text-[11px] font-bold">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Deep Link to Corresponding Skill Package */}
      <div className="flex items-center justify-between gap-2 border-t border-[#111216]/15 bg-[#f4f3ee] px-3.5 py-2 text-xs">
        <span className="truncate font-mono text-[11px] text-[#4e5361]">
          关联开源 Skill:{" "}
          <strong className="text-[#111216]">{activeConfig.skillName}</strong>
        </span>
        <Link
          href={`/skills/${activeConfig.slug}`}
          className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold text-[#0052ff] hover:text-[#ff3b1d]"
        >
          <span>查看源码</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
