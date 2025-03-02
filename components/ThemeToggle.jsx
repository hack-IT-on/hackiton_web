"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-background border-border hover:bg-muted"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Light</span>
                {theme === "light" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Active
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Moon className="h-4 w-4 text-blue-400" />
                <span>Dark</span>
                {theme === "dark" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Active
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Monitor className="h-4 w-4 text-green-500" />
                <span>System</span>
                {theme === "system" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Active
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
