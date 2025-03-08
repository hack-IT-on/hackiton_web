"use client";
import React, { useState, useEffect } from "react";
import {
  Code,
  GitCompareArrows,
  BugPlay,
  Trophy,
  CreditCard,
  Gem,
  Wallet,
  Loader2,
  Timer,
  Puzzle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const toolSections = [
  {
    title: "Development Tools",
    tools: [
      {
        name: "Online Compiler",
        icon: Code,
        href: "/code-editor",
        color: "blue",
        description: "Write and run code instantly",
      },
      {
        name: "Algorithm Visualizer",
        icon: GitCompareArrows,
        href: "/algorithm-visualizer",
        color: "purple",
        description: "Explore algorithm mechanics",
      },
      {
        name: "Time Complexity Calculator (Beta)",
        icon: Timer,
        href: "/time-complexity-calculator",
        color: "orange",
        description:
          "Just insert your code and instantly get its time complexity.",
      },
      {
        name: "Block Code",
        icon: Puzzle,
        href: "/code-blocks",
        color: "pink",
        description: "Build blocks, generate code!",
      },
    ],
  },
  {
    title: "Learning Resources",
    tools: [
      {
        name: "Coding Problems",
        icon: BugPlay,
        href: "/problems",
        color: "green",
        description: "Practice coding challenges",
      },
      {
        name: "Leaderboard",
        icon: Trophy,
        href: "/leaderboard",
        color: "orange",
        description: "Track your progress",
      },
    ],
  },
  {
    title: "Personal Hub",
    tools: [
      {
        name: "Event Certificates",
        icon: CreditCard,
        href: "/events/certificates/generate",
        color: "orange",
        description: "Manage your achievements",
      },
      {
        name: "Resource Hub",
        icon: Gem,
        href: "/resource-hub",
        color: "green",
        description: "Access learning materials",
      },
      {
        name: "My Purchases",
        icon: Wallet,
        href: "/my-purchases",
        color: "purple",
        description: "View your transactions",
      },
    ],
  },
];

const ProfileToolsComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <CardContent className="text-center space-y-4">
          <div className="text-red-500 text-xl">Failed to load tools</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 ">
          Developer Tools & Resources
        </h2>

        <Tabs defaultValue="tools" className="space-y-6">
          {/* <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList> */}

          <TabsContent value="tools">
            {toolSections.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className="text-xl font-semibold mb-4 ">{section.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {section.tools.map((tool) => (
                    <Link key={tool.name} href={tool.href} className="block">
                      <Card
                        className={` transition-all duration-300 
                        hover:scale-105 hover:border-${tool.color}-200`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <tool.icon
                              className={`h-6 w-6 text-${tool.color}-600`}
                            />
                          </div>
                          <p
                            className={`text-sm font-medium text-${tool.color}-600`}
                          >
                            {tool.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {tool.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center text-gray-500">
              No favorite tools yet. Start exploring!
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileToolsComponent;
