"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Mesa = {
  id: string;
  nombre: string;
  activa: boolean;
};

export default function MesasPage() {
  const router = useRouter();

  const [empresaId, setEmpresaId] = useState("");
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", userData.user.id)
      .single();

    if (!perfil) {
      setLoading(false);
      return;
    }

    setEmpresaId(perfil.empresa_id);

    const { data } = await supabase
      .from("mesas")
      .select("id, nombre, activa")
      .eq("empresa_id", perfil.empresa_id)
      .order("nombre", { ascending: true });

    setMesas(data || []);
    setLoading(false);
  };

  const crearMesa = async () => {
    if (!nuevoNombre || !empresaId) return;

    await supabase.from("mesas").insert({
      empresa_id: empresaId,
      nombre: nuevoNombre,
      activa: true,
    });

    setNuevoNombre("");
    cargarMesas();
  };

  const cambiarEstado = async (id: string, activa: boolean) => {
    await supabase.from("mesas").update({ activa }).eq("id", id);
    cargarMesas();
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Mesas</h1>
            <p className="text-zinc-400 mt-2">Crea y administra las mesas del local.</p>
          </div>

          <a href="/dashboard" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg">
            Volver
          </a>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 mb-8">
          <h2 className="text-2xl font-bold mb-4">Agregar mesa</h2>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="Ejemplo: Mesa 1"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-3"
            />

            <button
              onClick={crearMesa}
              className="bg-orange-600 hover:bg-orange-500 rounded-lg p-3 font-semibold"
            >
              Agregar
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando mesas...</p>
        ) : (
          <div className="space-y-4">
            {mesas.map((mesa) => (
              <div
                key={mesa.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-xl font-bold">{mesa.nombre}</h2>
                  <p className="mt-2 text-sm">
                    Estado:{" "}
                    <span className={mesa.activa ? "text-green-400" : "text-red-400"}>
                      {mesa.activa ? "Activa" : "Inactiva"}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => cambiarEstado(mesa.id, !mesa.activa)}
                  className="bg-orange-600 hover:bg-orange-500 rounded-lg px-4 py-3 font-semibold"
                >
                  {mesa.activa ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
