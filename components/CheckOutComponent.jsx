"use client";
import QRScannerOut from "@/components/QRScannerOut";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const CheckOutComponent = () => {
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

  return <QRScannerOut eventId={id} eventData={data} />;
};

export default CheckOutComponent;
