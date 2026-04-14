"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SensorData = {
  id: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  status?: string;
  createdAt: string;
};

type ImageHistory = {
  image: string;
  disease: string;
  time: string;
};

export default function Home() {
  const [data, setData] = useState<SensorData[]>([]);
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [imgSrc, setImgSrc] = useState("https://via.placeholder.com/500x300?text=Camera+Offline");
  const [imageHistory, setImageHistory] = useState<ImageHistory[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [latestDisease, setLatestDisease] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isOnline, setIsOnline] = useState(false);
  const [camPulse, setCamPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setImgSrc(`http://10.219.43.164/capture?t=${Date.now()}`);
      setCamPulse(true);
      setTimeout(() => setCamPulse(false), 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const response = await fetch("http://localhost:5000/sensor-readings");
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const sensorData = await response.json();
        if (Array.isArray(sensorData) && sensorData.length > 0) {
          setData(sensorData);
          setLatest(sensorData[0]);
          setIsOnline(true);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setIsOnline(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch("http://localhost:5000/sensor-readings/images");
        if (response.ok) {
          const imageData = await response.json();
          setImages(Array.isArray(imageData) ? imageData.reverse() : []);
        }
      } catch (err) { console.log("Could not load images:", err); }
    };
    loadImages();
    const interval = setInterval(loadImages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/sensor-readings/image-history");
        if (response.ok) {
          const histData = await response.json();
          if (Array.isArray(histData) && histData.length > 0) {
            setImageHistory(histData);
            setLatestDisease(histData[0].disease);
          }
        }
      } catch (err) { console.log("Could not load history:", err); }
    };
    loadHistory();
    const interval = setInterval(loadHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const analyzeLatestImage = async () => {
    if (images.length === 0) { alert("No captured images available!"); return; }
    setAnalyzing(true);
    try {
      const imageUrl = images[0].url;
      const imgResponse = await fetch(imageUrl);
      const blob = await imgResponse.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => { const result = reader.result as string; resolve(result.split(",")[1]); };
        reader.readAsDataURL(blob);
      });
      const response = await fetch("http://localhost:5000/sensor-readings/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: images[0].name, image: base64 }),
      });
      const result = await response.json();
      if (result.disease) { setLatestDisease(result.disease); alert("✅ Analysis complete!"); }
    } catch (err) { console.error("Analysis failed:", err); alert("❌ Analysis failed. Check console."); }
    finally { setAnalyzing(false); }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "#22c55e";
    if (status === "GOOD" || status === "NORMAL") return "#22c55e";
    if (status === "WARNING") return "#f59e0b";
    return "#ef4444";
  };

  const getRecommendation = () => {
    if (!latest) return "Loading sensor data...";
    if (latest.soilMoisture < 30) return "⚠️ Low soil moisture — Start Irrigation now";
    if (latest.temperature > 35) return "🌡️ High temperature — Activate cooling system";
    return "✅ All conditions optimal — No action needed";
  };

  const parseDisease = (diseaseStr: string) => {
    if (!diseaseStr) return null;
    const parts: Record<string, string> = {};
    diseaseStr.split("|").forEach((part) => {
      const [key, ...rest] = part.split(":");
      if (key && rest.length > 0) parts[key.trim()] = rest.join(":").trim();
    });
    return parts;
  };

  const parsedDisease = latestDisease ? parseDisease(latestDisease) : null;

  const getSeverityColor = (severity?: string) => {
    if (!severity || severity === "None") return "#22c55e";
    if (severity === "Mild") return "#84cc16";
    if (severity === "Moderate") return "#f59e0b";
    if (severity === "Severe") return "#ef4444";
    return "#94a3b8";
  };

  const getSeverityBg = (severity?: string) => {
    if (!severity || severity === "None") return "rgba(34,197,94,0.1)";
    if (severity === "Mild") return "rgba(132,204,22,0.1)";
    if (severity === "Moderate") return "rgba(245,158,11,0.1)";
    if (severity === "Severe") return "rgba(239,68,68,0.1)";
    return "rgba(148,163,184,0.1)";
  };

  const getValueColor = (value: number, low: number, high: number) => {
    if (value < low) return "#f59e0b";
    if (value > high) return "#ef4444";
    return "#22c55e";
  };

  const clamp = (v: number, min: number, max: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050c1a; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
        .page { min-height: 100vh; background: #050c1a; }

        /* NAVBAR */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 32px;
          background: rgba(5,12,26,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(56,189,248,0.1);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #0ea5e9, #22c55e);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .nav-logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #f0f9ff; letter-spacing: -0.3px; }
        .nav-links { display: flex; gap: 4px; }
        .nav-link {
          text-decoration: none; color: #94a3b8; font-size: 14px; font-weight: 500;
          padding: 7px 14px; border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-link:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }
        .nav-link.active { color: #38bdf8; background: rgba(56,189,248,0.1); }
        .nav-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #64748b;
        }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: pulse-dot 2s infinite;
        }
        .status-dot.offline { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* HERO */
        .hero {
          padding: 64px 32px 48px;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.08) 0%, transparent 70%);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          text-align: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2);
          color: #38bdf8; font-size: 12px; font-weight: 500;
          padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
          letter-spacing: 0.5px;
        }
        .hero-title {
          font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 56px);
          font-weight: 800; line-height: 1.1; letter-spacing: -1px;
          background: linear-gradient(135deg, #f0f9ff 0%, #7dd3fc 50%, #22c55e 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
        }
        .hero-sub {
          font-size: 16px; color: #64748b; max-width: 520px;
          margin: 0 auto 28px; line-height: 1.7;
        }
        .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          padding: 12px 28px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white; font-size: 14px; font-weight: 600;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 20px rgba(14,165,233,0.3);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(14,165,233,0.4); }
        .btn-secondary {
          padding: 12px 28px; border-radius: 10px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; font-size: 14px; font-weight: 500;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
        .hero-stats {
          display: flex; gap: 32px; justify-content: center;
          margin-top: 36px; flex-wrap: wrap;
        }
        .hero-stat { text-align: center; }
        .hero-stat-num { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; color: #38bdf8; }
        .hero-stat-label { font-size: 12px; color: #475569; margin-top: 2px; }

        /* LAYOUT */
        .main { padding: 32px; max-width: 1400px; margin: 0 auto; }
        .top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        @media(max-width: 900px) { .top-grid { grid-template-columns: 1fr; } }

        /* CARDS */
        .card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 20px;
          backdrop-filter: blur(10px);
          transition: border-color 0.2s, transform 0.2s;
        }
        .card:hover { border-color: rgba(56,189,248,0.2); }
        .card-title {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: #475569; letter-spacing: 0.8px; text-transform: uppercase;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .card-title-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; }

        /* SENSOR GRID */
        .sensor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media(max-width: 600px) { .sensor-grid { grid-template-columns: repeat(2, 1fr); } }
        .sensor-card {
          background: rgba(5,12,26,0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 14px;
          transition: all 0.2s;
        }
        .sensor-card:hover { border-color: rgba(56,189,248,0.25); transform: translateY(-2px); }
        .sensor-icon { font-size: 20px; margin-bottom: 8px; }
        .sensor-label { font-size: 11px; color: #475569; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .sensor-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .sensor-bar-bg { height: 3px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
        .sensor-bar-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }

        /* CAMERA */
        .camera-wrapper { position: relative; border-radius: 12px; overflow: hidden; background: #000; }
        .camera-overlay {
          position: absolute; top: 10px; left: 10px;
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
          border: 1px solid rgba(239,68,68,0.4);
          padding: 4px 10px; border-radius: 100px;
          font-size: 11px; color: #fca5a5; font-weight: 500;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #ef4444;
          animation: pulse-dot 1.5s infinite;
        }
        .cam-pulse { animation: cam-flash 0.5s ease; }
        @keyframes cam-flash { 0%,100%{opacity:1} 50%{opacity:0.7} }
        .camera-img { width: 100%; display: block; max-height: 280px; object-fit: cover; }

        /* AI SECTION */
        .ai-banner {
          border-radius: 10px; padding: 14px 16px; margin-bottom: 14px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 10px;
        }
        .ai-disease-name { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
        .severity-badge {
          padding: 4px 14px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
        }
        .ai-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media(max-width: 500px) { .ai-cards { grid-template-columns: 1fr; } }
        .ai-detail-card {
          background: rgba(5,12,26,0.6); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 12px;
        }
        .ai-detail-label { font-size: 10px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .ai-detail-text { font-size: 13px; color: #cbd5e1; line-height: 1.6; }

        /* ANALYZE BTN */
        .analyze-btn {
          padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .analyze-btn:not(:disabled):hover { transform: translateY(-1px); }
        .analyze-btn:disabled { cursor: not-allowed; opacity: 0.6; }

        /* FARM INTELLIGENCE */
        .intel-risk { font-size: 28px; font-family: 'Syne', sans-serif; font-weight: 800; margin-bottom: 4px; }
        .intel-rec {
          font-size: 14px; color: #94a3b8; padding: 12px 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; margin-top: 12px; line-height: 1.6;
        }

        /* HISTORY */
        .history-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(5,12,26,0.5); border: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 8px; font-size: 13px; color: #94a3b8;
          transition: border-color 0.2s;
        }
        .history-item:hover { border-color: rgba(255,255,255,0.1); }
        .history-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* IMAGE GRID */
        .img-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
        .img-item { border-radius: 8px; overflow: hidden; aspect-ratio: 1; border: 1px solid rgba(255,255,255,0.06); transition: transform 0.2s; cursor: pointer; }
        .img-item:hover { transform: scale(1.03); }
        .img-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* CONTROLS */
        .ctrl-btn {
          padding: 11px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }

        /* BOTTOM GRID */
        .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px; }
        @media(max-width: 900px) { .bottom-grid { grid-template-columns: 1fr; } }

        /* TIMESTAMP */
        .timestamp { font-size: 11px; color: #334155; display: flex; align-items: center; gap: 4px; }

        /* LOADING SKELETON */
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ERROR */
        .error-bar { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; }

        /* DIVIDER */
        .section-label {
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600;
          color: #334155; letter-spacing: 1px; text-transform: uppercase;
          margin: 24px 0 12px; display: flex; align-items: center; gap: 10px;
        }
        .section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.04); }
      `}</style>

      <div className="page">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-logo">
            <div className="nav-logo-icon">🌱</div>
            <span className="nav-logo-text">AgroSense</span>
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link active">Dashboard</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/crop" className="nav-link">Crops</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
            <Link href="/login" className="nav-link">Login</Link>
          </div>
          <div className="nav-status">
            <div className={`status-dot ${isOnline ? "" : "offline"}`}></div>
            {isOnline ? "Live" : "Offline"}
            {lastUpdated && <span style={{ marginLeft: 4 }}>· {lastUpdated}</span>}
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">🛰️ IoT · AI · Precision Agriculture</div>
          <h1 className="hero-title">Smart Irrigation System</h1>
          <p className="hero-sub">
            Real-time sensor monitoring, AI-powered plant disease detection,
            and automated irrigation for modern greenhouse farming.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })}>
              View Dashboard ↓
            </button>
            <Link href="/crop"><button className="btn-secondary">Browse Crops →</button></Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">6</div>
              <div className="hero-stat-label">Live Sensors</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">AI</div>
              <div className="hero-stat-label">Disease Detection</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">5s</div>
              <div className="hero-stat-label">Update Interval</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">100</div>
              <div className="hero-stat-label">Crops Database</div>
            </div>
          </div>
        </div>

        {/* DASHBOARD */}
        <div className="main" id="dashboard">

          {error && <div className="error-bar">⚠️ Connection error: {error}</div>}

          <div className="section-label">Live Overview</div>

          <div className="top-grid">

            {/* LEFT — SENSOR DATA + INTELLIGENCE */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* SENSOR GRID */}
              <div className="card">
                <div className="card-title"><span className="card-title-dot"></span>Live Sensor Data</div>
                {!latest ? (
                  <div className="sensor-grid">
                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }}></div>)}
                  </div>
                ) : (
                  <div className="sensor-grid">
                    {[
                      { icon: "🌡️", label: "Temperature", value: latest.temperature, unit: "°C", low: 15, high: 35, color: getValueColor(latest.temperature, 15, 35) },
                      { icon: "💧", label: "Humidity", value: latest.humidity, unit: "%", low: 40, high: 80, color: getValueColor(latest.humidity, 40, 80) },
                      { icon: "🌱", label: "Soil Moisture", value: latest.soilMoisture, unit: "%", low: 30, high: 80, color: getValueColor(latest.soilMoisture, 30, 80) },
                      { icon: "🔵", label: "Nitrogen", value: latest.nitrogen, unit: "", low: 20, high: 150, color: getValueColor(latest.nitrogen, 20, 150) },
                      { icon: "🟠", label: "Phosphorus", value: latest.phosphorus, unit: "", low: 10, high: 100, color: getValueColor(latest.phosphorus, 10, 100) },
                      { icon: "🟣", label: "Potassium", value: latest.potassium, unit: "", low: 20, high: 200, color: getValueColor(latest.potassium, 20, 200) },
                    ].map((s) => (
                      <div className="sensor-card" key={s.label}>
                        <div className="sensor-icon">{s.icon}</div>
                        <div className="sensor-label">{s.label}</div>
                        <div className="sensor-value" style={{ color: s.color }}>
                          {s.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#475569" }}>{s.unit}</span>
                        </div>
                        <div className="sensor-bar-bg">
                          <div className="sensor-bar-fill" style={{ width: `${clamp(s.value, s.low, s.high)}%`, background: s.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FARM INTELLIGENCE */}
              <div className="card">
                <div className="card-title"><span className="card-title-dot" style={{ background: "#22c55e" }}></span>Farm Intelligence</div>
                {latest ? (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div className="intel-risk" style={{ color: getStatusColor(latest.status) }}>
                        {latest.status || "NORMAL"}
                      </div>
                      <div style={{ fontSize: 12, color: "#475569" }}>Risk Level</div>
                    </div>
                    <div className="intel-rec">{getRecommendation()}</div>
                  </>
                ) : (
                  <div className="skeleton" style={{ height: 80 }}></div>
                )}
              </div>

              {/* MANUAL CONTROLS */}
              <div className="card">
                <div className="card-title"><span className="card-title-dot" style={{ background: "#f59e0b" }}></span>Manual Controls</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="ctrl-btn">💧 Start Irrigation</button>
                  <button className="ctrl-btn">❄️ Cooling System</button>
                  <button className="ctrl-btn">🌿 Add Fertilizer</button>
                </div>
              </div>
            </div>

            {/* RIGHT — CAMERA + AI */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* LIVE CAMERA */}
              <div className="card">
                <div className="card-title"><span className="card-title-dot" style={{ background: "#ef4444" }}></span>Live Farm Camera</div>
                <div className="camera-wrapper">
                  <img
                    src={imgSrc}
                    alt="Live camera"
                    className={`camera-img ${camPulse ? "cam-pulse" : ""}`}
                    onError={() => setImgSrc("https://via.placeholder.com/500x300?text=Camera+Offline")}
                  />
                  <div className="camera-overlay">
                    <span className="live-dot"></span>LIVE MONITORING
                  </div>
                </div>
              </div>

              {/* CAPTURED IMAGES */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="card-title" style={{ marginBottom: 0 }}>
                    <span className="card-title-dot" style={{ background: "#a78bfa" }}></span>Captured Images
                  </div>
                  <button
                    className="analyze-btn"
                    onClick={analyzeLatestImage}
                    disabled={analyzing || images.length === 0}
                    style={{
                      background: analyzing ? "rgba(71,85,105,0.5)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      color: "white",
                      boxShadow: analyzing ? "none" : "0 4px 15px rgba(124,58,237,0.3)",
                    }}
                  >
                    {analyzing ? "⏳ Analyzing..." : "🤖 Analyze with AI"}
                  </button>
                </div>
                <div className="img-grid">
                  {images.length === 0
                    ? [...Array(6)].map((_, i) => <div key={i} className="skeleton img-item"></div>)
                    : images.slice(0, 6).map((img, i) => (
                      <div className="img-item" key={i}>
                        <img src={img.url} alt={`Captured ${i + 1}`} />
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* AI DISEASE DETECTION */}
          <div className="section-label">AI Plant Analysis</div>
          <div className="card" style={{ borderColor: parsedDisease ? `rgba(${parsedDisease.Severity === "None" ? "34,197,94" : "239,68,68"},0.2)` : "rgba(255,255,255,0.06)", marginBottom: 20 }}>
            <div className="card-title"><span className="card-title-dot" style={{ background: "#10b981" }}></span>AI Plant Disease Detection · Gemini Vision</div>

            {parsedDisease ? (
              <>
                <div className="ai-banner" style={{ background: getSeverityBg(parsedDisease.Severity), border: `1px solid rgba(${parsedDisease.Severity === "None" ? "34,197,94" : "239,68,68"},0.2)` }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Diagnosis</div>
                    <div className="ai-disease-name" style={{ color: getSeverityColor(parsedDisease.Severity) }}>
                      {parsedDisease.Severity === "None" ? "✅ Plant is Healthy" : `⚠️ ${parsedDisease.Disease}`}
                    </div>
                  </div>
                  <span
                    className="severity-badge"
                    style={{ background: getSeverityBg(parsedDisease.Severity), color: getSeverityColor(parsedDisease.Severity), border: `1px solid ${getSeverityColor(parsedDisease.Severity)}` }}
                  >
                    {parsedDisease.Severity || "None"}
                  </span>
                </div>
                <div className="ai-cards">
                  <div className="ai-detail-card">
                    <div className="ai-detail-label">💊 Treatment Protocol</div>
                    <div className="ai-detail-text">{parsedDisease.Treatment}</div>
                  </div>
                  <div className="ai-detail-card">
                    <div className="ai-detail-label">🛡️ Prevention Measures</div>
                    <div className="ai-detail-text">{parsedDisease.Prevention}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 20px", color: "#334155" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
                <div style={{ fontSize: 15, marginBottom: 6, color: "#475569" }}>No analysis yet</div>
                <div style={{ fontSize: 13 }}>Click <span style={{ color: "#a78bfa", fontWeight: 600 }}>"Analyze with AI"</span> to detect plant diseases</div>
              </div>
            )}
          </div>

          {/* BOTTOM */}
          <div className="bottom-grid">

            {/* SENSOR HISTORY */}
            <div className="card">
              <div className="card-title"><span className="card-title-dot" style={{ background: "#64748b" }}></span>Recent Sensor Records</div>
              {data.slice(0, 5).map((item) => (
                <div className="history-item" key={item.id}>
                  <div className="history-dot" style={{ background: getStatusColor(item.status) }}></div>
                  <span>🌡️ <b>{item.temperature}°C</b></span>
                  <span>💧 <b>{item.humidity}%</b></span>
                  <span>🌱 <b>{item.soilMoisture}%</b></span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#334155" }}>{item.status || "NORMAL"}</span>
                </div>
              ))}
            </div>

            {/* AI HISTORY */}
            <div className="card">
              <div className="card-title"><span className="card-title-dot" style={{ background: "#a78bfa" }}></span>AI Analysis Log</div>
              {imageHistory.length === 0 ? (
                <div style={{ fontSize: 13, color: "#334155", textAlign: "center", padding: "20px 0" }}>No analyses yet</div>
              ) : (
                imageHistory.slice(0, 5).map((item, i) => {
                  const parsed = parseDisease(item.disease);
                  return (
                    <div className="history-item" key={i} style={{ borderLeft: `3px solid ${getSeverityColor(parsed?.Severity)}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 2 }}>
                          {parsed?.Severity === "None" ? "✅" : "⚠️"} <b>{parsed?.Disease || "Unknown"}</b>
                        </div>
                        <div style={{ fontSize: 11, color: "#475569" }}>{new Date(item.time).toLocaleString()}</div>
                      </div>
                      <span className="severity-badge" style={{ fontSize: 10, background: getSeverityBg(parsed?.Severity), color: getSeverityColor(parsed?.Severity), border: `1px solid ${getSeverityColor(parsed?.Severity)}` }}>
                        {parsed?.Severity || "N/A"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "32px 0 16px", color: "#1e293b", fontSize: 12 }}>
            AgroSense Smart Irrigation Platform · Built with Next.js + NestJS + Gemini AI
          </div>
        </div>
      </div>
    </>
  );
}
