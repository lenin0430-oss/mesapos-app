"use client";

import { useEffect, useState } from "react";

type Mesa = {
  id: number;
  nombre: string;
  activa: boolean;
};

const mesasBase: Mesa[] = [
  { id: 1, nombre: "Mesa 1", activa: true },
  { id: 2, nombre: "Mesa 2", activa: true },
  { id: 3, nombre: "Mesa 3", activa: true },
  { id: 4, nombre: "Mesa 4", activa: true },
  { id: 5, nombre: "Mesa 5", activa: true },
  { id: 6, nombre: "Mesa 6", activa: true },
];

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    const guardadas = localStorage.getItem("mesas_pos");
    if (guardadas) {
      setMesas(JSON.parse(guardadas));
    } else {
      localStorage.setItem("mesas_pos", JSON.stringify(mesasBase));
      setMesas(mesasBase);
    }
  }, []);

  const guardar = (data: Mesa[]) => {
    localStorage.setItem("mesas_pos", JSON.stringify(data));
    setMesas(data);
  };

  const agregarMesa = () => {
    if (!nuevoNombre.trim()) return;
    const nueva: Mesa = {
      id: Date.now(),
      nombre: nuevoNombre.trim(),
      activa: true,
    };
    guardar([...mesas, nueva]);
    setNuevoNombre("");
  };

  const cambiarEstado = (id: number) => {
    guardar(mesas.map((m) => m.id === id ? { ...m, activa: !m.activa } : m));
  };

  const eliminarMesa = (id: number) => {
    if (!confirm("¿Eliminar esta mesa?")) return;
    guardar(mesas.filter((m) => m.id !== id));
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mesas</h1>
            <p className="text-zinc-400 mt-2">Configura las mesas del local.</p>
          </div>
          <a href="/dashboard" className="text-orange-400 hover:underline">← Dashboard</a>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">Agregar mesa</h2>
          <div className="flex gap-3">
            <input
              placeholder="Ej: Mesa 7"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarMesa()}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white"
            />
            <button
              onClick={agregarMesa}
              className="bg-orange-500 hover:bg-orange-400 rounded-xl px-6 py-3 font-bold text-black"
            >
              Agregar
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {mesas.map((mesa) => (
            <div key={mesa.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{mesa.nombre}</h2>
                <p className={`text-sm mt-1 ${mesa.activa ? "text-green-400" : "text-red-400"}`}>
                  {mesa.activa ? "Activa" : "Inactiva"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarEstado(mesa.id)}
                  className="bg-zinc-700 hover:bg-zinc-600 rounded-xl px-4 py-2 font-bold"
                >
                  {mesa.activa ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => eliminarMesa(mesa.id)}
                  className="bg-red-600 hover:bg-red-500 rounded-xl px-4 py-2 font-bold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
