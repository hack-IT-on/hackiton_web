"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Github,
  Star,
  Code2,
  Timer,
  Medal,
  CheckCircle2,
  User,
  Building2,
  MapPin,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DIFFICULTY_COLORS = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};

const PIE_COLORS = ["#22c55e", "#eab308", "#ef4444"];

const formatDate = (timestamp) => {
  // Create a Date object from the timestamp
  const date = new Date(timestamp * 1000);

  // Use fixed date format that will be consistent between server and client
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Return in YYYY-MM-DD format to ensure consistency
  return `${year}-${month}-${day}`;
};

export default function LeetcodeProfile({ data }) {
  const { matchedUser, allQuestionsCount, recentSubmissionList } = data;
  const { profile, submitStats, contributions, githubUrl, submissionCalendar } =
    matchedUser;

  const totalSolved = submitStats.acSubmissionNum[0].count;
  const totalQuestions = allQuestionsCount[0].count;
  const solvedPercentage = ((totalSolved / totalQuestions) * 100).toFixed(1);

  const pieData = submitStats.acSubmissionNum.slice(1).map((item, index) => ({
    name: allQuestionsCount[index + 1].difficulty,
    value: item.count,
    total: allQuestionsCount[index + 1].count,
  }));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage src={profile?.userAvatar} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {profile?.realName}
                  {profile?.ranking && (
                    <Badge variant="secondary">Rank #{profile?.ranking}</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground">
                  @{matchedUser?.username}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {profile?.company && (
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Building2 className="w-4 h-4" />
                    <span>{profile?.company}</span>
                  </div>
                )}
                {profile?.countryName && (
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <MapPin className="w-4 h-4" />
                    <span>{profile?.countryName}</span>
                  </div>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
              {profile?.skillTags && profile?.skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile?.skillTags.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Solved
                </p>
                <h2 className="text-2xl font-bold mt-2">{totalSolved}</h2>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={parseFloat(solvedPercentage)} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              {solvedPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contribution Points
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {contributions?.points}
                </h2>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Questions: {contributions?.questionCount}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Test cases: {contributions?.testcaseCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Achievements
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {matchedUser?.badges.length}
                </h2>
              </div>
              <Medal className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4">
              {matchedUser?.badges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No badges yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedUser?.badges.map((badge, index) => (
                    <Badge key={index} variant="outline">
                      {badge?.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Activity
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {recentSubmissionList?.length}
                </h2>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
            {recentSubmissionList?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm">
                  Last solved: {recentSubmissionList[0]?.title}
                </p>
                <Badge variant="outline" className="mt-2">
                  {recentSubmissionList[0]?.lang}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Problem Solving Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>
              Problems solved by difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} / ${
                        pieData[name === "Easy" ? 0 : name === "Medium" ? 1 : 2]
                          .total
                      }`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
            <CardDescription>Detailed breakdown of submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {submitStats?.acSubmissionNum.slice(1).map((item, index) => {
                const total = allQuestionsCount[index + 1].count;
                const solved = item.count;
                const percentage = ((solved / total) * 100).toFixed(1);
                const difficulty = allQuestionsCount[index + 1].difficulty;

                return (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={DIFFICULTY_COLORS[difficulty]}>
                          {difficulty}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm">
                                {solved} / {total}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {percentage}% completed
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                    <Progress
                      value={parseFloat(percentage)}
                      className="h-2"
                      style={{
                        background: "rgba(var(--primary), 0.2)",
                      }}
                    />
                  </div>
                );
              })}

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium mb-4">Recent Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(recentSubmissionList.map((sub) => sub.lang))
                  ).map((lang) => (
                    <Badge key={lang} variant="outline" className="px-3 py-1">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Your latest problem-solving activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSubmissionList?.slice(0, 5).map((submission, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{submission.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {submission.lang}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(submission.timestamp)}
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    DIFFICULTY_COLORS[submission.difficulty] + " capitalize"
                  }
                >
                  {submission.difficulty}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
