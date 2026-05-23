"use client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Panel MesaPOS</h1>
          <p className="text-zinc-400 mt-2">Sistema de punto de venta</p>
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
        </div>
      </div>
    </main>
  );
}
