"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "dark";
    setTheme(saved);
    setReady(true);
  }, []);

  const apply = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(t === "light" ? "theme-light" : "theme-dark");
    localStorage.setItem("theme", t);
    setTheme(t);
  };

  if (!ready) return null;

  return (
    <button className="btn" type="button" onClick={() => apply(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
