import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#111216]/15 bg-[#eae8e0]">
      <div className="mx-auto flex max-w-[1480px] flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-[#4e5361] sm:flex-row sm:items-center sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span className="font-bold tracking-wider text-[#111216]">
            SKILLDOCK // DAYLIGHT STUDIO
          </span>
          <span className="text-[#bab5a8]">|</span>
          <span>3D SCENES · GLSL SHADERS · VIDEO · GAMES · SKILL.MD</span>
        </div>

        <div className="flex flex-wrap items-center gap-5 font-mono text-[11px]">
          <Link href="/" className="hover:text-[#0052ff]">
            00_HOME
          </Link>
          <Link href="/skills" className="hover:text-[#0052ff]">
            01_DIRECTORY
          </Link>
          <Link href="/platforms" className="hover:text-[#0052ff]">
            02_PLATFORMS
          </Link>
          <Link href="/discover" className="hover:text-[#0052ff]">
            03_DISCOVER
          </Link>
          <a
            href="https://agentskills.io"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#111216] hover:text-[#ff3b1d]"
          >
            agentskills.io ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
