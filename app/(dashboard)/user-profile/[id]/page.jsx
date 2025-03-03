"use client";
import { useEffect, useState, use } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GithubIcon,
  CodeIcon,
  MailIcon,
  Award,
  User,
  Coins,
  Moon,
  Sun,
  MapPin,
  Calendar,
  Briefcase,
  ExternalLink,
} from "lucide-react";

export default function UserProfilePage({ params }) {
  // Fix the use hook issue by directly accessing params
  const { id } = use(params);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Skip fetch if no id is provided
    if (!id) {
      setLoading(false);
      setError("User ID is missing");
      return;
    }

    fetchUser();
  }, [id]); // Depend on id to refetch when it changes

  async function fetchUser() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-profile/${id}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const userData = data.user || data; // Handle both response formats
      setUser(userData);
      setBadges(data.badges || []);

      // Only fetch GitHub profile if username exists
      if (userData?.github_username) {
        fetchGithubProfile(userData.github_username);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  }

  const fetchGithubProfile = async (username) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error("GitHub profile fetch failed");

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching GitHub profile:", err);
      // We don't set the main error state here to still show the user profile
    }
  };

  if (loading) {
    return (
      <div className="p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            User Profile
          </h1>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Skeleton className="h-32 w-32 rounded-full dark:bg-gray-700" />
              <div className="space-y-4 flex-1 w-full">
                <Skeleton className="h-8 w-2/3 dark:bg-gray-700" />
                <Skeleton className="h-4 w-full dark:bg-gray-700" />
                <Skeleton className="h-4 w-full dark:bg-gray-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Skeleton className="h-10 w-full dark:bg-gray-700 rounded-lg" />
                  <Skeleton className="h-10 w-full dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto mt-8 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Occurred
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchUser}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-3xl mx-auto mt-8 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center">
            <User className="w-6 h-6 mr-2" />
            User Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        {/* Profile Header - Enhanced with gradient and better spacing */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white"></div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="relative">
              <img
                src={
                  profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                }
                alt={`${user.name || "User"}'s avatar`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
              />
              {profile?.hireable && (
                <Badge className="absolute -bottom-2 -right-2 bg-green-500 dark:bg-green-600 px-3 py-1">
                  Hireable
                </Badge>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">
                {user.name || "Anonymous User"}
              </h2>
              {user.title && (
                <p className="text-blue-100 text-lg mb-2">{user.title}</p>
              )}
              {profile?.bio && (
                <p className="text-blue-50 max-w-2xl">{profile.bio}</p>
              )}

              {profile && profile.location && (
                <div className="flex items-center justify-center md:justify-start mt-4 text-blue-100">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details - Enhanced with cards and better organization */}
        <div className="p-8 space-y-8">
          {/* Contact & Links Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              Contact & Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <MailIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    Email
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {user.email || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <GithubIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    GitHub
                  </span>
                  {user.github_username ? (
                    <a
                      href={`https://github.com/${user.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      {user.github_username}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      N/A
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <CodeIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    LeetCode
                  </span>
                  {user.leetcode_username ? (
                    <a
                      href={`https://leetcode.com/${user.leetcode_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      {user.leetcode_username}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      N/A
                    </span>
                  )}
                </div>
              </div>

              {profile && (
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      Followers
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {profile.followers.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards - Enhanced with better visuals */}
          {user.total_points !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-2">
                    <Award className="w-6 h-6 mr-2" />
                    <h3 className="font-semibold text-lg">Total Points</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {user.total_points.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-2">
                    <Coins className="w-6 h-6 mr-2" />
                    <h3 className="font-semibold text-lg">Code Coins</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {user.code_coins.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {badges && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-2">
                      <Award className="w-6 h-6 mr-2" />
                      <h3 className="font-semibold text-lg">Badges Earned</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{badges.length}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges Section - Enhanced with better visuals */}
          {badges && badges.length > 0 && (
            <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                <Award className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                Earned Badges
              </h3>
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <TooltipProvider>
                  {badges.map((badge, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger>
                        <div className="flex flex-col items-center group">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 p-4">
                            {badge.icon_url ? (
                              <img
                                className="h-10 w-10"
                                src={badge.icon_url}
                                alt={badge.name}
                              />
                            ) : (
                              <Award className="h-10 w-10 text-white" />
                            )}
                          </div>
                          <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {badge.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-gray-100 border-gray-700 p-3 rounded-lg shadow-xl max-w-xs">
                        <div className="text-sm">
                          <p className="font-semibold text-purple-300 mb-1">
                            {badge.name}
                          </p>
                          <p className="text-gray-300">{badge.description}</p>
                          {badge.earned_date && (
                            <div className="flex items-center mt-2 text-gray-400 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Earned: {badge.earned_date}</span>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
