import type { LucideIcon } from "lucide-react";
import { Brush, Camera, Clapperboard, Music4, PenTool } from "lucide-react";

export type ArtType = "painting" | "music" | "writing" | "photography" | "video";

export interface ArtMeta {
  key: ArtType;
  ar: string;
  /** identity color of the art branch */
  color: string;
  /** very soft tint used for chips / glows */
  soft: string;
  Icon: LucideIcon;
  tagline: string;
}

export const ART_TYPES: ArtMeta[] = [
  {
    key: "painting",
    ar: "الرسم",
    color: "#E0698B",
    soft: "rgba(224,105,139,0.14)",
    Icon: Brush,
    tagline: "لوحات وألوان مائية وضربات فرشاة حرّة",
  },
  {
    key: "music",
    ar: "الموسيقى",
    color: "#35BEB2",
    soft: "rgba(53,190,178,0.14)",
    Icon: Music4,
    tagline: "مقاطع صوتية، مقامات، وتوزيعات أصلية",
  },
  {
    key: "writing",
    ar: "الكتابة",
    color: "#D9A648",
    soft: "rgba(217,166,72,0.15)",
    Icon: PenTool,
    tagline: "قصص، قصائد، ونصوص بلاغة مصقولة",
  },
  {
    key: "photography",
    ar: "التصوير",
    color: "#6F9BD1",
    soft: "rgba(111,155,209,0.14)",
    Icon: Camera,
    tagline: "لقطات سينمائية وضوء يُروى كقصة",
  },
  {
    key: "video",
    ar: "الفيديو",
    color: "#9B7ED8",
    soft: "rgba(155,126,216,0.14)",
    Icon: Clapperboard,
    tagline: "أفلام قصيرة ومونتاج يحبس الأنفاس",
  },
];

const fallback = ART_TYPES[2];

export function artMeta(type: string | null | undefined): ArtMeta {
  return ART_TYPES.find((t) => t.key === type) ?? fallback;
}

export type Level = "beginner" | "intermediate" | "advanced";

export const LEVELS: { key: Level; ar: string; rank: number; color: string }[] = [
  { key: "beginner", ar: "مبتدئ", rank: 1, color: "#8FBF9F" },
  { key: "intermediate", ar: "متوسط", rank: 2, color: "#D9A648" },
  { key: "advanced", ar: "متقدم", rank: 3, color: "#E0698B" },
];

export function levelMeta(level: string | null | undefined) {
  return LEVELS.find((l) => l.key === level) ?? LEVELS[0];
}

export function levelFromScore(score: number): Level {
  if (score >= 80) return "advanced";
  if (score >= 60) return "intermediate";
  return "beginner";
}
