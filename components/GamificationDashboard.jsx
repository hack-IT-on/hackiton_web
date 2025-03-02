import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const GamificationDashboard = () => {
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all-time");
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchLeaderboard();
    // fetchDailyChallenge();
  }, [leaderboardPeriod]);

  const fetchUserData = async () => {
    const response = await fetch("/api/user-data");
    const data = await response.json();
    console.log(data.code_coins);
    setCoins(data.code_coins);
    setPoints(data.total_points);
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    const response = await fetch(
      `/api/leaderboard?period=${leaderboardPeriod}`
    );
    const data = await response.json();
    setLeaderboard(data);
    setLoading(false);
  };

  function getIndex(index) {
    if (index === 1) return <span className="font-semibold">🥇 {index}.</span>;
    else if (index === 2)
      return <span className="font-semibold">🥈 {index}.</span>;
    else if (index === 3)
      return <span className="font-semibold">🥉 {index}.</span>;
    else return <span className="font-semibold">{index}.</span>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      {/* Leaderboard Card */}
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Leaderboard</CardTitle>
            <select
              className="p-2 border rounded"
              value={leaderboardPeriod}
              onChange={(e) => setLeaderboardPeriod(e.target.value)}
            >
              <option value="all-time">All Time</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-500 rounded"
              >
                <div className="flex items-center space-x-2">
                  {getIndex(index + 1)}
                  <span>{user?.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{user?.total_points} pts</span>
                  <span>{user?.badge_count} 🏆</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationDashboard;
