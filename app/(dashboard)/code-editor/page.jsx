"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

const CodeEditorPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only access theme client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  // Determine if we should use dark theme
  const isDark = mounted && theme === "dark";

  return (
    <div className="min-h-screen w-full p-2 md:p-0">
      <Card className="w-full h-full border-0 md:border shadow-sm rounded-none md:rounded-lg overflow-hidden">
        <div className="h-12 border-b p-2 flex items-center justify-between bg-background/80 backdrop-blur-sm">
          <h1 className="text-lg font-medium px-2">Compiler</h1>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              title="Reset"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-0 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background z-10 flex items-center justify-center">
              <div className="space-y-4 w-full max-w-md px-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          )}
          <iframe
            className="w-full h-[calc(100vh-3rem)] min-h-[800px]"
            src={`https://onecompiler.com/embed?theme=${
              isDark ? "dark" : "light"
            }&hideTitle=true`}
            frameBorder="0"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditorPage;
