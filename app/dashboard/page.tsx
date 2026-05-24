"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { window.location.href = "/login"; return; }
      setVerificando(false);
    };
    verificar();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (verificando) return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Verificando sesion...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Panel MesaPOS</h1>
            <p className="text-zinc-400 mt-2">Sistema de punto de venta</p>
          </div>
          <button onClick={cerrarSesion} className="rounded-xl bg-zinc-800 px-4 py-2 font-bold hover:bg-zinc-700 text-sm">
            Cerrar sesion
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <a href="/pedidos" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Mesas</h2>
            <p className="text-zinc-400">Tomar pedidos por mesa.</p>
          </a>
          <a href="/pedidos/enviados" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Pedidos activos</h2>
            <p className="text-zinc-400">Ver, cobrar y gestionar pedidos.</p>
          </a>
          <a href="/pedidos/cierres" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Cierres de caja</h2>
            <p className="text-zinc-400">Historial de cierres y reportes.</p>
          </a>
          <a href="/productos" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Productos</h2>
            <p className="text-zinc-400">Crear, editar precios y disponibilidad.</p>
          </a>
          <a href="/categorias" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Categorias</h2>
            <p className="text-zinc-400">Ordenar productos por tipo.</p>
          </a>
          <a href="/mesas" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Mesas</h2>
            <p className="text-zinc-400">Configurar mesas del local.</p>
          </a>
          <a href="/carta" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Carta QR</h2>
            <p className="text-zinc-400">Menu digital para clientes.</p>
          </a>
          <a href="/configuracion" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Configuracion</h2>
            <p className="text-zinc-400">Nombre, moneda y carta QR.</p>
          </a>
          <a href="/gastos" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Gastos</h2>
            <p className="text-zinc-400">Control de costos y margen real.</p>
          </a>
          <a href="/insumos" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Insumos</h2>
            <p className="text-zinc-400">Ingredientes y precios de compra.</p>
          </a>
          <a href="/recetas" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Recetas</h2>
            <p className="text-zinc-400">Costo de produccion por plato.</p>
          </a>
          <a href="/costeo" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Costeo</h2>
            <p className="text-zinc-400">Precio sugerido y margen por plato.</p>
          </a>
          <a href="/stock" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition">
            <h2 className="text-xl font-bold mb-2">Stock</h2>
            <p className="text-zinc-400">Alertas de ingredientes bajos.</p>
          </a>
        </div>
      </div>
    </main>
  );
}
