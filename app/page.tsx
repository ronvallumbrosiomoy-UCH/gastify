"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  return (
    <div className="bg-apple" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="floating-blob blob-green" style={{ width: "300px", height: "300px", top: "80px", left: "40px" }} />
      <div className="floating-blob blob-purple" style={{ width: "400px", height: "400px", bottom: "80px", right: "40px", animationDelay: "1s" }} />
      <div className="animate-fadeIn" style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ display: "inline-flex", marginBottom: "24px", position: "relative" }}>
          <div className="empty-state-icon empty-state-icon-green" style={{ width: "64px", height: "64px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 10 }}>
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--gray-900)", marginBottom: "8px" }}>Gastify</h1>
        <p style={{ fontSize: "16px", color: "var(--gray-500)", marginBottom: "24px" }}>Tu dinero, tu control.</p>
        <div className="spinner spinner-dark" style={{ width: "32px", height: "32px", margin: "0 auto" }} />
      </div>
    </div>
  );
}
