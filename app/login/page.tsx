"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@lafelicitta.cl");
  const [password, setPassword] = useState("Mesa123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Correo o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">MesaPOS</h1>
        <p className="text-zinc-400 mb-8">
          Ingresa al panel de administración
        </p>

        <label className="block text-sm mb-2">Correo</label>
        <input
          className="w-full mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-700 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-sm mb-2">Contraseña</label>
        <input
          className="w-full mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-700 outline-none"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-60 rounded-lg p-3 font-semibold"
        >
          {loading ? "Entrando..." : "Ingresar"}
        </button>
      </div>
    </main>
  );
}