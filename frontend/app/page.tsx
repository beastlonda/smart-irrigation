"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("Fetching new data...");

      const res = await fetch("http://localhost:5000/sensor-readings", {
        cache: "no-store",
      });

      const data = await res.json();

      // newest first
      setReadings(data.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main
      style={{
        padding: "30px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "30px" }}>
        🌾 Smart Farm Live Dashboard
      </h1>

      {loading && <p>Loading sensor data...</p>}

      {readings.map((reading) => {
        const isCritical = reading.status === "CRITICAL";

        return (
          <div
            key={reading.id}
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: isCritical
                ? "3px solid #ef4444"
                : "3px solid #22c55e",
            }}
          >
            <h2>Device: {reading.device?.name}</h2>

            <p>🌡 Temperature: {reading.temperature}°C</p>
            <p>💧 Humidity: {reading.humidity}%</p>
            <p>🧪 pH: {reading.ph}</p>
            <p>🌱 Soil Moisture: {reading.soilMoisture}%</p>

            <h3
              style={{
                color: isCritical ? "#ef4444" : "#22c55e",
                marginTop: "10px",
              }}
            >
              Status: {reading.status}
            </h3>

            {isCritical && reading.alerts && (
              <>
                <h4 style={{ marginTop: "15px", color: "#facc15" }}>
                  ⚠ Alerts:
                </h4>
                <ul>
                  {reading.alerts.map((alert: string, index: number) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </>
            )}

            {isCritical && reading.recommendations && (
              <>
                <h4 style={{ marginTop: "15px", color: "#38bdf8" }}>
                  💡 Recommendations:
                </h4>
                <ul>
                  {reading.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    )
                  )}
                </ul>
              </>
            )}
          </div>
        );
      })}
    </main>
  );
}