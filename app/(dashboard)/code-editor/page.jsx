"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CodeEditorPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

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

  return (
    <div className="min-h-screen ">
      <Card className="max-w-[1400px] mx-auto">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Compiler</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? "Light" : "Dark"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
              className="flex items-center gap-1"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button> */}
          </div>
        </div>

        <CardContent className="p-0 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background z-10 flex items-center justify-center">
              <div className="space-y-4 w-full px-8">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
              </div>
            </div>
          )}
          <iframe
            className="w-full h-[calc(100vh-12rem)] min-h-[700px]"
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
