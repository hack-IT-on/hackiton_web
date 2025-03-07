import React, { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameContext } from "./CodingQuestApp";

// Challenge Data Structure
const CHALLENGES = [
  {
    id: "intro-loops",
    title: "Loop Master: Array Sum",
    description:
      "Write a function that calculates the sum of all numbers in an array using a loop.",
    skillUnlocked: "for-loops",
    xpReward: 50,
    difficulty: "beginner",
    initialCode: `function sumArray(arr) {
  // Your code here
}`,
    testCases: [
      {
        inputs: [[1, 2, 3, 4, 5]],
        expectedOutput: 15,
      },
      {
        inputs: [[10, 20, 30]],
        expectedOutput: 60,
      },
    ],
  },
  {
    id: "conditionals-basics",
    title: "Conditional Conqueror",
    description: "Create a function that checks if a number is even or odd.",
    skillUnlocked: "conditionals",
    xpReward: 75,
    difficulty: "beginner",
    initialCode: `function isEvenOrOdd(num) {
  // Your code here
}`,
    testCases: [
      {
        inputs: [4],
        expectedOutput: "even",
      },
      {
        inputs: [7],
        expectedOutput: "odd",
      },
    ],
  },
];

export const LevelManager = () => {
  const { playerStats, setCurrentChallenge } = useContext(GameContext);
  const [availableChallenges, setAvailableChallenges] = useState(
    CHALLENGES.filter(
      (challenge) =>
        challenge.difficulty === "beginner" ||
        playerStats.level >= CHALLENGE_LEVEL_REQUIREMENTS[challenge.id]
    )
  );

  const CHALLENGE_LEVEL_REQUIREMENTS = {
    "intro-loops": 1,
    "conditionals-basics": 2,
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {availableChallenges.map((challenge) => (
        <Card
          key={challenge.id}
          className="bg-[#112240] hover:bg-[#1d2e4a] transition-colors"
        >
          <CardHeader>
            <CardTitle>{challenge.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-300">{challenge.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-400">
                XP: {challenge.xpReward}
              </span>
              <Button
                onClick={() => setCurrentChallenge(challenge)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
