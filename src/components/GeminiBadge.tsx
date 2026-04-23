import { Sparkles } from "lucide-react";

interface GeminiBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function GeminiBadge({ size = "sm", className = "" }: GeminiBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-3 py-1 gap-1.5",
    md: "text-sm px-4 py-1.5 gap-2",
  };

  const iconSize = size === "sm" ? 12 : 14;

  return (
    <div
      className={`group relative inline-flex items-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300 cursor-default ${sizeClasses[size]} ${className}`}
      title="This analysis is powered by Google's Gemini AI model"
    >
      <Sparkles size={iconSize} className="text-purple-400 group-hover:animate-pulse" />
      <span>Powered by Google Gemini AI</span>
    </div>
  );
}
