"use client";
import QRScanner from "@/components/QRScanner";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const CheckInComponent = () => {
  const [data, setData] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        // setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        const eventData = await response.json();
        setData(eventData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  return <QRScanner eventId={id} eventData={data} />;
};

export default CheckInComponent;
