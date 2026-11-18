import type { Metadata } from "next";
import {
  Instrument_Serif,
  JetBrains_Mono,
  Space_Grotesk,
  Syne,
} from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LocalAgentsProvider } from "@/components/local-agents-provider";
import { LocalAgentsDrawer } from "@/components/local-agents-drawer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SKILLDOCK // 技能坞 · 本地 Agent CLI 创意技能直装实验室",
  description:
    "聚焦 3D 场景、GLSL 着色器、编程式视频与交互游戏的开源 Agent Skills 实验室，支持自动连接本机 Claude Code、Codex、Antigravity 等 CLI 一键直装。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${spaceGrotesk.variable} ${syne.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="daylight-grid-bg min-h-full flex flex-col bg-[#f4f3ee] text-[#111216]">
        <LocalAgentsProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <LocalAgentsDrawer />
        </LocalAgentsProvider>
      </body>
    </html>
  );
}
