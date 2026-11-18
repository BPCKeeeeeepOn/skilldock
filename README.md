# SKILLDOCK // 技能坞 · 开源 Agent Skills 索引库与本地 CLI 一键直装平台

<p align="left">
  <strong>面向 AI 编码智能体（Claude Code / Cursor / Codex / Gemini CLI / Antigravity / Copilot / Windsurf / OpenCode）的开源 <code>SKILL.md</code> 创意与工程技能实验室</strong>
</p>

- 在线访问：**[https://skilldock.baopengcheng.com](https://skilldock.baopengcheng.com)**
- 技能目录：**[https://skilldock.baopengcheng.com/skills](https://skilldock.baopengcheng.com/skills)**（支持多维筛选、动态子分类、分页与全文检索）
- 游戏专项：**[https://skilldock.baopengcheng.com/skills?output=games](https://skilldock.baopengcheng.com/skills?output=games)**

---

## 项目简介

**SKILLDOCK（技能坞）** 收录了来自 **92 个开源 GitHub 仓库**、经过逐项核验与中文编目的 **334 个高质量开源 Agent Skills**，覆盖 **3D 交互、编程式视频（Remotion / Manim / Lemo-Opuscar）、游戏开发与多引擎工程（Godot / Unity / Unreal / Roblox / Phaser / Three.js / Bevy / Ebitengine）、网页设计、视觉海报、幻灯片与开发/数据/写作效率工具**。

所有条目均附带真实的 `SKILL.md` 源码节选、本地缓存预览图/动图、配套参考文档（`references/`、`scripts/`、`assets/`）清单，以及适配 8 大 Agent CLI 的标准安装路径与一键直装脚本。

---

## 目录规模与分类体系

当前目录共收录 **334 项**（其中精选推荐 **90 项**），严格区分「创作产出（Output）」与「任务工具（Task Tool）」两个一级维度：

| 分类维度 | 类目 | 数量 | 说明与代表内容 |
| :--- | :--- | ---: | :--- |
| **产出类型 Output (308)** | **视频 Video** | 160 | Remotion 60fps 动效短片、3Blue1Brown Manim、99 款 Lemo-Opuscar 电影级剪辑风格、MG 图形等 |
| | **游戏 Games** | 88 | 完整收录 `awesome-gamedev-agent-skills` 80 项（总控路由 + 12 大引擎 + 15 游戏学科 + 9 玩法 + 5 发布流）及 Roblox/Phaser/Godot/Three.js 游戏专项 |
| | **网页 Web** | 29 | Three.js 场景与着色器、UI/UX 审计、Frontend Design、SVG 与 WebGL 粒子视觉等 |
| | **图像 Images** | 22 | 小红书/信息图排版、科普插画、视觉设计规范、Comfy/生图提示词流等 |
| | **幻灯片 Slides** | 9 | HTML 动画演示文稿、Pitch Deck、技术演讲 PPT 工作流 |
| **任务工具 Task (26)** | **开发者 Developer** | 10 | Playwright 调试、GitHub 工作流、架构图解、工程脚手架等 |
| | **数据 Data** | 9 | 数据可视化、分析报告与表格处理技能 |
| | **写作 Writing** | 7 | 技术文档、学术写作、结构化摘要与多语种内容工作流 |
| **技能形态 Kind (334)** | 视觉技能 `visual-skill` / 工作流 `agent-workflow` / 文本 `text-workflow` / 浏览器 `browser-tool` | 290 / 26 / 10 / 8 | 结合 **13 个专题合集** 与 **16 个细分主题** 动态联动筛选 |

---

## 核心特性

1. **首页创作分类矩阵与交互实验室（`/`）**
   - 内置交互式 Canvas / Three.js 实时演示画布、全局搜索栏与 13 项专题合集快捷入口（包含 `游戏 Games`、Three.js、WebGL & Shaders、Canvas、SVG、Agent 工作流等）。
2. **层级联动筛选 + 动态子分类 + URL 分页（`/skills`）**
   - **母子分类联动**：选择 `全部产出` 时保持视野清爽（隐藏冗长标签墙）；点选左侧任意具体产出或任务分类后，右侧动态展开与该分类强相关的子分类标签并自动过滤冗余标签。
   - **URL 同步分页**：支持 `24 / 48 / 96` 每页条数切换，完整同步 `?output=&task=&topic=&collection=&kind=&q=&sort=&page=&limit=` 查询参数。
3. **本机 8 大 Agent CLI 自动探测与一键全包安装（`/platforms` 与技能详情页）**
   - 自动扫描本机已安装的 CLI 与全局/项目级技能目录（连接状态持久化在 `~/.skilldock/connected-agents.json`）。
   - 点击「一键安装」会直接解析上游 GitHub 仓库的 `SKILL.md`、`references/`、`scripts/`、`assets/`（`github-tree` 并发拉取，自动防路径穿越），写入目标 Agent 技能目录并生成 `.skilldock.json` 清单，支持一键卸载回滚。
   - 注：部署到云端服务器时，服务端探测的是云端宿主机的本机路径，访客可通过详情页预览完整 `SKILL.md` 源码并一键复制 `npx skills add <owner/repo> --skill <name>` 在自己电脑执行。
4. **GitHub 开源雷达（`/discover` + CLI 采集脚本）**
   - 实时检索 GitHub 公开仓库中的 `SKILL.md` 与 `agent skills` 项目，支持直接触发一键安装或复制标准 CLI 命令；可选配置 `GITHUB_TOKEN` 将 API 速率限制从匿名 `60 次/小时` 提升至 `5,000 次/小时`。

---

## 支持的 Agent CLI 与安装路径约定

内置对 **8 个主流编码智能体平台** 的路径映射与安装适配（定义于 [`src/data/platforms.ts`](src/data/platforms.ts)）：

| 平台 | 厂商 | 项目级技能目录 | 规则 / MCP 配置约定 |
| :--- | :--- | :--- | :--- |
| **Claude Code** | Anthropic | `.claude/skills/<slug>/` | `CLAUDE.md` · `.mcp.json` |
| **Cursor** | Anysphere | `.cursor/skills/<slug>/` | `.cursor/rules/*.mdc` · `.cursor/mcp.json` |
| **OpenAI Codex** | OpenAI | `.codex/skills/<slug>/` | `AGENTS.md` · `~/.codex/config.toml` |
| **Gemini CLI** | Google | `.gemini/skills/<slug>/` | `GEMINI.md` · `.gemini/settings.json` |
| **Antigravity IDE / CLI** | Google DeepMind | `.gemini/antigravity/skills/<slug>/` | `AGENTS.md` · `mcp_config.json` |
| **GitHub Copilot** | GitHub | `.github/skills/<slug>/` | `.github/copilot-instructions.md` · `.vscode/mcp.json` |
| **Windsurf** | Codeium | `.windsurf/skills/<slug>/` | `.windsurfrules` · `~/.codeium/windsurf/mcp_config.json` |
| **OpenCode** | OpenCode Community | `.opencode/skills/<slug>/` | `AGENTS.md` · `opencode.json` |

---

## 技术栈

- **框架与构建**：Next.js `16.4.6`（App Router + Turbopack + Cache Components / Partial Prerendering）
- **UI 与样式**：React `19.3.0`、TypeScript `5`、Tailwind CSS `4.3`、Lucide Icons
- **运行方式**：原生 Node.js `20+` 或 Docker Compose（`node:22-alpine` 多阶段构建）

---

## 快速开始

### 1. 本地开发运行

要求 **Node.js 20+** 与 **npm**：

```bash
git clone https://github.com/BPCKeeeeeepOn/skilldock.git
cd skilldock
npm install

# 启动开发环境（默认 http://localhost:3000）
npm run dev

# 或指定端口启动本地生产服务
npx next typegen && npm run build
npm run start -- -p 3010
```

### 2. Docker Compose 部署（推荐）

仓库内已提供多阶段 [`Dockerfile`](Dockerfile) 与 [`docker-compose.yml`](docker-compose.yml)，默认监听 **3010** 端口并带健康检查：

```bash
# 国内网络默认通过 npmmirror 加速安装依赖
docker compose up -d --build

# 查看状态与日志
docker compose ps
docker compose logs -f
```

### 3. 环境变量（可选）

| 变量名 | 默认值 | 用途说明 |
| :--- | :--- | :--- |
| `PORT` | `3010` | 服务监听端口（Docker 运行时使用） |
| `GITHUB_TOKEN` | 无（匿名限 `60/h`） | 配置 GitHub PAT 后，`/api/github/search`、包安装树抓取及采集脚本提升至 `5,000 次/小时` 额度 |
| `NPM_REGISTRY` | `https://registry.npmmirror.com` | Docker 构建阶段的 npm 镜像源（海外服务器可传 `--build-arg NPM_REGISTRY=https://registry.npmjs.org/`） |

### 4. CLI 批量采集脚本（可选）

```bash
# 搜索公开仓库并导出到 data/discovered-skills.json
node scripts/discover-github-skills.mjs "threejs skills"

# 携带 Token 使用 GitHub Code Search 精确查找 filename:SKILL.md
GITHUB_TOKEN=ghp_xxx node scripts/discover-github-skills.mjs "godot"
```

---

## 目录结构

```text
.
├── src/
│   ├── app/
│   │   ├── page.tsx                       # 首页：Hero 画布、创作分类矩阵与精选技能
│   │   ├── skills/
│   │   │   ├── page.tsx                   # 探索索引页
│   │   │   └── [slug]/page.tsx            # 技能详情页（源码预览、实拍图集、一键安装）
│   │   ├── platforms/page.tsx             # 本机 8 大 Agent CLI 探测与连接中心
│   │   ├── discover/page.tsx              # GitHub 开源雷达
│   │   └── api/
│   │       ├── skills/route.ts            # 目录多维查询 API
│   │       ├── github/search/route.ts     # GitHub 开源 Skill 检索 API
│   │       └── local-agents/              # 探测、连接、一键安装与卸载 API
│   ├── components/                        # 前端交互组件（筛选、分页、画布、卡片、抽屉）
│   ├── data/
│   │   ├── catalog.ts                     # 334 项已校验开源技能目录数据与查询函数
│   │   └── platforms.ts                   # 8 个 Agent CLI 平台路径配置
│   ├── lib/local-agents.ts                # 本地 CLI 扫描及 GitHub 全包拉取/安装引擎
│   └── types/skill.ts                     # 目录与 API TypeScript 类型定义
├── public/previews/                       # 本地高速缓存的开源项目实拍预览图与动图
├── scripts/discover-github-skills.mjs     # GitHub SKILL.md CLI 探测脚本
├── Dockerfile                             # Node 22 Alpine 多阶段生产镜像定义
├── docker-compose.yml                     # Docker Compose 编排与健康检查
└── next.config.ts                         # Next.js 16 + Turbopack 配置
```

---

## 版权与上游声明

本项目索引与展示的所有第三方开源 Skill、文档摘录及视觉预览图均保留原始作者署名、开源协议（如 `MIT`、`Apache-2.0` 等）与 GitHub 源仓库直链，安装能力直接从各自上游 GitHub 仓库拉取对应内容。
