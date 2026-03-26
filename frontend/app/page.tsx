"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
type SensorData = {
  id: number;
  temperature: number;
  humidity: number;
  ph: number;
  soilMoisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  status: string;
  createdAt: string;
};

export default function Home() {
  const [data, setData] = useState<SensorData[]>([]);
  const [latest, setLatest] = useState<SensorData | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/sensor-readings");
      const json = await res.json();

      setData(json);

      if (json.length > 0) {
        setLatest(json[0]); // latest reading
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 3000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const getColor = (status: string) => {
    if (status === "GOOD") return "#22c55e";
    if (status === "WARNING") return "#facc15";
    return "#ef4444";
  };

  const getRecommendation = () => {
    if (!latest) return "Loading...";

    if (latest.soilMoisture < 30) return "Start Irrigation 💧";
    if (latest.temperature > 35) return "Start Cooling ❄️";
    return "All conditions normal ✅";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <div style={styles.navbar}>
  <h1 style={{ fontSize: "24px" }}>
    🌱 Smart Farm Dashboard
  </h1>

  <div style={styles.navLinks}>
    <Link href="/" style={styles.link}>Home</Link>
    <Link href="/about" style={styles.link}>About</Link>
    <Link href="/crop" style={styles.link}>Crop Selection</Link>
    <Link href="/contact" style={styles.link}>Contact</Link>
    <Link href="/login" style={styles.link}>Login</Link>
  </div>
</div>

      {/* 🧠 Farm Intelligence */}
      {latest && (
        <div style={styles.boxRed}>
          <h2>🚜 Farm Intelligence</h2>
          <p>
            Current Risk Level:{" "}
            <span style={{ color: getColor(latest.status) }}>
              {latest.status}
            </span>
          </p>
          <p>Recommended Action: {getRecommendation()}</p>
        </div>
      )}

      {/* 📊 Live Data */}
      {latest && (
        <div style={styles.boxGreen}>
          <h3>📡 Live Sensor Data</h3>

          <div style={styles.grid}>
            <div style={styles.card}>🌡 {latest.temperature} °C</div>
            <div style={styles.card}>💧 {latest.humidity} %</div>
            <div style={styles.card}>🧪 pH: {latest.ph}</div>
            <div style={styles.card}>🌱 Soil: {latest.soilMoisture}%</div>
            <div style={styles.card}>N: {latest.nitrogen}</div>
            <div style={styles.card}>P: {latest.phosphorus}</div>
            <div style={styles.card}>K: {latest.potassium}</div>
          </div>

          <p style={{ marginTop: "10px" }}>
            Status:{" "}
            <span style={{ color: getColor(latest.status) }}>
              {latest.status}
            </span>
          </p>
        </div>
      )}

      {/* 🔘 Manual Controls */}
      <div style={styles.boxBlue}>
        <h3>⚙️ Manual Controls</h3>
        <button style={styles.btn}>Start Irrigation</button>
        <button style={styles.btn}>Cooling System</button>
        <button style={styles.btn}>Add Fertilizer</button>
      </div>

      {/* 📜 History */}
      <div style={styles.boxGray}>
        <h3>📜 Last 5 Records</h3>

        {data.slice(0, 5).map((item) => (
          <div key={item.id} style={styles.historyCard}>
            🌡 {item.temperature}°C | 💧 {item.humidity}% | 🌱{" "}
            {item.soilMoisture}% | Status: {item.status}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  boxRed: {
    border: "2px solid #ef4444",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    background: "#1e293b",
  },
  boxGreen: {
    border: "2px solid #22c55e",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    background: "#1e293b",
  },
  boxBlue: {
    border: "2px solid #3b82f6",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    background: "#1e293b",
  },
  boxGray: {
    border: "2px solid #64748b",
    padding: "15px",
    borderRadius: "10px",
    background: "#1e293b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "10px",
  },
  card: {
    background: "#0f172a",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
  btn: {
    marginRight: "10px",
    padding: "10px 15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  historyCard: {
    background: "#0f172a",
    padding: "8px",
    marginTop: "8px",
    borderRadius: "6px",
  },

  navbar: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
},

navLinks: {
  display: "flex",
  gap: "20px",
},

link: {
  textDecoration: "none",
  color: "#e2e8f0",
  fontWeight: "500",
  padding: "6px 10px",
  borderRadius: "6px",
},
};