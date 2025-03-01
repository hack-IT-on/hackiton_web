"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md">
      <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
    </div>
  ),
});

export default function CodeEditor({ code, onChange }) {
  const editorRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  // Handle editor mounting
  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  // Set up theme detection
  useEffect(() => {
    setMounted(true);

    // Check for dark mode
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(isDarkMode ? "vs-dark" : "light");

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setTheme(e.matches ? "vs-dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!mounted) return null;

  return (
    <div className="border rounded-md dark:border-gray-700 overflow-hidden">
      <MonacoEditor
        height="400px"
        width="100%"
        language="javascript"
        theme={theme}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          wordWrap: "on",
          padding: { top: 10 },
        }}
      />
    </div>
  );
}
