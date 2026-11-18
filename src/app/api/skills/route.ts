import { querySkills } from "@/data/catalog";
import type {
  CollectionSlug,
  OutputType,
  PlatformId,
  SkillKind,
  SortMode,
  TaskToolType,
  TopicSlug,
} from "@/types/skill";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const kind =
    (searchParams.get("kind") as SkillKind | "all" | "featured" | null) ?? "all";
  const collection =
    (searchParams.get("collection") as CollectionSlug | "all" | null) ?? "all";
  const output =
    (searchParams.get("output") as OutputType | "all" | null) ?? "all";
  const task =
    (searchParams.get("task") as TaskToolType | "all" | null) ?? "all";
  const topic =
    (searchParams.get("topic") as TopicSlug | "all" | null) ?? "all";
  const platform =
    (searchParams.get("platform") as PlatformId | "all" | null) ?? "all";
  const freeOnly =
    searchParams.get("free") === "1" || searchParams.get("free") === "true";
  const testedOnly =
    searchParams.get("tested") === "1" || searchParams.get("tested") === "true";
  const sort = (searchParams.get("sort") as SortMode | null) ?? "newest";

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number(searchParams.get("pageSize") ?? "24") || 24)
  );

  const matched = querySkills({
    q,
    kind,
    collection,
    output,
    task,
    topic,
    platform,
    freeOnly,
    testedOnly,
    sort,
  });

  const start = (page - 1) * pageSize;
  const items = matched.slice(start, start + pageSize);

  return Response.json({
    total: matched.length,
    page,
    pageSize,
    items,
  });
}
