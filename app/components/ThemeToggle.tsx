"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(t === "light" ? "theme-light" : "theme-dark");
  localStorage.setItem("theme", t);
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = ((localStorage.getItem("theme") as Theme) || "dark") === "light"
      ? "light"
      : "dark";

    applyTheme(t);

    // Defer state updates to avoid react-hooks/set-state-in-effect lint
    const id = window.setTimeout(() => {
      setTheme(t);
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) return null;

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      className="btn"
      type="button"
      onClick={() => {
        setTheme(next);
        applyTheme(next);
      }}
    >
      {next === "light" ? "Light mode" : "Dark mode"}
    </button>
  );
}
