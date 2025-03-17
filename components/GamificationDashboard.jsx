"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Coins, Award, Target, User } from "lucide-react";
import Link from "next/link";

const GamificationDashboard = ({ logedUser }) => {
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all-time");
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userEntryRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    fetchLeaderboard();
    // fetchDailyChallenge();
  }, [leaderboardPeriod]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user-data");
      const data = await response.json();
      setCoins(data.code_coins || 0);
      setPoints(data.total_points || 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/leaderboard?period=${leaderboardPeriod}`
      );
      const data = await response.json();

      if (data && typeof data === "object") {
        const leaderboardArray = Array.isArray(data)
          ? data
          : data.users && Array.isArray(data.users)
          ? data.users
          : [];

        setLeaderboard(leaderboardArray);
      } else {
        console.warn("Unexpected leaderboard data format:", data);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard data");
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  function getIndex(index) {
    if (index === 1) return <span className="font-semibold">🥇{index}</span>;
    else if (index === 2)
      return <span className="font-semibold">🥈{index}</span>;
    else if (index === 3)
      return <span className="font-semibold">🥉{index}</span>;
    else return <span className="font-semibold">{index}</span>;
  }

  const scrollToUser = () => {
    if (userEntryRef.current) {
      userEntryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Flash animation effect
      userEntryRef.current.classList.add(
        "bg-primary-100",
        "transition-colors",
        "duration-500"
      );
      setTimeout(() => {
        userEntryRef.current.classList.remove("bg-primary-100");
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Find user's position in leaderboard
  const userPosition = Array.isArray(leaderboard)
    ? leaderboard.findIndex((user) => user?.id === logedUser?.id)
    : -1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Stats Cards */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Your Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span className="text-3xl font-bold">{points}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your total achievement points
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Coins className="h-8 w-8 text-amber-500" />
            <span className="text-3xl font-bold">{coins}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Currency for store rewards
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Your Rank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-indigo-500" />
            <span className="text-3xl font-bold">
              {userPosition !== -1 ? userPosition + 1 : "N/A"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your position on the leaderboard
          </p>
        </CardContent>
      </Card>

      {/* Leaderboard Card */}
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                className="p-2 border rounded bg-background"
                value={leaderboardPeriod}
                onChange={(e) => setLeaderboardPeriod(e.target.value)}
              >
                <option value="all-time">All Time</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
              <Button
                onClick={scrollToUser}
                variant="outline"
                className="flex items-center gap-2"
                disabled={userPosition === -1}
              >
                <User className="h-4 w-4" />
                Show Me
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-4 text-red-500">{error}</div>
          )}

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <div
                  key={index}
                  ref={user?.id === logedUser?.id ? userEntryRef : null}
                  className={`flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${
                    user?.id === logedUser?.id
                      ? "bg-primary/10 border-l-4 border-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 text-center">{getIndex(index + 1)}</div>
                    <div className="font-medium">
                      <Link href={`user-profile/${user?.id}`}>
                        {user?.name || "Unknown User"}
                      </Link>
                      {user?.id === logedUser?.id && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>{user?.total_points || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1 min-w-16 text-right">
                      <Award className="h-4 w-4 text-indigo-500" />
                      <span>{user?.badge_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {loading
                  ? "Loading..."
                  : "No data available for this time period"}
                <div className="mt-2 text-sm">
                  {leaderboard && JSON.stringify(leaderboard).substring(0, 100)}
                  {leaderboard && JSON.stringify(leaderboard).length > 100
                    ? "..."
                    : ""}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationDashboard;
