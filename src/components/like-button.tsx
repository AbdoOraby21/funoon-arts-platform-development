"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "@/actions/artwork";
import { artMeta } from "@/lib/art";
import { cn } from "@/lib/utils";

export default function LikeButton({
  artworkId,
  initialLiked,
  initialCount,
  authed,
  activeColor,
  big = false,
}: {
  artworkId: string;
  initialLiked: boolean;
  initialCount: number;
  authed: boolean;
  activeColor?: string;
  big?: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const color = activeColor ?? "#E0698B";

  const onClick = async () => {
    if (!authed) {
      router.push("/login");
      return;
    }
    if (pending) return;
    setPending(true);
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await toggleLikeAction(artworkId);
      if (res.authed) {
        setLiked(res.liked);
        setCount(res.count);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "إلغاء الإعجاب" : "أعجبني"}
      title={liked ? "إلغاء الإعجاب" : "أعجبني"}
      className={cn(
        "inline-flex items-center gap-1.5 transition-all",
        big
          ? "btn"
          : "text-xs text-sand hover:text-paper",
        big && (liked ? "" : "btn-ghost"),
      )}
      style={
        big
          ? liked
            ? { background: color, color: "#14100b", borderColor: color }
            : undefined
          : liked
            ? { color }
            : undefined
      }
    >
      <Heart
        size={big ? 17 : 15}
        strokeWidth={2.2}
        fill={liked ? "currentColor" : "none"}
        className={cn("transition-transform", pending && "scale-125")}
      />
      <span className={cn(big && "font-bold")}>{count}</span>
    </button>
  );
}

export { artMeta };
