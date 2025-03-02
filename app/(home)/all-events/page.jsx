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
  Loader2,
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/all-events");
        const data = await response.json();
        console.log(data);
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen ">
      {/* Events Section */}
      <section className="py-24 px-4 ">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50">
              All Events
            </h2>
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
                  {/* <CardContent>
                  <Button>Register</Button>
                </CardContent> */}
                </Card>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
