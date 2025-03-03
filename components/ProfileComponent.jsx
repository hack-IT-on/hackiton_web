"use client";
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Github,
  User,
  Link as LinkIcon,
  Mail,
  IdCard,
  Calendar,
  Users,
  Star,
  Coins,
  Trophy,
  Code,
  ExternalLink,
  CircleHelp,
  CreditCard,
  MessageCircleQuestion,
  Activity,
  Info,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GitHubCalendar from "react-github-calendar";

const pointsGuide = [
  { activity: "Forum Post", points: 5, coins: 1 },
  { activity: "Answer Question", points: 10, coins: 2 },
  // { activity: "Complete Challenge", points: 20, coins: 4 },
  // { activity: "Open Source Contribution", points: 30, coins: 6 },
  { activity: "Attend Event", points: 50, coins: 12 },
  // { activity: "Quiz Completion", points: 20, coins: 10 },
];

const ProfileComponent = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certCount, setCertCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState(0);
  const [badges, setBadges] = useState();
  const [questionCount, setQuestionCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${user?.github_username}`
        );
        if (!response.ok) throw new Error("Profile fetch failed");

        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      const response = await fetch("/api/user-data");
      const data = await response.json();
      setCoins(data.code_coins);
      setPoints(data.total_points);
    };

    const fetchUserBadge = async () => {
      const response = await fetch("/api/badge");
      const data = await response.json();
      setBadges(data);
    };

    const fetchCertificates = async () => {
      try {
        const response = await fetch("/api/events/certificates");
        const data = await response.json();
        const certificateCount = [data][0].certificates.length;
        return certificateCount;
      } catch (err) {
        console.log(err);
      }
    };

    const fetchQuestionCount = async () => {
      try {
        const response = await fetch("/api/questions/all");
        const data = await response.json();
        setQuestionCount(data.length);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchAnswersCount = async () => {
      try {
        const response = await fetch("/api/questions/answers-count");
        const data = await response.json();
        setAnswersCount(data.length);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchActivityCount = async () => {
      try {
        const response = await fetch("/api/activity/all/count");
        const data = await response.json();
        setActivityCount(data.length);
      } catch (err) {
        console.log(err);
      }
    };

    fetchActivityCount();

    fetchAnswersCount();
    fetchQuestionCount();
    setCertCount(fetchCertificates());
    fetchUserData();
    fetchUserBadge();

    fetchProfile();
  }, [user?.github_username]);

  const handleShareBadge = (badge) => {
    setSelectedBadge(badge);
    setShareDialogOpen(true);
  };

  const shareToSocialMedia = (platform) => {
    if (!selectedBadge) return;

    const baseUrl = window.location.origin;
    const username = profile?.login || user?.github_username;
    const shareText = `I just earned the "${selectedBadge.name}" badge! ${selectedBadge.description} #coding #achievement`;
    const shareUrl = `${baseUrl}/profile/${username}`;

    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank");
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <CardContent className="text-center space-y-4">
          <div className="text-red-500 text-xl">Failed to load profile</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-8">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="profile" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Achievements
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Info className="h-5 w-5 " />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="w-80 p-4">
                      <div>
                        <h3 className="font-semibold mb-2">
                          How to Earn Points & Coins
                        </h3>
                        <div className="space-y-2">
                          {pointsGuide.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{item.activity}</span>
                              <div className="flex gap-4">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {item.points}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Coins className="h-3 w-3 text-amber-500" />
                                  {item.coins}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
            </TabsList>
          </div>

          <Card className="max-w-4xl mx-auto mt-8">
            <CardContent className="p-6">
              <TabsContent
                value="profile"
                className="mt-0 focus-visible:outline-none"
              >
                <div className="flex flex-col md:flex-row items-start space-x-0 md:space-x-6 space-y-4 md:space-y-0">
                  <div className="relative group">
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.name}'s avatar`}
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/20 transition-all duration-300 group-hover:ring-blue-500/40"
                    />
                    {profile.hireable && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500">
                        Hireable
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold ">
                          {profile.name || profile.login}
                        </h1>
                        <p className="">@{profile.login}</p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button
                          variant="outline"
                          className="flex items-center space-x-2"
                          onClick={() =>
                            window.open(profile.html_url, "_blank")
                          }
                        >
                          <Github size={18} />
                          <span>View on GitHub</span>
                          <ExternalLink size={16} />
                        </Button>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="mt-4  leading-relaxed">{profile.bio}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm  ">
                      {profile.company && (
                        <div className="flex items-center">
                          <Code className="mr-2 h-4 w-4" />
                          {profile.company}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {user?.email}
                      </div>
                      <div className="flex items-center">
                        <IdCard className="mr-2 h-4 w-4" />
                        {user?.student_id}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Joined {joinedDate}
                      </div>
                      {profile.blog && (
                        <a
                          href={profile.blog}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br ">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Code className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {profile.public_repos.toLocaleString()}
                      </p>
                      <p className="text-sm  ">Repositories</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br ">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {profile.followers.toLocaleString()}
                      </p>
                      <p className="text-sm  ">Followers</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br ">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {profile.following.toLocaleString()}
                      </p>
                      <p className="text-sm  ">Following</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br ">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Code className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {profile.public_gists.toLocaleString()}
                      </p>
                      <p className="text-sm  ">Gists</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href={"/events/certificates/generate"}>
                    <Card className="bg-gradient-to-br">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <CreditCard className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                          {certCount}
                        </p>
                        <p className="text-sm  ">Event Certificates</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="bg-gradient-to-br">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CircleHelp className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {questionCount}
                      </p>
                      <p className="text-sm  ">Question Raised</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br ">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <MessageCircleQuestion className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {answersCount}
                      </p>
                      <p className="text-sm  ">Answers Provided</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br ">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {activityCount}
                      </p>
                      <p className="text-sm  ">Activity</p>
                    </CardContent>
                  </Card>
                </div>
                {/* <GitHubCalendar username={"dipakbiswa"} /> */}
              </TabsContent>

              <TabsContent
                value="achievements"
                className="mt-0 focus-visible:outline-none"
              >
                <CardContent className="p-6 border-t">
                  <h2 className="text-2xl font-bold ">Achievements</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br ">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {points.toLocaleString()}
                        </p>
                        <p className="text-sm  ">Points</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br ">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Coins className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-amber-600">
                          {coins.toLocaleString()}
                        </p>
                        <p className="text-sm  ">Coins</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br ">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Trophy className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {badges?.length || 0}
                        </p>
                        <p className="text-sm  ">Badges Earned</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Badges Display */}
                  {badges && badges.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span>Earned Badges</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help ml-2">
                                <Info className="h-4 w-4 text-gray-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">
                                Click on a badge to share it!
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <TooltipProvider>
                          {badges.map((badge, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger>
                                <div
                                  className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
                                  onClick={() => handleShareBadge(badge)}
                                >
                                  <img
                                    className="h-12 w-12"
                                    src={badge.icon_url}
                                    alt={badge.name}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Share2 className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-semibold">{badge.name}</p>
                                  <p className="text-xs ">
                                    {badge.description}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Badge Sharing Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Badge</DialogTitle>
            <DialogDescription>
              Share your "{selectedBadge?.name}" badge with your network!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center my-4">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full shadow-md">
              {selectedBadge && (
                <img
                  src={selectedBadge.icon_url}
                  alt={selectedBadge.name}
                  className="h-24 w-24"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-2 text-center">
            {selectedBadge && (
              <>
                <h3 className="font-bold text-lg">{selectedBadge.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedBadge.description}
                </p>
              </>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={() => shareToSocialMedia("twitter")}
              className="bg-blue-400 hover:bg-blue-500"
            >
              <Twitter className="h-5 w-5 mr-2" />
              Twitter
            </Button>
            <Button
              onClick={() => shareToSocialMedia("linkedin")}
              className="bg-blue-700 hover:bg-blue-800"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </Button>
            <Button
              onClick={() => shareToSocialMedia("facebook")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Facebook className="h-5 w-5 mr-2" />
              Facebook
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileComponent;
