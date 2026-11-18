import type { SkillItem } from "@/types/skill";

interface SkillVisualBannerProps {
  skill: SkillItem;
  tall?: boolean;
}

const SCENE_SURFACES: Record<SkillItem["scene"]["sceneType"], string> = {
  room3d: "#f8f6ef",
  exploded: "#edf3ff",
  exosuit: "#eef4f8",
  coral3d: "#e7fbf6",
  timeline: "#f5f4ee",
  shader: "#faf5f2",
  poster: "#fffdf7",
  arcade: "#eef2ff",
  physics: "#f7f5ee",
  synth: "#f3f6ef",
};

function SceneArtwork({ skill }: { skill: SkillItem }) {
  const { sceneType, accent, secondary } = skill.scene;
  const primaryInk = "#111216";
  const accentColor = accent || "#ff3b1d";
  const secondaryColor = secondary || "#0052ff";

  switch (sceneType) {
    case "room3d":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id={`sun-${skill.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c8ff29" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ff3b1d" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          {/* Architectural room isometric floor */}
          <path
            d="M40 185 L200 115 L360 185 L200 238 Z"
            fill="#eae7dc"
            stroke={primaryInk}
            strokeWidth="1.2"
          />
          <path
            d="M80 168 L240 220 M120 150 L280 202 M160 133 L320 185 M80 202 L240 150 M120 218 L280 166"
            stroke="#c6c1b4"
            strokeWidth="0.8"
          />
          {/* Left & Right glass walls */}
          <path
            d="M40 185 L40 68 L200 18 L200 115 Z"
            fill="#ffffff"
            stroke={primaryInk}
            strokeWidth="1.2"
          />
          <path
            d="M200 115 L200 18 L360 68 L360 185 Z"
            fill="#f1efe7"
            stroke={primaryInk}
            strokeWidth="1.2"
          />
          {/* Skylight mullions */}
          <path
            d="M92 52 L92 162 M146 35 L146 138 M254 35 L254 138 M308 52 L308 162"
            stroke="#c6c1b4"
            strokeWidth="0.9"
          />
          {/* Diagonal sunlight shaft */}
          <polygon
            points="92,52 165,30 272,192 138,210"
            fill={`url(#sun-${skill.id})`}
          />
          {/* Lounge sofa plinth */}
          <path
            d="M155 170 L215 144 L250 160 L190 186 Z"
            fill="#ffffff"
            stroke="#0052ff"
            strokeWidth="1.4"
          />
          <path
            d="M155 170 L155 184 L190 200 L190 186 Z"
            fill="#dbe5ff"
            stroke={primaryInk}
            strokeWidth="1"
          />
          <path
            d="M190 186 L190 200 L250 174 L250 160 Z"
            fill="#c6d5ff"
            stroke={primaryInk}
            strokeWidth="1"
          />
          {/* Camera node */}
          <circle cx="290" cy="112" r="4.5" fill="#ff3b1d" stroke={primaryInk} />
          <path
            d="M290 112 L245 96 M290 112 L245 128 M290 112 L262 88"
            stroke="#ff3b1d"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text x="298" y="115" fill="#111216" fontSize="8" fontWeight="bold" fontFamily="monospace">
            CAM_04
          </text>
        </svg>
      );

    case "exploded":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <line
            x1="200"
            y1="26"
            x2="200"
            y2="225"
            stroke="#0052ff"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Bottom chassis */}
          <g transform="translate(0, 56)">
            <path
              d="M135 125 L200 96 L265 125 L200 154 Z"
              fill="#ffffff"
              stroke={primaryInk}
              strokeWidth="1.4"
            />
            <circle cx="200" cy="125" r="9" fill="#eae8e0" stroke={primaryInk} />
          </g>
          {/* Middle PCB */}
          <g transform="translate(0, 12)">
            <path
              d="M135 125 L200 96 L265 125 L200 154 Z"
              fill="#c8ff29"
              stroke={primaryInk}
              strokeWidth="1.4"
            />
            <rect
              x="188"
              y="113"
              width="24"
              height="24"
              transform="rotate(45 200 125) skewX(15)"
              fill="#0052ff"
              stroke={primaryInk}
              strokeWidth="1.1"
            />
          </g>
          {/* Top bezel */}
          <g transform="translate(0, -34)">
            <path
              d="M135 125 L200 96 L265 125 L200 154 Z"
              fill="#ffffff"
              stroke={primaryInk}
              strokeWidth="1.4"
            />
            <path
              d="M168 122 L200 108 L232 122 L200 136 Z"
              fill="#dbe5ff"
              stroke="#0052ff"
              strokeWidth="1.2"
            />
          </g>
          <path d="M250 86 L295 66 L348 66" fill="none" stroke="#ff3b1d" strokeWidth="1.1" />
          <text x="298" y="60" fill="#ff3b1d" fontSize="8" fontWeight="bold" fontFamily="monospace">
            LCD_LAYER
          </text>
          <path d="M150 137 L104 150 L54 150" fill="none" stroke="#0052ff" strokeWidth="1.1" />
          <text x="54" y="144" fill="#0052ff" fontSize="8" fontWeight="bold" fontFamily="monospace">
            PCB_CORE
          </text>
        </svg>
      );

    case "exosuit":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <ellipse cx="200" cy="192" rx="112" ry="24" fill="#dbe6f2" stroke="#0052ff" strokeWidth="1.1" />
          <ellipse
            cx="200"
            cy="192"
            rx="72"
            ry="15"
            fill="none"
            stroke="#ff3b1d"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx="200"
            cy="118"
            r="68"
            fill="none"
            stroke="#111216"
            strokeOpacity="0.2"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
          <polygon
            points="174,74 226,74 238,118 220,148 180,148 162,118"
            fill="#ffffff"
            stroke={primaryInk}
            strokeWidth="1.5"
          />
          <circle cx="200" cy="108" r="10" fill="#ff3b1d" stroke={primaryInk} strokeWidth="1.2" />
          <rect x="114" y="72" width="28" height="44" rx="2" fill="#c8ff29" stroke={primaryInk} strokeWidth="1.3" />
          <rect x="258" y="72" width="28" height="44" rx="2" fill="#0052ff" stroke={primaryInk} strokeWidth="1.3" />
          <line x1="142" y1="94" x2="168" y2="94" stroke="#ff3b1d" strokeWidth="1.3" strokeDasharray="3 2" />
          <line x1="232" y1="94" x2="258" y2="94" stroke="#ff3b1d" strokeWidth="1.3" strokeDasharray="3 2" />
          <g transform="translate(32, 86)">
            <rect width="40" height="5" fill="#d4d0c5" />
            <rect width="32" height="5" fill="#0052ff" />
            <rect y="11" width="40" height="5" fill="#d4d0c5" />
            <rect y="11" width="24" height="5" fill="#ff3b1d" />
            <rect y="22" width="40" height="5" fill="#d4d0c5" />
            <rect y="22" width="36" height="5" fill="#111216" />
          </g>
        </svg>
      );

    case "coral3d":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <path
            d="M55 162 L200 105 L345 162 L200 218 Z"
            fill="#bdf5e7"
            stroke={primaryInk}
            strokeWidth="1.3"
          />
          <path
            d="M95 148 Q155 125 200 155 T305 148"
            fill="none"
            stroke="#0052ff"
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
          <rect x="145" y="106" width="14" height="48" fill="#ff3b1d" stroke={primaryInk} strokeWidth="1.1" />
          <rect x="165" y="90" width="12" height="60" fill="#fb7185" stroke={primaryInk} strokeWidth="1.1" />
          <circle cx="206" cy="134" r="22" fill="#c8ff29" stroke={primaryInk} strokeWidth="1.2" />
          <circle cx="244" cy="126" r="15" fill="#0052ff" fillOpacity="0.85" stroke={primaryInk} strokeWidth="1.2" />
          {[
            [115, 76],
            [134, 66],
            [150, 82],
            [252, 72],
            [274, 64],
            [286, 80],
          ].map(([cx, cy], idx) => (
            <polygon
              key={idx}
              points={`${cx},${cy} ${cx - 9},${cy - 4} ${cx - 6},${cy + 4}`}
              fill={idx % 2 === 0 ? "#111216" : "#ff3b1d"}
            />
          ))}
        </svg>
      );

    case "timeline":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <line x1="28" y1="56" x2="372" y2="56" stroke={primaryInk} strokeWidth="1.2" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((tick) => {
            const x = 36 + tick * 41;
            return (
              <g key={tick}>
                <line x1={x} y1="49" x2={x} y2="56" stroke={primaryInk} />
                <text x={x - 10} y="44" fill="#4e5361" fontSize="7" fontFamily="monospace">
                  {`0${tick}:00`}
                </text>
              </g>
            );
          })}
          <rect x="44" y="70" width="166" height="27" fill="#ffffff" stroke={primaryInk} strokeWidth="1.2" />
          <rect x="44" y="70" width="7" height="27" fill="#ff3b1d" />
          <text x="58" y="87" fill="#111216" fontSize="8" fontWeight="bold" fontFamily="monospace">
            CAM_PUSH · spring(180)
          </text>

          <rect x="118" y="106" width="198" height="27" fill="#c8ff29" stroke={primaryInk} strokeWidth="1.2" />
          <rect x="118" y="106" width="7" height="27" fill="#0052ff" />
          <text x="132" y="123" fill="#111216" fontSize="8" fontWeight="bold" fontFamily="monospace">
            TITLE_REVEAL · stagger(4f)
          </text>

          <rect x="44" y="142" width="308" height="36" fill="#eae8e0" stroke={primaryInk} strokeWidth="1.1" />
          {Array.from({ length: 34 }).map((_, i) => {
            const h = 6 + ((i * 19 + 7) % 24);
            return (
              <rect
                key={i}
                x={54 + i * 8.6}
                y={160 - h / 2}
                width="3"
                height={h}
                fill={i === 17 ? "#ff3b1d" : "#111216"}
              />
            );
          })}

          <line x1="202" y1="48" x2="202" y2="195" stroke="#ff3b1d" strokeWidth="1.8" />
          <polygon points="195,48 209,48 202,59" fill="#ff3b1d" />
        </svg>
      );

    case "shader":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <defs>
            <radialGradient id={`day-sdf-${skill.id}`} cx="38%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#c8ff29" />
              <stop offset="45%" stopColor="#ff3b1d" />
              <stop offset="88%" stopColor="#0052ff" />
              <stop offset="100%" stopColor="#111216" />
            </radialGradient>
          </defs>
          <circle
            cx="200"
            cy="125"
            r="72"
            fill={`url(#day-sdf-${skill.id})`}
            stroke={primaryInk}
            strokeWidth="1.6"
          />
          <ellipse cx="200" cy="125" rx="72" ry="22" fill="none" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="1" />
          <ellipse cx="200" cy="125" rx="24" ry="72" fill="none" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="1" />
          <line x1="200" y1="125" x2="288" y2="66" stroke={primaryInk} strokeWidth="1.4" />
          <circle cx="288" cy="66" r="4" fill="#c8ff29" stroke={primaryInk} />
          <text x="296" y="70" fill="#111216" fontSize="8" fontWeight="bold" fontFamily="monospace">
            vec3 L
          </text>
        </svg>
      );

    case "poster":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <rect x="92" y="32" width="216" height="174" fill="#ffffff" stroke={primaryInk} strokeWidth="1.5" />
          <rect x="106" y="46" width="90" height="68" fill="#111216" />
          <circle cx="151" cy="80" r="22" fill="#ff3b1d" />
          <rect x="204" y="46" width="90" height="12" fill="#0052ff" />
          <rect x="204" y="66" width="64" height="6" fill="#4e5361" />
          <rect x="204" y="78" width="76" height="6" fill="#4e5361" />
          <rect x="204" y="90" width="48" height="6" fill="#4e5361" />
          <line x1="106" y1="128" x2="294" y2="128" stroke="#111216" strokeWidth="1.5" />
          <rect x="106" y="138" width="58" height="54" fill="#c8ff29" stroke={primaryInk} />
          <rect x="171" y="138" width="58" height="54" fill="#111216" />
          <rect x="236" y="138" width="58" height="24" fill="#0052ff" />
          <rect x="236" y="168" width="58" height="24" fill="#ff3b1d" />
        </svg>
      );

    case "arcade":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <circle cx="200" cy="86" r="28" fill="#c8ff29" stroke={primaryInk} strokeWidth="1.4" />
          <line x1="20" y1="106" x2="380" y2="106" stroke={primaryInk} strokeWidth="1.8" />
          <path
            d="M175 106 L65 224 M225 106 L335 224 M192 106 L152 224 M208 106 L248 224"
            stroke="#0052ff"
            strokeWidth="1.2"
          />
          <line x1="88" y1="142" x2="312" y2="142" stroke="#111216" strokeOpacity="0.35" />
          <line x1="60" y1="176" x2="340" y2="176" stroke="#111216" strokeOpacity="0.45" />
          <rect x="176" y="156" width="48" height="22" fill="#ff3b1d" stroke={primaryInk} strokeWidth="1.4" />
          <rect x="184" y="148" width="32" height="10" fill="#ffffff" stroke={primaryInk} strokeWidth="1.2" />
          <rect x="168" y="164" width="8" height="16" fill="#111216" />
          <rect x="224" y="164" width="8" height="16" fill="#111216" />
          <path d="M158 106 L158 74 L242 74 L242 106" fill="none" stroke="#0052ff" strokeWidth="2.2" />
          <text x="172" y="68" fill="#111216" fontSize="8" fontWeight="bold" fontFamily="monospace">
            LAP 02 // +0.18s
          </text>
        </svg>
      );

    case "physics":
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <line x1="120" y1="92" x2="200" y2="132" stroke="#111216" strokeWidth="1.4" />
          <line x1="200" y1="132" x2="275" y2="88" stroke="#111216" strokeWidth="1.4" />
          <line x1="200" y1="132" x2="232" y2="188" stroke="#0052ff" strokeWidth="1.4" />
          <circle cx="120" cy="92" r="22" fill="#c8ff29" stroke={primaryInk} strokeWidth="1.5" />
          <circle cx="275" cy="88" r="18" fill="#0052ff" stroke={primaryInk} strokeWidth="1.5" />
          <rect
            x="178"
            y="110"
            width="44"
            height="44"
            transform="rotate(14 200 132)"
            fill="#ff3b1d"
            stroke={primaryInk}
            strokeWidth="1.5"
          />
          <circle cx="232" cy="188" r="14" fill="#ffffff" stroke={primaryInk} strokeWidth="1.5" />
          <line x1="200" y1="132" x2="262" y2="162" stroke="#111216" strokeWidth="1.6" />
          <circle cx="262" cy="162" r="3.5" fill="#111216" />
        </svg>
      );

    case "synth":
    default:
      return (
        <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden="true">
          <line x1="28" y1="125" x2="372" y2="125" stroke="#c6c1b4" strokeWidth="1.2" />
          <path
            d="M28 125 Q68 56 108 125 T188 125 T268 125 T348 125 L372 125"
            fill="none"
            stroke={accentColor}
            strokeWidth="2.4"
          />
          <path
            d="M28 125 Q48 178 68 125 T108 125 T148 125 T188 125 T228 125 T268 125 T308 125 T348 125"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1.4"
          />
          {Array.from({ length: 12 }).map((_, idx) => {
            const active = idx % 3 === 0 || idx === 5 || idx === 10;
            return (
              <rect
                key={idx}
                x={44 + idx * 26}
                y={184}
                width="18"
                height="11"
                fill={active ? "#c8ff29" : "#ffffff"}
                stroke={primaryInk}
                strokeWidth="1.1"
              />
            );
          })}
        </svg>
      );
  }
}

export function SkillVisualBanner({ skill, tall = false }: SkillVisualBannerProps) {
  const surface = SCENE_SURFACES[skill.scene.sceneType] ?? "#f7f5ee";
  const galleryCount = skill.galleryImages?.length ?? 0;

  return (
    <div
      style={{ backgroundColor: surface }}
      className={`group/monitor relative w-full overflow-hidden border-b border-[#111216]/20 ${
        tall ? "h-[300px] sm:h-[360px]" : "aspect-[16/10]"
      }`}
    >
      {skill.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={skill.coverImage}
          alt={skill.title}
          loading="lazy"
          className="relative z-10 h-full w-full object-cover object-top transition-transform duration-500 group-hover/monitor:scale-[1.03]"
        />
      ) : (
        <>
          <div className="blueprint-dots pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative z-10 h-full w-full transition-transform duration-500 group-hover/monitor:scale-[1.03]">
            <SceneArtwork skill={skill} />
          </div>
        </>
      )}

      {/* Minimal Corner Stamps over Real Artwork */}
      <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-20 flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 max-w-[58%] items-center gap-1.5 truncate rounded-[2px] border border-[#111216]/35 bg-[#111216]/82 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wide text-white backdrop-blur-xs">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              skill.coverImage ? "bg-[#c8ff29]" : "bg-[#ff3b1d]"
            }`}
          />
          <span className="truncate">{skill.repo}</span>
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          {galleryCount > 1 && (
            <span className="whitespace-nowrap rounded-[2px] border border-[#111216] bg-white/92 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#111216] shadow-[1px_1px_0_#111216]">
              {galleryCount} 图实拍
            </span>
          )}
          <span
            className={`whitespace-nowrap rounded-[2px] border border-[#111216] px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-widest uppercase shadow-[1.5px_1.5px_0_#111216] ${
              skill.free
                ? "bg-[#c8ff29] text-[#111216]"
                : "bg-[#0052ff] text-white"
            }`}
          >
            {skill.free ? "FREE" : "PRO"}
          </span>
        </div>
      </div>

      {!skill.coverImage && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 border-t border-[#111216]/15 bg-white/88 px-3 py-1.5 backdrop-blur-xs">
          <span className="truncate font-mono text-[9px] font-medium text-[#4e5361]">
            {skill.scene.caption}
          </span>
          <span className="shrink-0 font-mono text-[9px] font-bold text-[#111216]">
            {skill.scene.hudRight}
          </span>
        </div>
      )}
    </div>
  );
}
