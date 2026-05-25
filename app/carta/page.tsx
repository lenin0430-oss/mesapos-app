"use client";
import { useEffect, useState } from "react";
import { cargarCatalogoEmpresa } from "@/lib/catalogo";

type Producto = { id: string; nombre: string; precio: number; categoria: string; descripcion?: string };

export default function CartaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("MesaPOS");
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const empresaIdUrl = params.get("empresa");
      const slugUrl = params.get("slug");

      const catalogo = await cargarCatalogoEmpresa({
        empresaId: empresaIdUrl,
        slug: slugUrl,
      });

      setNombreNegocio(catalogo.nombreEmpresa);
      setProductos(catalogo.productos.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
      })));
    } catch (e) {
      console.error(e);
    }
    setCargando(false);
  };

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(v);
  const categorias = ["Todas", ...Array.from(new Set(productos.map((p) => p.categoria)))];
  const filtrados = productos.filter((p) =>
    (categoriaActiva === "Todas" || p.categoria === categoriaActiva) &&
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const porCategoria = categorias.filter((c) => c !== "Todas").map((cat) => ({
    nombre: cat,
    items: filtrados.filter((p) => p.categoria === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-orange-400">{nombreNegocio}</h1>
              <p className="text-zinc-400 text-sm">Menu digital</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xl">
              {nombreNegocio.charAt(0).toUpperCase()}
            </div>
          </div>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en el menu..." className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-white text-sm mb-3" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categorias.map((cat) => (
              <button key={cat} onClick={() => setCategoriaActiva(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition ${categoriaActiva === cat ? "bg-orange-500 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {cargando ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-zinc-400">Cargando menu...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-zinc-400">El menu se esta preparando...</p>
          </div>
        ) : categoriaActiva === "Todas" ? (
          <div className="space-y-8">
            {porCategoria.map((grupo) => (
              <section key={grupo.nombre}>
                <h2 className="text-lg font-bold text-orange-400 mb-3 border-b border-zinc-800 pb-2">{grupo.nombre}</h2>
                <div className="space-y-3">
                  {grupo.items.map((p) => (
                    <div key={p.id} className="flex justify-between items-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
                      <div>
                        <h3 className="font-bold text-white">{p.nombre}</h3>
                        {p.descripcion && <p className="text-zinc-400 text-sm mt-1">{p.descripcion}</p>}
                      </div>
                      <span className="ml-4 text-orange-400 font-bold text-lg whitespace-nowrap">$ {fmt(p.precio)}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((p) => (
              <div key={p.id} className="flex justify-between items-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
                <div>
                  <h3 className="font-bold text-white">{p.nombre}</h3>
                  {p.descripcion && <p className="text-zinc-400 text-sm mt-1">{p.descripcion}</p>}
                </div>
                <span className="ml-4 text-orange-400 font-bold text-lg whitespace-nowrap">$ {fmt(p.precio)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <p className="text-zinc-600 text-xs">Powered by</p>
          <p className="text-orange-500 font-bold text-sm">MesaPOS</p>
        </div>
      </div>
    </main>
  );
}
