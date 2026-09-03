"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Identifiants invalides");
      } else {
        toast.success("Connexion réussie");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 flex items-center justify-center bg-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d4a2f] to-[#1f3520] opacity-20 pointer-events-none" />

      
      <div className="w-full max-w-[420px] p-8 relative z-10">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(201,242,102,0.3)] mb-6">
            <span className="text-bg font-bold text-xl">O</span>
          </div>
          <h1 className="text-3xl font-normal tracking-tight text-ink">
            Bienvenue sur OyaMarket
          </h1>
          <p className="text-ink-3 mt-3 text-sm">
            Connectez-vous à votre espace administrateur
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-[18px]">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-bg-elev border border-line py-3 px-4 text-[14px] text-ink placeholder:text-ink-4 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="admin@oyamarket.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-bg-elev border border-line py-3 px-4 text-[14px] text-ink placeholder:text-ink-4 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 px-5 font-medium text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
