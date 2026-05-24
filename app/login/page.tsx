"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!email || !password) { setError("Ingresa email y contraseña."); return; }
    setCargando(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500">MesaPOS</h1>
          <p className="text-zinc-400 mt-2">Sistema de punto de venta</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-bold mb-6">Iniciar sesion</h2>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/40 p-4 mb-4">
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-zinc-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-zinc-400 mb-1 block">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
              />
            </div>

            <button
              onClick={login}
              disabled={cargando}
              className="w-full rounded-xl bg-orange-500 py-4 font-bold text-black hover:bg-orange-400 transition disabled:opacity-50"
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-zinc-600 text-xs">Powered by MesaPOS</p>
          </div>
        </div>
      </div>
    </main>
  );
}
