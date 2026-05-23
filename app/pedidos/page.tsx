"use client";

import { useEffect, useState } from "react";

type EstadoMesa = "Libre" | "Ocupada" | "Por cobrar";
type Mesa = { id: number; nombre: string; estado: EstadoMesa; total?: number };

const mesasBase: Mesa[] = [
  { id: 1, nombre: "Mesa 1", estado: "Libre" },
  { id: 2, nombre: "Mesa 2", estado: "Libre" },
  { id: 3, nombre: "Mesa 3", estado: "Libre" },
  { id: 4, nombre: "Mesa 4", estado: "Libre" },
  { id: 5, nombre: "Mesa 5", estado: "Libre" },
  { id: 6, nombre: "Mesa 6", estado: "Libre" },
];

export default function PedidosPage() {
  const [mesas, setMesas] = useState<Mesa[]>(mesasBase);

  useEffect(() => {
    const enviados = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");
    const config = JSON.parse(localStorage.getItem("mesas_pos") || JSON.stringify(mesasBase));
    const actualizadas: Mesa[] = config.map((mesa: any) => {
      const n = mesa.nombre;
      const activo = enviados.find((p: any) => p.mesa === n && (p.estado === "Enviado" || p.estado === "En preparacion"));
      const cobrar = enviados.find((p: any) => p.mesa === n && p.estado === "Por cobrar");
      if (cobrar) return { ...mesa, estado: "Por cobrar", total: cobrar.total };
      if (activo) return { ...mesa, estado: "Ocupada", total: activo.total };
      return { ...mesa, estado: "Libre", total: undefined };
    });
    setMesas(actualizadas);
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(v);
  const border = (e: EstadoMesa) => e === "Libre" ? "border-zinc-800 hover:border-green-500" : e === "Ocupada" ? "border-yellow-500" : "border-red-500";
  const badge = (e: EstadoMesa) => e === "Libre" ? "bg-green-500/20 text-green-400 border border-green-500/40" : e === "Ocupada" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40";
  const btnColor = (e: EstadoMesa) => e === "Libre" ? "bg-orange-500 text-black" : e === "Ocupada" ? "bg-yellow-500 text-black" : "bg-red-500 text-white";
  const btnTexto = (e: EstadoMesa) => e === "Libre" ? "Tomar pedido" : e === "Ocupada" ? "Ver pedido" : "Cobrar mesa";
  const libres = mesas.filter((m) => m.estado === "Libre").length;
  const ocupadas = mesas.filter((m) => m.estado === "Ocupada").length;
  const porCobrar = mesas.filter((m) => m.estado === "Por cobrar").length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Mesas</h1>
          <p className="text-zinc-400 mt-1">Selecciona una mesa para tomar el pedido.</p>
        </div>
        <a href="/pedidos/enviados" className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black hover:bg-orange-400 transition">
          Ver pedidos activos
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
          <p className="text-green-400 text-sm font-bold">Libres</p>
          <p className="text-3xl font-bold text-green-400">{libres}</p>
        </div>
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
          <p className="text-yellow-400 text-sm font-bold">Ocupadas</p>
          <p className="text-3xl font-bold text-yellow-400">{ocupadas}</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-400 text-sm font-bold">Por cobrar</p>
          <p className="text-3xl font-bold text-red-400">{porCobrar}</p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesas.map((mesa) => (
          
            key={mesa.id}
            href={"/pedidos/" + mesa.nombre.toLowerCase().replace(" ", "-")}
            className={"rounded-2xl border bg-zinc-900 p-6 transition " + border(mesa.estado)}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">{mesa.nombre}</h2>
              <span className={"rounded-full px-3 py-1 text-xs font-bold " + badge(mesa.estado)}>
                {mesa.estado}
              </span>
            </div>
            {mesa.total && mesa.estado !== "Libre" ? (
              <p className="text-zinc-300 font-bold text-lg mb-4">$ {fmt(mesa.total)}</p>
            ) : (
              <p className="text-zinc-600 mb-4">Sin pedido activo</p>
            )}
            <div className={"rounded-xl py-3 text-center font-bold text-sm " + btnColor(mesa.estado)}>
              {btnTexto(mesa.estado)}
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
