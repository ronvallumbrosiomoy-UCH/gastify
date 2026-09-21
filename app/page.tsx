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
    <div className="min-h-screen flex items-center justify-center gradient-mesh">
      <div className="text-center animate-fadeIn">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-brand to-emerald-brand/80 flex items-center justify-center mx-auto mb-8 shadow-xl">
          <span className="text-5xl">💰</span>
        </div>
        <h1 className="text-4xl font-bold text-graphite-brand tracking-tight mb-4">
          Gastify
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          Tu dinero, tu control.
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-emerald-brand/20 border-t-emerald-brand rounded-full animate-spin" />
          <p className="text-text-secondary">Cargando tu espacio financiero...</p>
        </div>
      </div>
    </div>
  );
}
