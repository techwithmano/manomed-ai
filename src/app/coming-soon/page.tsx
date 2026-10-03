"use client";

import { useEffect, useRef } from "react";

export default function UnderMaintenance() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const width = canvas.width;
    const height = canvas.height;
    const particles: any[] = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.fillStyle = "rgba(0, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #000014, #001722, #002b36, #001722, #000014)",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "1rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.3,
          top: 0,
          left: 0,
        }}
      />

      <div
        style={{
          backdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "2rem 3rem",
          boxShadow: "0 0 25px rgba(0, 255, 255, 0.3)",
          animation: "pulseGlow 3s infinite ease-in-out",
          maxWidth: "420px",
          border: "1px solid rgba(0, 255, 255, 0.2)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            animation: "floatWrench 3s ease-in-out infinite",
            marginBottom: "1rem",
            display: "inline-block",
          }}
        >
          🔧
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            marginBottom: "1rem",
            textShadow: "0 0 15px #00eaff",
            fontWeight: "700",
          }}
        >
          Under Maintenance
        </h1>

        <div
          style={{
            border: "4px solid rgba(0, 255, 255, 0.4)",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            margin: "1rem auto",
            animation: "spinLoader 1.2s linear infinite",
          }}
        />

        <p
          style={{
            fontSize: "1.2rem",
            color: "#a0f8ff",
            textShadow: "0 0 8px #00eaff",
          }}
        >
          We’re upgrading your experience.
          <br />
          Please come back soon.
        </p>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "1rem",
            opacity: 0.8,
          }}
        >
          — ManoMed AI
        </p>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.25); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6); }
          100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.25); }
        }

        @keyframes floatWrench {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }

        @keyframes spinLoader {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
