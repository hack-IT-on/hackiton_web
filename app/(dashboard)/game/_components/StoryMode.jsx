import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StoryMode = () => {
  return (
    <Card className="bg-[#112240]">
      <CardHeader>
        <CardTitle>CyberCode: The Digital Frontier</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-gray-300">
          <p>
            Welcome, CodeWarrior! In the neon-lit metropolis of NeuroSync, your
            coding skills are the key to survival. Corrupt corporations have
            locked down critical systems, and only a true programmer can break
            through their defenses.
          </p>
          <p>
            Each challenge you complete brings you closer to exposing the truth
            and liberating the city's digital infrastructure.
          </p>
          <div className="bg-[#0a192f] p-4 rounded">
            <h3 className="text-xl font-bold mb-2">Current Mission</h3>
            <p>
              Hack the MainFrame: Decrypt the first layer of corporate firewalls
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
