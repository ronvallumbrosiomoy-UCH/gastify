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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">💰</div>
        <h1 className="text-2xl font-bold text-graphite-brand">Gastify</h1>
        <p className="text-text-secondary mt-2">Cargando tu espacio financiero...</p>
      </div>
    </div>
  );
}