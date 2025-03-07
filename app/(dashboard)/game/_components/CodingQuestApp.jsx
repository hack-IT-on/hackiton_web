"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "./CodeEditor";
import { GameSidebar } from "./GameSidebar";
import { LevelManager } from "./LevelManager";
import { StoryMode } from "./StoryMode";

// Game context to manage global state
export const GameContext = React.createContext();

const CodingQuestApp = () => {
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    xp: 0,
    unlockedChallenges: ["intro"],
    character: {
      name: "CodeWarrior",
      avatar: "default",
      skills: [],
    },
  });

  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [gameMode, setGameMode] = useState("challenges");

  const updatePlayerProgress = (points, newSkills = []) => {
    setPlayerStats((prev) => ({
      ...prev,
      xp: prev.xp + points,
      level: Math.floor(prev.xp / 100) + 1,
      character: {
        ...prev.character,
        skills: [...new Set([...prev.character.skills, ...newSkills])],
      },
    }));
  };

  return (
    <GameContext.Provider
      value={{
        playerStats,
        updatePlayerProgress,
        setCurrentChallenge,
      }}
    >
      <div className="flex h-screen bg-[#0a192f] text-white">
        <GameSidebar playerStats={playerStats} setGameMode={setGameMode} />

        <main className="flex-grow p-4 overflow-auto">
          <Tabs value={gameMode} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-[#112240]">
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="story">Story Mode</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="challenges">
              <LevelManager />
              {currentChallenge && <CodeEditor challenge={currentChallenge} />}
            </TabsContent>

            <TabsContent value="story">
              <StoryMode />
            </TabsContent>

            <TabsContent value="profile">
              <Card className="bg-[#112240]">
                <CardHeader>
                  <CardTitle>CodeWarrior Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>Level: {playerStats.level}</p>
                    <p>Total XP: {playerStats.xp}</p>
                    <p>
                      Unlocked Skills: {playerStats.character.skills.join(", ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </GameContext.Provider>
  );
};

export default CodingQuestApp;
