"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Loader2, Github, AlertCircle, CheckCircle2 } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function MandatoryOAuthPopup({ user, onComplete }) {
  const [open, setOpen] = useState(false);
  const [githubConnected, setGithubConnected] = useState(
    !!user?.githubUsername
  );
  const [leetcodeConnected, setLeetcodeConnected] = useState(
    !!user?.leetcodeUsername
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  useEffect(() => {
    // Check if both accounts are already connected
    const hasGithub = !!user?.githubUsername;
    const hasLeetcode = !!user?.leetcodeUsername;

    setGithubConnected(hasGithub);
    setLeetcodeConnected(hasLeetcode);

    // If both are already connected, show logout prompt
    if (hasGithub && hasLeetcode) {
      setOpen(false);
      setShowLogoutPrompt(true);
    } else {
      // Otherwise show the connection dialog
      setOpen(true);
    }

    // Listen for OAuth callbacks
    window.addEventListener("message", handleOAuthCallback);
    return () => window.removeEventListener("message", handleOAuthCallback);
  }, [user]);

  const handleOAuthCallback = async (event) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) return;

    try {
      setLoading(true);

      if (event.data.type === "github-oauth") {
        const username = event.data.username;

        // Update user profile in database
        const response = await fetch("/api/auth/github/update-github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, githubUsername: username }),
        });

        if (response.ok) {
          setGithubConnected(true);

          // Check if LeetCode is also connected
          if (leetcodeConnected || !!user?.leetcodeUsername) {
            setOpen(false);
            setShowLogoutPrompt(true);
          }
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update GitHub username");
        }
      } else if (event.data.type === "github-oauth-error") {
        setError(event.data.error || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkIfAllConnected = () => {
    if (
      (githubConnected || !!user?.githubUsername) &&
      (leetcodeConnected || !!user?.leetcodeUsername)
    ) {
      console.log("Both accounts connected, showing logout prompt");
      setOpen(false);
      setShowLogoutPrompt(true);
    }
  };

  const handleGithubConnect = () => {
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      "/api/auth/github",
      "Github OAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleLeetcodeSubmit = async () => {
    if (!leetcodeUsername.trim()) {
      setError("Please enter a LeetCode username");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Update user profile in database
      const response = await fetch("/api/auth/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          leetcodeUsername: leetcodeUsername,
        }),
      });

      if (response.ok) {
        setLeetcodeConnected(true);

        // Check if GitHub is also connected
        if (githubConnected || !!user?.githubUsername) {
          setOpen(false);
          setShowLogoutPrompt(true);
        }
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update LeetCode username");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open && !showLogoutPrompt}
        onOpenChange={() => {}} /* Empty handler prevents closing */
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Accounts</DialogTitle>
            <DialogDescription>
              You need to connect your GitHub and LeetCode accounts to continue.
              These connections are required and cannot be skipped.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleGithubConnect}
                disabled={githubConnected || loading}
              >
                {githubConnected ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    GitHub Connected
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Connect GitHub
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {leetcodeConnected ? (
                <Button className="w-full" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  LeetCode Connected
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter your LeetCode username (NOT URL)"
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      onClick={handleLeetcodeSubmit}
                      disabled={loading || !leetcodeUsername.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center text-sm text-gray-500">
            <p>Both connections are required to continue using the platform.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Prompt Dialog */}
      <Dialog
        open={showLogoutPrompt}
        onOpenChange={() => {}} /* Empty handler prevents closing */
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Action Required</DialogTitle>
            <DialogDescription>
              You need to logout and login again for the changes to take effect.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                All accounts successfully connected!
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <LogoutButton />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
