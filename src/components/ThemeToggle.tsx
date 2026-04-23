// "use client";
// import { useTheme } from "@/context/ThemeContext";
// import { Sun, Moon } from "lucide-react";

// export function ThemeToggle() {
//   const { theme, toggleTheme } = useTheme();
//   return (
//     <button
//       aria-label="Toggle theme"
//       onClick={toggleTheme}
//       className="p-2 rounded-lg border border-white/10 bg-card/70 hover:bg-card/90 transition flex items-center gap-2"
//       title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
//     >
//       {theme === "dark" ? (
//         <Sun className="h-5 w-5 text-yellow-400" />
//       ) : (
//         <Moon className="h-5 w-5 text-blue-600" />
//       )}
//       <span className="hidden md:inline text-sm font-medium">
//         {theme === "dark" ? "Light Mode" : "Dark Mode"}
//       </span>
//     </button>
//   );
// }



"use client";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 👈 FIX

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-white/10 bg-card/70 hover:bg-card/90 transition flex items-center gap-2"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-blue-600" />
      )}
      <span className="hidden md:inline text-sm font-medium">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}