import { PROJECT_NAME } from "@codejam/common";
import { useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4">
      <h1 className="text-2xl font-semibold text-foreground">{PROJECT_NAME}</h1>
      <button
        onClick={toggleDarkMode}
        className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        {isDark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </header>
  );
}
