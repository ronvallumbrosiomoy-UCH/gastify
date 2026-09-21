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
    <div className="min-h-[80vh] flex items-center justify-center relative">
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="text-center animate-fadeIn relative z-10">
        <div className="illustration inline-flex mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-graphite-brand mb-3">
          Gastify
        </h1>
        <p className="text-[16px] text-gray-brand mb-6">
          Tu dinero, tu control.
        </p>
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
