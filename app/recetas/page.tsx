"use client";
import { useEffect, useState } from "react";

type Insumo = { id: number; nombre: string; precio: number; unidad: string; cantidad: number };
type IngredienteReceta = { insumoId: number; nombre: string; cantidad: number; unidad: string; costo: number };
type Receta = { id: number; productoNombre: string; ingredientes: IngredienteReceta[]; costoTotal: number; fechaCreacion: string };

export default function RecetasPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productoNombre, setProductoNombre] = useState("");
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState("");
  const [cantidadIngrediente, setCantidadIngrediente] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    setInsumos(JSON.parse(localStorage.getItem("insumos_pos") || "[]"));
    setRecetas(JSON.parse(localStorage.getItem("recetas_pos") || "[]"));
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(Math.round(v));

  const agregarIngrediente = () => {
    if (!insumoSeleccionado || !cantidadIngrediente) { alert("Selecciona un insumo y cantidad."); return; }
    const insumo = insumos.find((i) => i.id === Number(insumoSeleccionado));
    if (!insumo) return;
    const precioPorUnidad = insumo.precio / insumo.cantidad;
    const costoIngrediente = precioPorUnidad * Number(cantidadIngrediente);
    const nuevo: IngredienteReceta = {
      insumoId: insumo.id,
      nombre: insumo.nombre,
      cantidad: Number(cantidadIngrediente),
      unidad: insumo.unidad,
      costo: costoIngrediente,
    };
    setIngredientes([...ingredientes, nuevo]);
    setInsumoSeleccionado("");
    setCantidadIngrediente("");
  };

  const quitarIngrediente = (idx: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== idx));
  };

  const costoTotal = ingredientes.reduce((s, i) => s + i.costo, 0);

  const guardarReceta = () => {
    if (!productoNombre.trim()) { alert("Ingresa el nombre del plato."); return; }
    if (ingredientes.length === 0) { alert("Agrega al menos un ingrediente."); return; }
    const nueva: Receta = {
      id: editandoId || Date.now(),
      productoNombre,
      ingredientes,
      costoTotal,
      fechaCreacion: new Date().toLocaleDateString("es-CL"),
    };
    const actualizadas = editandoId
      ? recetas.map((r) => r.id === editandoId ? nueva : r)
      : [nueva, ...recetas];
    localStorage.setItem("recetas_pos", JSON.stringify(actualizadas));
    setRecetas(actualizadas);
    setProductoNombre("");
    setIngredientes([]);
    setEditandoId(null);
  };

  const editar = (r: Receta) => {
    setProductoNombre(r.productoNombre);
    setIngredientes(r.ingredientes);
    setEditandoId(r.id);
    window.scrollTo(0, 0);
  };

  const eliminar = (id: number) => {
    if (!confirm("Eliminar esta receta?")) return;
    const actualizadas = recetas.filter((r) => r.id !== id);
    localStorage.setItem("recetas_pos", JSON.stringify(actualizadas));
    setRecetas(actualizadas);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Recetas</h1>
          <p className="text-zinc-400 mt-1">Crea la receta de cada plato con sus ingredientes y costos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-5">{editandoId ? "Editar receta" : "Nueva receta"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-1 block">Nombre del plato</label>
                <input value={productoNombre} onChange={(e) => setProductoNombre(e.target.value)} placeholder="Ej: Hamburguesa, Pizza Margherita..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
              </div>

              <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                <p className="text-sm font-bold text-zinc-400 mb-3">Agregar ingrediente</p>
                {insumos.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-zinc-500 text-sm">Sin insumos registrados.</p>
                    <a href="/insumos" className="text-orange-400 text-sm hover:underline">Ir a registrar insumos</a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <select value={insumoSeleccionado} onChange={(e) => setInsumoSeleccionado(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white">
                      <option value="">Selecciona un insumo...</option>
                      {insumos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nombre} ($ {new Intl.NumberFormat("es-CL").format(Math.round(i.precio / i.cantidad))} por {i.unidad})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input type="number" value={cantidadIngrediente} onChange={(e) => setCantidadIngrediente(e.target.value)} placeholder="Cantidad..." className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" />
                      <button onClick={agregarIngrediente} className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-black hover:bg-orange-400">
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {ingredientes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-zinc-400">Ingredientes de la receta:</p>
                  {ingredientes.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center rounded-xl bg-zinc-800 p-3">
                      <div>
                        <p className="font-bold text-sm">{ing.nombre}</p>
                        <p className="text-zinc-400 text-xs">{ing.cantidad} {ing.unidad}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-bold text-sm">$ {fmt(ing.costo)}</span>
                        <button onClick={() => quitarIngrediente(idx)} className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold">X</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between rounded-xl border border-orange-500/40 bg-orange-500/10 p-3">
                    <span className="font-bold">Costo total</span>
                    <span className="text-orange-400 font-bold">$ {fmt(costoTotal)}</span>
                  </div>
                </div>
              )}

              <button onClick={guardarReceta} className="w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400">
                {editandoId ? "Guardar cambios" : "Guardar receta"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Mis recetas ({recetas.length})</h2>
              <a href="/costeo" className="rounded-xl bg-green-600 px-4 py-2 font-bold text-sm hover:bg-green-500">
                Ver costeo
              </a>
            </div>
            {recetas.length === 0 ? (
              <p className="text-zinc-400">Sin recetas creadas.</p>
            ) : (
              <div className="space-y-3">
                {recetas.map((r) => (
                  <div key={r.id} className="rounded-xl bg-zinc-800 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{r.productoNombre}</p>
                        <p className="text-zinc-400 text-sm">{r.ingredientes.length} ingredientes · {r.fechaCreacion}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editar(r)} className="rounded-lg bg-zinc-700 px-3 py-1 text-sm font-bold hover:bg-zinc-600">Editar</button>
                        <button onClick={() => eliminar(r.id)} className="rounded-lg bg-red-600 px-3 py-1 text-sm font-bold hover:bg-red-500">X</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                      <span className="text-zinc-400 text-sm">Costo de produccion</span>
                      <span className="text-orange-400 font-bold">$ {fmt(r.costoTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
