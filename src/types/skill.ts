export type SkillKind =
  | "visual-skill"
  | "browser-tool"
  | "text-workflow"
  | "agent-workflow";

export type OutputType = "images" | "video" | "slides" | "web" | "games";

export type TaskToolType = "data" | "developer" | "writing";

export type CollectionSlug =
  | "web-design"
  | "slide-decks"
  | "video"
  | "images"
  | "games"
  | "threejs"
  | "webgl-shaders"
  | "canvas"
  | "svg"
  | "data-tools"
  | "developer-tools"
  | "writing-tools"
  | "agent-workflows";

export type TopicSlug =
  | "3d"
  | "games-toys"
  | "animation-motion"
  | "sites-landing"
  | "ui-components"
  | "data-viz"
  | "explainers-learning"
  | "productivity-tools"
  | "for-developers"
  | "marketing-brand"
  | "business-reports"
  | "talks-events"
  | "music-audio"
  | "generative-art"
  | "physics-simulation"
  | "video-production";

export type SceneType =
  | "room3d"
  | "exploded"
  | "exosuit"
  | "coral3d"
  | "timeline"
  | "shader"
  | "poster"
  | "arcade"
  | "physics"
  | "synth";

export type PlatformId =
  | "claude-code"
  | "cursor"
  | "codex"
  | "gemini-cli"
  | "copilot"
  | "windsurf"
  | "antigravity"
  | "opencode";

export type LicenseType =
  | "MIT"
  | "Apache-2.0"
  | "BSD-3-Clause"
  | "AGPL-3.0"
  | "CC0-1.0"
  | "CC-BY-NC-4.0"
  | "Source-Available"
  | "Custom";

export interface SkillGalleryImage {
  src: string;
  alt: string;
  caption: string;
  sourceUrl: string;
  bytes?: number;
}

export interface SkillFileNode {
  path: string;
  type: "markdown" | "script" | "config" | "reference";
  size: string;
  preview: string;
}

export interface PlaybookStep {
  step: string;
  title: string;
  detail: string;
}

export interface VerificationCheck {
  label: string;
  passed: boolean;
  note: string;
}

export interface VisualSceneConfig {
  sceneType: SceneType;
  bg: string;
  accent: string;
  secondary: string;
  hudLeft: string;
  hudRight: string;
  caption: string;
}

export interface SkillItem {
  id: string;
  slug: string;
  title: string;
  englishName: string;
  kind: SkillKind;
  output?: OutputType;
  taskTool?: TaskToolType;
  collections: CollectionSlug[];
  topics: TopicSlug[];
  techTags: string[];
  deliverable: string;
  summary: string;
  repo: string;
  repoUrl: string;
  subpath: string;
  skillBlobUrl?: string;
  license: LicenseType;
  stars: number;
  updatedAt: string;
  featured: boolean;
  free: boolean;
  functionTested: boolean;
  platforms: PlatformId[];
  installCommand: string;
  coverImage?: string;
  coverSourceUrl?: string;
  galleryImages?: SkillGalleryImage[];
  scene: VisualSceneConfig;
  playbookSteps: PlaybookStep[];
  files: SkillFileNode[];
  verificationChecks: VerificationCheck[];
}

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  vendor: string;
  skillPathTemplate: string;
  mcpConfigPath: string;
  rulePath: string;
  supportLevel: "原生支持" | "标准兼容" | "实验支持";
  notes: string;
}

export type SortMode =
  | "newest"
  | "popular"
  | "oldest"
  | "type"
  | "name-asc"
  | "name-desc";

export interface SkillQueryInput {
  q?: string;
  kind?: SkillKind | "all" | "featured";
  collection?: CollectionSlug | "all";
  output?: OutputType | "all";
  task?: TaskToolType | "all";
  topic?: TopicSlug | "all";
  platform?: PlatformId | "all";
  freeOnly?: boolean;
  testedOnly?: boolean;
  sort?: SortMode;
}
