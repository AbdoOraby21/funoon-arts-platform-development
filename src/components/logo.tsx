export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5" dir="rtl">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        {/* ضربة فرشاة ذهبية فوق خماسية ألوان الفنون */}
        <path
          d="M8 33c7-2 10-9 15-10 6-1.4 9 2 16-3"
          stroke="#d9a648"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="14" r="4.4" fill="#E0698B" />
        <circle cx="24" cy="10" r="4.4" fill="#35BEB2" />
        <circle cx="36" cy="15" r="4.4" fill="#6F9BD1" />
        <path d="M40 28l4 6h-8l4-6z" fill="#9B7ED8" />
      </svg>
      <span className="title-display text-2xl leading-none text-paper">
        فُنون<span className="text-gold">.</span>
      </span>
    </span>
  );
}
