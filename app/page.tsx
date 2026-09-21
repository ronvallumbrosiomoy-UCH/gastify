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
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-[15px] text-gray-brand mt-4">Cargando...</p>
      </div>
    </div>
  );
}
