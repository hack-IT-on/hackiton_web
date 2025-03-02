"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code,
  BookOpen,
  Trophy,
  Users,
  Star,
  Instagram,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [events, setEvents] = useState([]);

  const bottom_nav = [
    { href: "/verify-certificate", label: "Verify certificates" },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alex Rivera",
      quote:
        "From zero coding knowledge to landing a FAANG internship in 6 months!",
      school: "MIT",
      achievement: "Software Engineer Intern @ Meta",
    },
    {
      id: 2,
      name: "Emma Chen",
      quote:
        "The competitive programming challenges helped me win the ACM-ICPC regionals.",
      school: "Stanford",
      achievement: "ACM-ICPC Regional Winner",
    },
    {
      id: 3,
      name: "Raj Patel",
      quote:
        "Built my first full-stack app with guidance from the community mentors.",
      school: "UC Berkeley",
      achievement: "Full Stack Developer",
    },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/home");
        const data = await response.json();
        console.log(data);
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="min-h-screen ">
      {/* Hero Section with Code Background */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-b ">
        <div className="absolute inset-0 opacity-5">
          <div className="animate-slide-up font-mono text-sm whitespace-pre leading-6">
            {`function solve(n) {\n  let dp = Array(n + 1).fill(0);\n  dp[1] = 1;\n  for(let i = 2; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n  }\n  return dp[n];\n}`}
          </div>
        </div>
        <motion.div
          className="relative z-10 text-center space-y-8 max-w-4xl"
          {...fadeIn}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Code Together.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Join an elite community of student developers. Master algorithms,
            build projects, and land your dream tech role.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/dashboard"}>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              >
                Start Coding <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href={"/problems"}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Explore Challenges
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-gradient-to-b ">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Card className=" shadow-lg hover:shadow-xl transition-all border-blue-100 hover:border-blue-300">
              <CardHeader>
                <Code className="text-blue-600 w-12 h-12" />
                <CardTitle className="text-2xl font-bold">
                  Daily Coding Challenges
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Level up with algorithmic problems
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                Tackle curated coding challenges ranging from easy to
                competitive programming level. Get instant feedback and learn
                optimal solutions.
              </CardContent>
            </Card>

            <Card className=" shadow-lg hover:shadow-xl transition-all border-blue-100 hover:border-blue-300">
              <CardHeader>
                <BookOpen className="text-indigo-600 w-12 h-12" />
                <CardTitle className="text-2xl font-bold">
                  Interactive Learning
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Master computer science fundamentals
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                Access comprehensive tutorials, visualization tools, and
                practice problems for data structures, algorithms, and system
                design.
              </CardContent>
            </Card>

            <Card className=" shadow-lg hover:shadow-xl transition-all border-blue-100 hover:border-blue-300">
              <CardHeader>
                <Trophy className="text-violet-600 w-12 h-12" />
                <CardTitle className="text-2xl font-bold">
                  Competitive Rankings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Climb the global leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                Compete in weekly contests, earn achievement badges, and
                showcase your programming skills to top tech companies.
              </CardContent>
            </Card>

            <Card className=" shadow-lg hover:shadow-xl transition-all border-blue-100 hover:border-blue-300">
              <CardHeader>
                <Users className="text-blue-600 w-12 h-12" />
                <CardTitle className="text-2xl font-bold">
                  Mentor Network
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Learn from industry experts
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600">
                Connect with mentors from FAANG companies, get code reviews, and
                receive personalized guidance for your tech career.
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 px-4 bg-gradient-to-b ">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 ">Upcoming Events</h2>
            <p className="text-gray-600">
              Join our community events and level up your skills
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {events.map((event) => (
              <Link key={event.id} href={`/all-events/${event.id}`}>
                <Card className=" shadow-lg hover:shadow-xl transition-all border-blue-100 hover:border-blue-300 overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{event.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>

          <div className="text-center">
            <Link href="/all-events">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                View All Events <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      {/* <section className="py-24 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4  ">
              Top Performers
            </h2>
            <p className="text-gray-600">
              Meet our community&apos;s leading developers
            </p>
          </motion.div>

          <div className="space-y-4">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-white p-6 rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-mono font-bold text-blue-600">
                    #{index + 1}
                  </span>
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    />
                    <AvatarFallback>{user.name}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-bold text-lg  ">
                      {user.name}
                    </div>
                    <div className="text-gray-600">{user.rank}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 w-5 h-5" />
                  <span className="font-mono font-bold text-lg  ">
                    {user.total_points}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      {/* <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative bg-white rounded-2xl border border-blue-100 p-8 md:p-12 shadow-lg"
            key={activeTestimonial}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-4xl text-blue-600 mb-6">"</div>
            <p className="text-xl md:text-2xl mb-6 text-gray-700 italic">
              {testimonials[activeTestimonial].quote}
            </p>
            <div className="space-y-2">
              <p className="font-bold text-lg  ">
                {testimonials[activeTestimonial].name}
              </p>
              <p className="text-gray-600">
                {testimonials[activeTestimonial].school}
              </p>
              <p className="text-blue-600">
                {testimonials[activeTestimonial].achievement}
              </p>
            </div>
          </motion.div>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeTestimonial ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b ">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold  ">Ready to Level Up?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join over 50,000 students who are mastering coding and advancing
            their careers together.
          </p>
          <Link href={"/questions"}>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-12"
            >
              Join the Community <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer with Social Media Links */}
      <footer className="py-16 px-4 border-t border-blue-100 ">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold ">HackItOn</h3>
              <p className="text-gray-600">
                Empowering the next generation of developers through
                community-driven learning.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold ">Quick Links</h3>
              <ul className="space-y-2">
                {bottom_nav.map((item) => (
                  <li key={item}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold ">Community</h3>
              <ul className="space-y-2">
                {["Blog", "Forums", "Discord Server", "Help Center"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold ">Connect With Us</h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/bit_hackiton/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <Instagram className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </a>
                <a
                  href="https://x.com/Hack_It_On"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <Twitter className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </a>
                <a
                  href="https://www.linkedin.com/company/hack-it-on2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <Linkedin className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </a>
                {/* <a
                  href="https://youtube.com/codecampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <Youtube className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </a> */}
                {/* <a
                  href="https://discord.gg/codecampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <Discord className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                </a> */}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm">
                © 2025 HackItOn. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
