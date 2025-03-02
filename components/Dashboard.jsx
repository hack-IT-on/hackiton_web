"use client";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Code,
  Users,
  Calendar,
  MessageSquare,
  Award,
  GitPullRequest,
  Clock,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Timer,
  Flame,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

export default function Dashboard({ user, daily }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState({
    activity: true,
    recentActivity: true,
    allActivity: true,
    events: true,
    appliedEvents: true,
    attendedEvents: true,
    questions: true,
  });
  const [activityCount, setActivityCount] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [allActivity, setAllActivity] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  const [attenedEvents, setAttenedEvents] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [badgeCount, setBadgeCount] = useState([]);
  const [projectCount, setProjectCount] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allActivity.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allActivity.length / itemsPerPage);

  // Pagination controls
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    try {
      fetchProjectCount();
      fetchActivityGraph();
      fetchRecentActivity();
      fetchAllEvents();
      fetchAppliedEvents();
      fetchAttendedEvents();
      fetchQuestionCount();
      fetchAllActivity();
      fetchBadgeCount();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);
  async function fetchActivityGraph() {
    try {
      const response = await fetch("/api/activity");
      const data = await response.json();
      setActivityCount(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  }

  async function fetchBadgeCount() {
    try {
      const response = await fetch("/api/badge/count");
      const data = await response.json();
      setBadgeCount(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, recentActivity: false }));
    }
  }

  async function fetchProjectCount() {
    try {
      const response = await fetch("/api/projects/count");
      const data = await response.json();
      setProjectCount(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, recentActivity: false }));
    }
  }

  async function fetchRecentActivity() {
    try {
      const response = await fetch("/api/activity/recent");
      const data = await response.json();
      setRecentActivity(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, recentActivity: false }));
    }
  }

  async function fetchAllActivity() {
    try {
      const response = await fetch("/api/activity/all");
      const data = await response.json();
      setAllActivity(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, allActivity: false }));
    }
  }

  async function fetchAllEvents() {
    try {
      const response = await fetch("/api/get-events/all");
      const data = await response.json();
      setAllEvents(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  }

  async function fetchAppliedEvents() {
    try {
      const response = await fetch("/api/get-events/applied");
      const data = await response.json();
      setAppliedEvents(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, appliedEvents: false }));
    }
  }

  async function fetchAttendedEvents() {
    try {
      const response = await fetch("/api/get-events/attended");
      const data = await response.json();
      setAttenedEvents(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, attendedEvents: false }));
    }
  }

  async function fetchQuestionCount() {
    try {
      const response = await fetch("/api/questions");
      const data = await response.json();
      setQuestionsCount(data.length);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, questions: false }));
    }
  }

  // console.log(activityCount);
  // console.log(recentActivity);

  const LoadingCard = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const isLoading = Object.values(loading).some(Boolean);

  const ActivityTabContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentItems.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="p-2 bg-muted rounded-full">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.name}</p>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  function format_Date(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  }

  const DailyChallengeAlert = () => {
    const [timeLeft, setTimeLeft] = useState({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const difference = tomorrow - now;

        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
      };

      // Initial calculation
      setTimeLeft(calculateTimeLeft());

      // Update every second
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => {
      return `${String(time.hours).padStart(2, "0")}:${String(
        time.minutes
      ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
    };

    return (
      <Alert className="mb-6 border-l-4 border-l-blue-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>{format_Date(daily.question.challengeQuestion.date)}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Code className="h-5 w-5 " />
          <AlertTitle className="flex items-center gap-2 text-lg">
            <span>Daily Coding Challenge</span>
            {/* <span>
              Hey, {user.name.split(" ")[0]} your today's challenge is here
            </span> */}
            <Trophy className="h-5 w-5 text-yellow-500" />
          </AlertTitle>
        </div>

        <AlertDescription className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {daily.question.title}
                </h3>
                <div className="flex flex-wrap gap-3 items-center text-sm">
                  <Badge variant="outline" className="bg-yellow-100/50">
                    {daily.question.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {daily.question.likes} Likes
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    Time Left: {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <Link
                href={`https://leetcode.com/problems/${daily.question.titleSlug}`}
                className="flex items-center gap-2"
                target="_blank"
              >
                <Button className="transition-colors">
                  Solve Challenge
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div> */}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name || "User"}!
            </h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center min-h-[80px]">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent>
            <LoadingCard />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects.
          </p>
        </div>
        {user.upload_project && (
          <Link href={"/projects/new"}>
            <Button className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        )}
      </div>
      <DailyChallengeAlert />
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount.length}</div>
            {/* <p className="text-xs text-muted-foreground">+2 from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {appliedEvents.length} applied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Discussion Posts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionsCount}</div>
            {/* <p className="text-xs text-muted-foreground">+8 new responses</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgeCount.length}</div>
            {/* <p className="text-xs text-muted-foreground">1 new this week</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* <TabsTrigger value="projects">Projects</TabsTrigger> */}
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityCount}
                  className="text-gray-900 dark:text-gray-100"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#CBD5E1"
                    strokeOpacity={0.8}
                    className="dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="day_name"
                    stroke="#64748B"
                    className="dark:stroke-gray-400"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    stroke="#64748B"
                    className="dark:stroke-gray-400"
                    tick={{ fill: "currentColor" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      color: "#1E293B",
                      className:
                        "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                    className="dark:stroke-blue-400"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-full">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.name}</p>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {/* <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p> */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((project) => (
              <Card key={project}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Project {project}</span>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />3 members
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Tabs defaultValue="allevents" className="w-full">
            <div className="flex justify-center mb-8 ">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger
                  value="allevents"
                  className="flex items-center gap-2"
                >
                  {/* <Github className="w-4 h-4" /> */}
                  All Events
                </TabsTrigger>
                <TabsTrigger
                  value="appliedevents"
                  className="flex items-center gap-2"
                >
                  {/* <Trophy className="w-4 h-4" /> */}
                  Applied Events
                </TabsTrigger>
                <TabsTrigger
                  value="attendedevents"
                  className="flex items-center gap-2"
                >
                  {/* <Trophy className="w-4 h-4" /> */}
                  Attended Events
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="allevents"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {allEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </span>
                        <Button size="sm">
                          <Link
                            href={`/events/${event.id}/register`}
                            // target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            Apply Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <br />
              <center>
                <Button size="sm">
                  <Link href={"/events"}>Show all</Link>
                </Button>
              </center>
            </TabsContent>

            <TabsContent
              value="appliedevents"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {appliedEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="attendedevents"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {attenedEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </span>
                        <Button size="sm">
                          <Link
                            href={`/events/certificates/generate`}
                            // target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            Download Certificate
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="activity">
          {/* <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-full">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.name}</p>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
          <ActivityTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
