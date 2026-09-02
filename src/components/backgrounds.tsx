import type { ReactNode } from "react";
import type { ArtType } from "@/lib/art";
import { cn } from "@/lib/utils";

/**
 * خلفيات رسومية مصمّمة يدويًا بـ SVG لكل نوع فن — بدون أي صور خارجية أو تدرجات.
 * كل شكل مبني بمسارات Framer art تتحرك ببطء عبر CSS keyframes.
 */

/* --------------------------------- الرسم --------------------------------- */
export function PaintBg({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* بقع مائية كبيرة باهتة */}
      <g className="anim-drift" style={{ animationDuration: "30s" }}>
        <ellipse cx="1130" cy="150" rx="300" ry="170" fill="#E0698B" opacity="0.07" />
        <ellipse cx="180" cy="640" rx="360" ry="200" fill="#d9a648" opacity="0.05" />
      </g>
      {/* ضربة فرشاة عريضة */}
      <g className="anim-float" style={{ animationDuration: "9s" }}>
        <path
          d="M60 560 C 330 470 400 640 640 545 S 1100 420 1390 520"
          stroke="#E0698B"
          strokeWidth="64"
          strokeLinecap="round"
          fill="none"
          opacity="0.14"
        />
        <path
          d="M-40 250 C 260 190 420 330 700 240 S 1160 150 1480 240"
          stroke="#d9a648"
          strokeWidth="40"
          strokeLinecap="round"
          fill="none"
          opacity="0.10"
        />
      </g>
      {/* شعيرات فرشاة رفيعة تُرسم ذاتيًا */}
      <g strokeLinecap="round" fill="none" className="anim-draw" style={{ ["--dash" as never]: 900 }} strokeDasharray="900">
        <path d="M120 120 C 380 60 560 180 820 110" stroke="#E0698B" strokeWidth="7" opacity="0.28" />
        <path d="M620 700 C 860 630 1080 740 1340 660" stroke="#d9a648" strokeWidth="6" opacity="0.22" />
      </g>
      {/* رذاذ طلاء */}
      <g fill="#E0698B" className="anim-breathe">
        <circle cx="1290" cy="120" r="7" opacity="0.4" />
        <circle cx="1240" cy="175" r="4" opacity="0.3" />
        <circle cx="1330" cy="200" r="5" opacity="0.28" />
        <circle cx="160" cy="180" r="6" opacity="0.35" />
        <circle cx="205" cy="140" r="3.5" opacity="0.3" />
      </g>
    </svg>
  );
}

/* -------------------------------- الموسيقى -------------------------------- */
function WavePath({ y, opacity, color }: { y: number; opacity: number; color: string }) {
  return (
    <path
      d={`M-320 ${y} q 40 -34 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
      stroke={color}
      strokeWidth="3.5"
      fill="none"
      opacity={opacity}
      strokeLinecap="round"
    />
  );
}

export function MusicBg({ className }: { className?: string }) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* موجات صوتية تنزلق باستمرار */}
      <g className="anim-wave" style={{ animationDuration: "22s" }}>
        <WavePath y={210} color="#35BEB2" opacity={0.30} />
      </g>
      <g className="anim-wave" style={{ animationDuration: "30s" }}>
        <WavePath y={290} color="#35BEB2" opacity={0.18} />
      </g>
      <g className="anim-wave" style={{ animationDuration: "17s" }}>
        <WavePath y={560} color="#d9a648" opacity={0.14} />
      </g>
      {/* إكولايزر */}
      <g transform="translate(1010,520)">
        {bars.map((i) => (
          <rect
            key={i}
            className="anim-eq"
            style={{ animationDelay: `${(i % 5) * 0.22}s`, animationDuration: `${1.4 + (i % 3) * 0.35}s` }}
            x={i * 34}
            y={-90}
            width="14"
            height="90"
            rx="7"
            fill="#35BEB2"
            opacity={0.24}
          />
        ))}
      </g>
      {/* أسطوانة تدور */}
      <g className="anim-spin-slow" style={{ transformOrigin: "230px 560px" }}>
        <circle cx="230" cy="560" r="120" fill="none" stroke="#35BEB2" strokeWidth="2.5" opacity="0.22" />
        <circle cx="230" cy="560" r="86" fill="none" stroke="#35BEB2" strokeWidth="2" opacity="0.16" />
        <circle cx="230" cy="560" r="52" fill="none" stroke="#d9a648" strokeWidth="2" opacity="0.2" />
        <circle cx="230" cy="560" r="10" fill="#35BEB2" opacity="0.3" />
        <path d="M230 452 v216 M122 560 h216" stroke="#35BEB2" strokeWidth="1.2" opacity="0.12" />
      </g>
      {/* علامات موسيقية باهتة */}
      <g fill="#35BEB2" opacity="0.16" className="anim-float" style={{ animationDuration: "8s" }}>
        <text x="640" y="150" fontSize="92" fontFamily="serif">♪</text>
        <text x="1280" y="330" fontSize="64" fontFamily="serif">♫</text>
      </g>
    </svg>
  );
}

/* -------------------------------- الكتابة -------------------------------- */
export function WritingBg({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* حروف زخرفية عملاقة شفافة */}
      <g className="anim-breathe" fill="#D9A648" opacity="0.07" fontFamily="'Cairo', sans-serif" fontWeight="900">
        <text x="1050" y="330" fontSize="300">حَرف</text>
        <text x="80" y="700" fontSize="220">قِصّة</text>
      </g>
      {/* خطوط بخط اليد تُرسم ذاتيًا */}
      <g className="anim-draw" style={{ ["--dash" as never]: 760 }} strokeDasharray="760" fill="none" strokeLinecap="round">
        <path
          d="M90 200 q 90 -60 180 -10 t 180 -10 q 60 26 130 6"
          stroke="#D9A648"
          strokeWidth="5"
          opacity="0.3"
        />
        <path d="M760 560 q 110 60 220 10 t 220 20" stroke="#D9A648" strokeWidth="5" opacity="0.26" />
        <path d="M300 430 q 70 36 150 8 t 170 -12" stroke="#E0698B" strokeWidth="4" opacity="0.16" />
      </g>
      {/* نقطة حبر وسطر تحته */}
      <g className="anim-float" style={{ animationDuration: "10s" }}>
        <circle cx="1230" cy="640" r="16" fill="#D9A648" opacity="0.22" />
        <circle cx="1262" cy="664" r="6" fill="#D9A648" opacity="0.18" />
        <rect x="940" y="700" width="340" height="4" rx="2" fill="#D9A648" opacity="0.14" />
        <rect x="990" y="716" width="240" height="4" rx="2" fill="#D9A648" opacity="0.10" />
      </g>
    </svg>
  );
}

/* -------------------------------- التصوير -------------------------------- */
function FilmStripRow({ y, opacity }: { y: number; opacity: number }) {
  const frames = Array.from({ length: 8 });
  const holes = Array.from({ length: 36 });
  return (
    <g opacity={opacity} className="anim-drift" style={{ animationDuration: "34s" }}>
      <rect x="-60" y={y} width="1600" height="120" rx="6" fill="none" stroke="#6F9BD1" strokeWidth="2.5" />
      {frames.map((_, i) => (
        <rect
          key={i}
          x={-40 + i * 205}
          y={y + 16}
          width="180"
          height="88"
          rx="3"
          fill="none"
          stroke="#6F9BD1"
          strokeWidth="2"
        />
      ))}
      {holes.map((_, i) => (
        <rect key={i} x={-50 + i * 46} y={y + 4} width="10" height="8" rx="2" fill="#6F9BD1" />
      ))}
    </g>
  );
}

export function PhotoBg({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <FilmStripRow y={70} opacity={0.10} />
      <FilmStripRow y={620} opacity={0.08} />
      {/* عدسة / غالق */}
      <g className="anim-spin-slow" style={{ transformOrigin: "1190px 420px", animationDuration: "44s" }}>
        <circle cx="1190" cy="420" r="150" fill="none" stroke="#6F9BD1" strokeWidth="3" opacity="0.24" />
        <circle cx="1190" cy="420" r="104" fill="none" stroke="#6F9BD1" strokeWidth="2" opacity="0.16" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="1180" y="292" width="20" height="70" rx="6" fill="#6F9BD1" opacity="0.12"
            transform={`rotate(${deg} 1190 420)`}
          />
        ))}
      </g>
      {/* علامات تركيز */}
      <g stroke="#6F9BD1" strokeWidth="3" opacity="0.3" strokeLinecap="round">
        <path d="M180 300 h46 M203 277 v46" />
        <path d="M180 520 h46 M203 497 v46" />
        <path d="M520 640 h46 M543 617 v46" />
      </g>
      <circle cx="380" cy="200" r="90" fill="#6F9BD1" opacity="0.05" className="anim-breathe" />
    </svg>
  );
}

/* -------------------------------- الفيديو -------------------------------- */
export function VideoBg({ className }: { className?: string }) {
  const rows = Array.from({ length: 7 });
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* شريط فيلم عمودي يصعد */}
      <g opacity="0.12">
        <g className="anim-frames" style={{ animationDuration: "18s" }}>
          <rect x="1060" y="-40" width="120" height="900" fill="none" stroke="#9B7ED8" strokeWidth="2.5" />
          {rows.map((_, i) => (
            <rect key={i} x="1074" y={-20 + i * 130} width="92" height="100" rx="4" fill="none" stroke="#9B7ED8" strokeWidth="2" />
          ))}
        </g>
        <g className="anim-frames" style={{ animationDuration: "26s" }}>
          <rect x="180" y="-40" width="120" height="900" fill="none" stroke="#9B7ED8" strokeWidth="2" opacity="0.7" />
          {rows.map((_, i) => (
            <rect key={i} x="194" y={40 + i * 130} width="92" height="100" rx="4" fill="none" stroke="#9B7ED8" strokeWidth="1.6" opacity="0.8" />
          ))}
        </g>
      </g>
      {/* خطوط مسح سينمائية */}
      <g stroke="#9B7ED8" opacity="0.07">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1="0" x2="1440" y1={i * 60 + 8} y2={i * 60 + 8} strokeWidth="1.5" />
        ))}
      </g>
      {/* مثلث تشغيل ضخم باهت */}
      <g className="anim-breathe">
        <path d="M660 300 l150 90 -150 90 z" fill="none" stroke="#9B7ED8" strokeWidth="4" opacity="0.22" strokeLinejoin="round" />
        <circle cx="735" cy="390" r="150" fill="none" stroke="#9B7ED8" strokeWidth="1.6" opacity="0.14" />
      </g>
    </svg>
  );
}

/* ------------------------------ الهيرو العام ------------------------------ */
export function HeroBg({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {/* توهجات حبرية (أشكال مموهة بفلتر SVG — بلا تدرجات) */}
      <svg className="absolute -top-40 start-[-140px] h-[560px] w-[560px] opacity-70 anim-float" viewBox="0 0 400 400">
        <defs>
          <filter id="softA" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>
        <circle cx="200" cy="200" r="150" fill="#d9a648" opacity="0.12" filter="url(#softA)" />
      </svg>
      <svg className="absolute -bottom-48 end-[-160px] h-[620px] w-[620px] opacity-70 anim-float" style={{ animationDelay: "2s" }} viewBox="0 0 400 400">
        <defs>
          <filter id="softB" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="80" />
          </filter>
        </defs>
        <circle cx="200" cy="200" r="150" fill="#35BEB2" opacity="0.09" filter="url(#softB)" />
      </svg>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {/* ضربة فرشاة */}
        <path
          d="M-60 640 C 300 540 520 730 800 610 S 1260 480 1520 600"
          stroke="#E0698B" strokeWidth="46" strokeLinecap="round" fill="none" opacity="0.08"
          className="anim-float"
        />
        {/* موجة موسيقية */}
        <g className="anim-wave" style={{ animationDuration: "26s" }}>
          <path
            d="M-320 190 q 46 -40 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0 t 92 0"
            stroke="#35BEB2" strokeWidth="3" fill="none" opacity="0.14"
          />
        </g>
        {/* كلمة فن عملاقة */}
        <text x="520" y="480" fontSize="430" fontWeight="900" fontFamily="'Cairo', sans-serif" fill="#d9a648" opacity="0.045" className="anim-breathe">
          فَنّ
        </text>
        {/* إطارات فيلم يمين */}
        <g opacity="0.1" className="anim-drift" style={{ animationDuration: "30s" }}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={1140 + i * 10} y={150 + i * 130} width="130" height="92" rx="5" fill="none" stroke={i % 2 ? "#9B7ED8" : "#6F9BD1"} strokeWidth="2.5" />
          ))}
        </g>
        {/* نقاش ملوّن متناثر */}
        <g>
          <circle cx="150" cy="150" r="5" fill="#E0698B" opacity="0.5" className="anim-breathe" />
          <circle cx="1240" cy="760" r="6" fill="#35BEB2" opacity="0.45" className="anim-breathe" style={{ animationDelay: "1s" }} />
          <circle cx="700" cy="90" r="4" fill="#d9a648" opacity="0.5" className="anim-breathe" style={{ animationDelay: "2s" }} />
          <circle cx="1330" cy="330" r="4" fill="#9B7ED8" opacity="0.5" className="anim-breathe" style={{ animationDelay: "0.5s" }} />
        </g>
      </svg>
    </div>
  );
}

/* --------------------------- غلاف قسم موحّد --------------------------- */
const BG_BY_TYPE: Record<ArtType, (p: { className?: string }) => ReactNode> = {
  painting: PaintBg,
  music: MusicBg,
  writing: WritingBg,
  photography: PhotoBg,
  video: VideoBg,
};

export function ArtCanvas({
  type,
  children,
  className,
  innerClassName,
}: {
  type: ArtType;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const Bg = BG_BY_TYPE[type];
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <Bg />
      <div className={cn("relative", innerClassName)}>{children}</div>
    </section>
  );
}
