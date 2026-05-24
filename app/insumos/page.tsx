"use client";
import { useEffect, useState } from "react";

type Unidad = "kg" | "g" | "L" | "ml" | "unidad" | "porciones";
type Insumo = { id: number; nombre: string; precio: number; unidad: Unidad; cantidad: number; proveedor: string; fechaActualizacion: string };

const unidades: Unidad[] = ["kg", "g", "L", "ml", "unidad", "porciones"];

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidad, setUnidad] = useState<Unidad>("kg");
  const [cantidad, setCantidad] = useState("1");
  const [proveedor, setProveedor] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const g = JSON.parse(localStorage.getItem("insumos_pos") || "[]");
    setInsumos(g);
  }, []);

  const guardar = (data: Insumo[]) => {
    localStorage.setItem("insumos_pos", JSON.stringify(data));
    setInsumos(data);
  };

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(Math.round(v));

  const limpiar = () => {
    setNombre(""); setPrecio(""); setUnidad("kg");
    setCantidad("1"); setProveedor(""); setEditandoId(null);
  };

  const agregarOEditar = () => {
    if (!nombre.trim() || !precio) { alert("Completa nombre y precio."); return; }
    if (editandoId) {
      const actualizados = insumos.map((i) => {
        if (i.id !== editandoId) return i;
        const precioAnterior = i.precio;
        const precioNuevo = Number(precio);
        if (precioNuevo > precioAnterior * 1.1) {
          alert("Alerta: El precio de " + nombre + " subio mas de 10% vs la ultima compra.");
        }
        return { ...i, nombre, precio: precioNuevo, unidad, cantidad: Number(cantidad), proveedor, fechaActualizacion: new Date().toLocaleDateString("es-CL") };
      });
      guardar(actualizados);
    } else {
      const nuevo: Insumo = {
        id: Date.now(), nombre, precio: Number(precio),
        unidad, cantidad: Number(cantidad), proveedor,
        fechaActualizacion: new Date().toLocaleDateString("es-CL"),
      };
      guardar([nuevo, ...insumos]);
    }
    limpiar();
  };

  const editar = (i: Insumo) => {
    setNombre(i.nombre); setPrecio(String(i.precio));
    setUnidad(i.unidad); setCantidad(String(i.cantidad));
    setProveedor(i.proveedor); setEditandoId(i.id);
  };

  const eliminar = (id: number) => {
    if (!confirm("Eliminar este insumo?")) return;
    guardar(insumos.filter((i) => i.id !== id));
  };

  const precioPorUnidadBase = (i: Insumo) => i.precio / i.cantidad;

  const filtrados = insumos.filter((i) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.proveedor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Insumos</h1>
          <p className="text-zinc-400 mt-1">Registra tus ingredientes y su precio de compra.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-5">{editandoId ? "Editar insumo" : "Agregar insumo"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-1 block">Nombre del insumo</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Aceite, Pollo, Harina..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-zinc-400 mb-1 block">Precio $</label>
                  <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-400 mb-1 block">Cantidad</label>
                  <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="1" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-2 block">Unidad</label>
                <div className="flex flex-wrap gap-2">
                  {unidades.map((u) => (
                    <button key={u} onClick={() => setUnidad(u)} className={unidad === u ? "rounded-xl bg-orange-500 text-black font-bold px-3 py-2 text-sm" : "rounded-xl bg-zinc-800 font-bold px-3 py-2 text-sm hover:bg-zinc-700"}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-1 block">Proveedor</label>
                <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Ej: Mayorista X..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
              </div>
              <div className="flex gap-2">
                <button onClick={agregarOEditar} className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400">
                  {editandoId ? "Guardar cambios" : "Agregar"}
                </button>
                {editandoId && (
                  <button onClick={limpiar} className="rounded-xl bg-zinc-700 px-4 py-3 font-bold hover:bg-zinc-600">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Mis insumos ({insumos.length})</h2>
              <a href="/recetas" className="rounded-xl bg-zinc-700 px-4 py-2 font-bold text-sm hover:bg-zinc-600">
                Ir a Recetas
              </a>
            </div>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar insumo o proveedor..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white mb-4" />
            {filtrados.length === 0 ? (
              <p className="text-zinc-400">Sin insumos registrados.</p>
            ) : (
              <div className="space-y-3">
                {filtrados.map((i) => (
                  <div key={i.id} className="rounded-xl bg-zinc-800 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{i.nombre}</p>
                        <p className="text-zinc-400 text-sm">{i.proveedor || "Sin proveedor"} · {i.fechaActualizacion}</p>
                        <p className="text-zinc-400 text-sm mt-1">
                          {i.cantidad} {i.unidad} = <span className="text-orange-400 font-bold">$ {fmt(i.precio)}</span>
                        </p>
                        <p className="text-zinc-500 text-xs mt-1">
                          Precio por {i.unidad}: $ {fmt(precioPorUnidadBase(i))}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editar(i)} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-bold hover:bg-zinc-600">
                          Editar
                        </button>
                        <button onClick={() => eliminar(i.id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold hover:bg-red-500">
                          X
                        </button>
                      </div>
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
