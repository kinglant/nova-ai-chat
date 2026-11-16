import { Sparkles } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <span
        className={`${box} inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm`}
      >
        <Sparkles size={size === "sm" ? 14 : 16} />
      </span>
      <span className={size === "sm" ? "text-base" : "text-lg"}>Nova AI</span>
    </span>
  );
}
