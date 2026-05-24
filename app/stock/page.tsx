"use client";
import { useEffect, useState } from "react";

type Insumo = { id: number; nombre: string; precio: number; unidad: string; cantidad: number; proveedor: string };
type StockItem = { insumoId: number; nombre: string; unidad: string; stockActual: number; stockMinimo: number; estado: "ok" | "bajo" | "agotado" };

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [valorActual, setValorActual] = useState("");
  const [valorMinimo, setValorMinimo] = useState("");

  useEffect(() => {
    const insumos: Insumo[] = JSON.parse(localStorage.getItem("insumos_pos") || "[]");
    const stockGuardado: StockItem[] = JSON.parse(localStorage.getItem("stock_pos") || "[]");

    const stockActualizado = insumos.map((insumo) => {
      const existente = stockGuardado.find((s) => s.insumoId === insumo.id);
      if (existente) return existente;
      return {
        insumoId: insumo.id,
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        stockActual: insumo.cantidad,
        stockMinimo: insumo.cantidad * 0.2,
        estado: "ok" as const,
      };
    });

    const conEstado = stockActualizado.map((item) => ({
      ...item,
      estado: calcularEstado(item.stockActual, item.stockMinimo),
    }));

    setStock(conEstado);
    localStorage.setItem("stock_pos", JSON.stringify(conEstado));
  }, []);

  const calcularEstado = (actual: number, minimo: number): "ok" | "bajo" | "agotado" => {
    if (actual <= 0) return "agotado";
    if (actual <= minimo) return "bajo";
    return "ok";
  };

  const guardar = (id: number) => {
    const actualizado = stock.map((item) => {
      if (item.insumoId !== id) return item;
      const nuevoActual = Number(valorActual);
      const nuevoMinimo = Number(valorMinimo);
      return {
        ...item,
        stockActual: nuevoActual,
        stockMinimo: nuevoMinimo,
        estado: calcularEstado(nuevoActual, nuevoMinimo),
      };
    });
    localStorage.setItem("stock_pos", JSON.stringify(actualizado));
    setStock(actualizado);
    setEditandoId(null);
    setValorActual("");
    setValorMinimo("");
  };

  const editar = (item: StockItem) => {
    setEditandoId(item.insumoId);
    setValorActual(String(item.stockActual));
    setValorMinimo(String(item.stockMinimo));
  };

  const ajustar = (id: number, cantidad: number) => {
    const actualizado = stock.map((item) => {
      if (item.insumoId !== id) return item;
      const nuevoActual = Math.max(0, item.stockActual + cantidad);
      return { ...item, stockActual: nuevoActual, estado: calcularEstado(nuevoActual, item.stockMinimo) };
    });
    localStorage.setItem("stock_pos", JSON.stringify(actualizado));
    setStock(actualizado);
  };

  const agotados = stock.filter((s) => s.estado === "agotado").length;
  const bajos = stock.filter((s) => s.estado === "bajo").length;
  const ok = stock.filter((s) => s.estado === "ok").length;

  const badgeEstado = (estado: string) => {
    if (estado === "agotado") return "bg-red-500/20 text-red-400 border border-red-500/40";
    if (estado === "bajo") return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40";
    return "bg-green-500/20 text-green-400 border border-green-500/40";
  };

  const textoEstado = (estado: string) => {
    if (estado === "agotado") return "Agotado";
    if (estado === "bajo") return "Stock bajo";
    return "OK";
  };

  const fmt = (v: number) => Math.round(v * 100) / 100;

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Control de Stock</h1>
          <p className="text-zinc-400 mt-1">Monitorea tus ingredientes y recibe alertas cuando esten bajos.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center">
            <p className="text-red-400 text-sm font-bold">Agotados</p>
            <p className="text-4xl font-bold text-red-400 mt-1">{agotados}</p>
            {agotados > 0 && <p className="text-red-400 text-xs mt-1">Requieren atencion</p>}
          </div>
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-center">
            <p className="text-yellow-400 text-sm font-bold">Stock bajo</p>
            <p className="text-4xl font-bold text-yellow-400 mt-1">{bajos}</p>
            {bajos > 0 && <p className="text-yellow-400 text-xs mt-1">Pronto a agotarse</p>}
          </div>
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-center">
            <p className="text-green-400 text-sm font-bold">En orden</p>
            <p className="text-4xl font-bold text-green-400 mt-1">{ok}</p>
          </div>
        </div>

        {(agotados > 0 || bajos > 0) && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 mb-8">
            <h2 className="text-lg font-bold text-red-400 mb-3">Alertas de stock</h2>
            <div className="space-y-2">
              {stock.filter((s) => s.estado !== "ok").map((item) => (
                <div key={item.insumoId} className="flex justify-between items-center rounded-xl bg-zinc-900 p-3">
                  <div>
                    <p className="font-bold">{item.nombre}</p>
                    <p className="text-zinc-400 text-sm">
                      {item.estado === "agotado"
                        ? "Sin stock disponible"
                        : `Quedan ${fmt(item.stockActual)} ${item.unidad} — minimo ${fmt(item.stockMinimo)} ${item.unidad}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeEstado(item.estado)}`}>
                    {textoEstado(item.estado)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stock.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-zinc-400 mb-4">No hay insumos registrados.</p>
            <a href="/insumos" className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400">
              Ir a Insumos
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-bold mb-4">Todos los insumos</h2>
            {stock
              .sort((a, b) => {
                const orden = { agotado: 0, bajo: 1, ok: 2 };
                return orden[a.estado] - orden[b.estado];
              })
              .map((item) => (
                <div key={item.insumoId} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  {editandoId === item.insumoId ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">{item.nombre}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeEstado(item.estado)}`}>
                          {textoEstado(item.estado)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="text-sm font-bold text-zinc-400 mb-1 block">Stock actual ({item.unidad})</label>
                          <input type="number" value={valorActual} onChange={(e) => setValorActual(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-zinc-400 mb-1 block">Stock minimo ({item.unidad})</label>
                          <input type="number" value={valorMinimo} onChange={(e) => setValorMinimo(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => guardar(item.insumoId)} className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400">Guardar</button>
                        <button onClick={() => setEditandoId(null)} className="rounded-xl bg-zinc-700 px-4 py-3 font-bold hover:bg-zinc-600">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{item.nombre}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeEstado(item.estado)}`}>
                            {textoEstado(item.estado)}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <span className="text-zinc-400">Stock: <strong className="text-white">{fmt(item.stockActual)} {item.unidad}</strong></span>
                          <span className="text-zinc-400">Minimo: <strong className="text-zinc-300">{fmt(item.stockMinimo)} {item.unidad}</strong></span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${item.estado === "agotado" ? "bg-red-500" : item.estado === "bajo" ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: item.stockMinimo > 0 ? `${Math.min(100, (item.stockActual / (item.stockMinimo * 3)) * 100)}%` : "100%" }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => ajustar(item.insumoId, -1)} className="rounded-lg bg-red-600 px-3 py-2 font-bold hover:bg-red-500">-1</button>
                          <button onClick={() => ajustar(item.insumoId, 1)} className="rounded-lg bg-green-600 px-3 py-2 font-bold hover:bg-green-500">+1</button>
                        </div>
                        <button onClick={() => editar(item)} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-bold hover:bg-zinc-600">Editar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
