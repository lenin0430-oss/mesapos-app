"use client";
import { useEffect, useState } from "react";

type CategoriaGasto = "Ingredientes" | "Personal" | "Servicios" | "Arriendo" | "Delivery" | "Otro";
type Gasto = { id: number; descripcion: string; monto: number; categoria: CategoriaGasto; fecha: string };

const categorias: CategoriaGasto[] = ["Ingredientes", "Personal", "Servicios", "Arriendo", "Delivery", "Otro"];

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState<CategoriaGasto>("Ingredientes");
  const [ventasHoy, setVentasHoy] = useState(0);
  const [filtroFecha, setFiltroFecha] = useState("");

  useEffect(() => {
    const g = JSON.parse(localStorage.getItem("gastos_pos") || "[]");
    setGastos(g);
    const hoy = new Date().toLocaleDateString("es-CL");
    setFiltroFecha(hoy);
    const pedidos = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");
    const totalHoy = pedidos
      .filter((p: any) => p.estado === "Entregado" && p.fecha?.startsWith(hoy.split("/").reverse().join("-")))
      .reduce((s: number, p: any) => s + (p.total || 0), 0);
    setVentasHoy(totalHoy);
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(Math.round(v));

  const agregarGasto = () => {
    if (!descripcion.trim() || !monto) { alert("Completa todos los campos."); return; }
    const nuevo: Gasto = {
      id: Date.now(),
      descripcion: descripcion.trim(),
      monto: Number(monto),
      categoria,
      fecha: new Date().toLocaleString("es-CL"),
    };
    const actualizados = [nuevo, ...gastos];
    localStorage.setItem("gastos_pos", JSON.stringify(actualizados));
    setGastos(actualizados);
    setDescripcion("");
    setMonto("");
  };

  const eliminarGasto = (id: number) => {
    if (!confirm("Eliminar este gasto?")) return;
    const actualizados = gastos.filter((g) => g.id !== id);
    localStorage.setItem("gastos_pos", JSON.stringify(actualizados));
    setGastos(actualizados);
  };

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const margen = ventasHoy - totalGastos;
  const margenPct = ventasHoy > 0 ? (margen / ventasHoy) * 100 : 0;

  const gastosPorCategoria = categorias.map((cat) => ({
    nombre: cat,
    total: gastos.filter((g) => g.categoria === cat).reduce((s, g) => s + g.monto, 0),
  })).filter((c) => c.total > 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Gastos y Rentabilidad</h1>
          <p className="text-zinc-400 mt-1">Controla tus gastos y ve tu margen real.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
            <p className="text-green-400 text-sm font-bold">Ventas del dia</p>
            <p className="text-3xl font-bold text-green-400 mt-1">$ {fmt(ventasHoy)}</p>
          </div>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-red-400 text-sm font-bold">Gastos registrados</p>
            <p className="text-3xl font-bold text-red-400 mt-1">$ {fmt(totalGastos)}</p>
          </div>
          <div className={`rounded-2xl border p-5 ${margen >= 0 ? "border-orange-500/30 bg-orange-500/10" : "border-red-600/30 bg-red-600/10"}`}>
            <p className={`text-sm font-bold ${margen >= 0 ? "text-orange-400" : "text-red-400"}`}>Margen real</p>
            <p className={`text-3xl font-bold mt-1 ${margen >= 0 ? "text-orange-400" : "text-red-400"}`}>$ {fmt(margen)}</p>
            <p className={`text-sm mt-1 ${margen >= 0 ? "text-orange-400" : "text-red-400"}`}>{margenPct.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-5">Registrar gasto</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-1 block">Descripcion</label>
                <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Compra de ingredientes..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-1 block">Monto $</label>
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-2 block">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <button key={cat} onClick={() => setCategoria(cat)} className={categoria === cat ? "rounded-xl bg-orange-500 text-black font-bold px-3 py-2 text-sm" : "rounded-xl bg-zinc-800 font-bold px-3 py-2 text-sm hover:bg-zinc-700"}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={agregarGasto} className="w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400">
                Agregar gasto
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">Por categoria</h2>
            {gastosPorCategoria.length === 0 ? (
              <p className="text-zinc-400">Sin gastos registrados.</p>
            ) : (
              <div className="space-y-3">
                {gastosPorCategoria.map((cat) => (
                  <div key={cat.nombre} className="flex justify-between items-center rounded-xl bg-zinc-800 p-3">
                    <span className="font-bold">{cat.nombre}</span>
                    <span className="text-red-400 font-bold">$ {fmt(cat.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center rounded-xl border border-red-500/40 bg-red-500/10 p-3">
                  <span className="font-bold">Total gastos</span>
                  <span className="text-red-400 font-bold">$ {fmt(totalGastos)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-4">Historial de gastos</h2>
          {gastos.length === 0 ? (
            <p className="text-zinc-400">Sin gastos registrados.</p>
          ) : (
            <div className="space-y-3">
              {gastos.map((g) => (
                <div key={g.id} className="flex justify-between items-center rounded-xl bg-zinc-800 p-4">
                  <div>
                    <p className="font-bold">{g.descripcion}</p>
                    <p className="text-zinc-400 text-sm">{g.categoria} · {g.fecha}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-bold">$ {fmt(g.monto)}</span>
                    <button onClick={() => eliminarGasto(g.id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold hover:bg-red-500">X</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
