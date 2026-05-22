"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setEmail(data.user.email || "");
    };

    cargarUsuario();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold">Panel MesaPOS</h1>
            <p className="text-zinc-400 mt-2">Usuario: {email}</p>
          </div>

          <button
            onClick={cerrarSesion}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <a
            href="/productos"
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500"
          >
            <h2 className="text-xl font-bold mb-2">Productos</h2>
            <p className="text-zinc-400">Crear, editar precios y disponibilidad.</p>
          </a>

          <a href="/categorias" className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500">
            <h2 className="text-xl font-bold mb-2">Categorías</h2>
            <p className="text-zinc-400">Ordenar productos por tipo.</p>
          </a>

          <a href="/mesas" className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500">
            <h2 className="text-xl font-bold mb-2">Mesas</h2>
            <p className="text-zinc-400">Configurar mesas del local.</p>
          </a>
        </div>
      </div>
    </main>
  );
}
