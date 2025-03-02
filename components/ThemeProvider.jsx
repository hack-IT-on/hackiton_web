"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect } from "react";

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false);

  // Only render the children after the component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{props.defaultTheme === "dark" ? null : null}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
