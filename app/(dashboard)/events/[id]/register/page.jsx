"use client";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        const eventData = await response.json();
        setData(eventData);
        // console.log(eventData);
        // console.log(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  // return <FetchUserDataForEvent eventId={id} eventData={data} />;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return <EventRegistrationForm eventId={id} eventData={data} />;
}
