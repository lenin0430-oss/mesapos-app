"use client";
import { useEffect, useState } from "react";

type IngredienteReceta = { insumoId: number; nombre: string; cantidad: number; unidad: string; costo: number };
type Receta = { id: number; productoNombre: string; ingredientes: IngredienteReceta[]; costoTotal: number };

export default function CosteoPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [margenDeseado, setMargenDeseado] = useState(70);

  useEffect(() => {
    setRecetas(JSON.parse(localStorage.getItem("recetas_pos") || "[]"));
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(Math.round(v));

  const precioSugerido = (costo: number) => costo / (1 - margenDeseado / 100);

  const evaluarMargen = (costo: number, precioVenta: number) => {
    if (precioVenta === 0) return { pct: 0, color: "text-zinc-400", label: "Sin precio", emoji: "" };
    const margen = ((precioVenta - costo) / precioVenta) * 100;
    if (margen >= 65) return { pct: margen, color: "text-green-400", label: "Excelente", emoji: "✅" };
    if (margen >= 50) return { pct: margen, color: "text-yellow-400", label: "Aceptable", emoji: "⚠️" };
    return { pct: margen, color: "text-red-400", label: "Bajo", emoji: "🚨" };
  };

  const [precios, setPrecios] = useState<Record<number, string>>({});

  const setPrecio = (id: number, valor: string) => {
    setPrecios((prev) => ({ ...prev, [id]: valor }));
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Costeo de platos</h1>
          <p className="text-zinc-400 mt-1">Ve el costo real de cada plato y el precio sugerido de venta.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Margen deseado</h2>
          <p className="text-zinc-400 text-sm mb-4">Define que porcentaje de ganancia quieres en cada plato.</p>
          <div className="flex gap-3 flex-wrap">
            {[50, 60, 65, 70, 75, 80].map((m) => (
              <button key={m} onClick={() => setMargenDeseado(m)}
                className={margenDeseado === m ? "rounded-xl bg-orange-500 text-black font-bold px-5 py-3" : "rounded-xl bg-zinc-800 font-bold px-5 py-3 hover:bg-zinc-700"}>
                {m}%
              </button>
            ))}
          </div>
        </div>

        {recetas.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-zinc-400 mb-4">No hay recetas creadas todavia.</p>
            <a href="/recetas" className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400">
              Crear recetas
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {recetas.map((r) => {
              const precioActual = Number(precios[r.id] || 0);
              const sugerido = precioSugerido(r.costoTotal);
              const evaluacion = evaluarMargen(r.costoTotal, precioActual);
              return (
                <div key={r.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{r.productoNombre}</h3>
                      <p className="text-zinc-400 text-sm mt-1">{r.ingredientes.length} ingredientes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-sm">Costo de produccion</p>
                      <p className="text-2xl font-bold text-red-400">$ {fmt(r.costoTotal)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                      <p className="text-red-400 text-sm font-bold">Costo real</p>
                      <p className="text-2xl font-bold text-red-400">$ {fmt(r.costoTotal)}</p>
                    </div>
                    <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                      <p className="text-orange-400 text-sm font-bold">Precio sugerido ({margenDeseado}%)</p>
                      <p className="text-2xl font-bold text-orange-400">$ {fmt(sugerido)}</p>
                    </div>
                    <div className={`rounded-xl border p-4 ${evaluacion.color === "text-green-400" ? "border-green-500/30 bg-green-500/10" : evaluacion.color === "text-yellow-400" ? "border-yellow-500/30 bg-yellow-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                      <p className={`text-sm font-bold ${evaluacion.color}`}>Margen actual {evaluacion.emoji}</p>
                      <p className={`text-2xl font-bold ${evaluacion.color}`}>{evaluacion.pct.toFixed(1)}%</p>
                      <p className={`text-sm ${evaluacion.color}`}>{evaluacion.label}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-zinc-400 mb-2 block">Precio de venta actual $ (para calcular tu margen real)</label>
                    <input
                      type="number"
                      value={precios[r.id] || ""}
                      onChange={(e) => setPrecio(r.id, e.target.value)}
                      placeholder="Ingresa el precio al que lo vendes..."
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
                    />
                  </div>

                  <div className="mt-4 rounded-xl bg-zinc-800 p-4">
                    <p className="text-sm font-bold text-zinc-400 mb-2">Desglose de ingredientes</p>
                    <div className="space-y-1">
                      {r.ingredientes.map((ing, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-zinc-300">{ing.nombre} ({ing.cantidad} {ing.unidad})</span>
                          <span className="text-orange-400 font-bold">$ {fmt(ing.costo)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <a href="/insumos" className="rounded-xl bg-zinc-700 px-5 py-3 font-bold hover:bg-zinc-600">Insumos</a>
          <a href="/recetas" className="rounded-xl bg-zinc-700 px-5 py-3 font-bold hover:bg-zinc-600">Recetas</a>
        </div>
      </div>
    </main>
  );
}
