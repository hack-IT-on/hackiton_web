import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const GameSidebar = ({ playerStats, setGameMode }) => {
  const calculateLevelProgress = () => {
    return ((playerStats.xp % 100) * 100) / 100;
  };

  return (
    <aside className="w-64 bg-[#112240] p-4 border-r border-gray-800">
      <Card className="bg-[#0a192f] mb-4">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar>
            <AvatarImage src="/avatar-placeholder.png" />
            <AvatarFallback>CW</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold">{playerStats.character.name}</h2>
            <p className="text-sm text-gray-400">Level {playerStats.level}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <p className="text-sm mb-1">XP Progress</p>
            <Progress value={calculateLevelProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <nav className="space-y-2">
        <button
          onClick={() => setGameMode("challenges")}
          className="w-full text-left p-2 hover:bg-[#1d2e4a] rounded"
        >
          🧩 Coding Challenges
        </button>
        <button
          onClick={() => setGameMode("story")}
          className="w-full text-left p-2 hover:bg-[#1d2e4a] rounded"
        >
          📖 Story Mode
        </button>
        <button
          onClick={() => setGameMode("profile")}
          className="w-full text-left p-2 hover:bg-[#1d2e4a] rounded"
        >
          👤 Profile
        </button>
      </nav>
    </aside>
  );
};
