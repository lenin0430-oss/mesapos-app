"use client";
import { use, useEffect, useState } from "react";

type Producto = { id: number; nombre: string; precio: number; categoria: string; activo: boolean };
type ProductoPedido = Producto & { cantidad: number };
type PageProps = { params: Promise<{ mesa: string }> };

export default function MesaPedidoPage({ params }: PageProps) {
  const { mesa } = use(params);
  const mesaNombre = mesa.replace("mesa-", "Mesa ");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedido, setPedido] = useState<ProductoPedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [nota, setNota] = useState("");
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [descuentoFijo, setDescuentoFijo] = useState(0);
  const [propina, setPropina] = useState(0);
  const [propinaCustom, setPropinaCustom] = useState("");
  const [mostrarExtras, setMostrarExtras] = useState(false);

  useEffect(() => {
    const guardados = localStorage.getItem("productos_pos");
    const todos: Producto[] = guardados ? JSON.parse(guardados) : [];
    setProductos(todos.filter((p) => p.activo));
    const enviados = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");
    const existe = enviados.find((p: any) => p.mesa === mesaNombre && p.estado === "Enviado");
    if (existe) { setPedido(existe.productos || []); setNota(existe.nota || ""); }
  }, [mesaNombre]);

  const fmt = (v: number) => new Intl.NumberFormat("es-CL").format(Math.round(v));
  const categorias = ["Todas", ...Array.from(new Set(productos.map((p) => p.categoria)))];
  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (categoriaFiltro === "Todas" || p.categoria === categoriaFiltro)
  );

  const agregar = (p: Producto) => {
    const existe = pedido.find((i) => i.id === p.id);
    if (existe) setPedido(pedido.map((i) => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    else setPedido([...pedido, { ...p, cantidad: 1 }]);
  };

  const restar = (id: number) => {
    const item = pedido.find((i) => i.id === id);
    if (!item) return;
    if (item.cantidad === 1) setPedido(pedido.filter((i) => i.id !== id));
    else setPedido(pedido.map((i) => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i));
  };

  const subtotal = pedido.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const montoDescPct = subtotal * (descuentoPct / 100);
  const total = subtotal - montoDescPct - descuentoFijo + propina;

  const guardar = () => {
    if (pedido.length === 0) { alert("Agrega al menos un producto."); return; }
    const enviados = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");
    const nuevo = {
      id: Date.now(), mesa: mesaNombre,
      fecha: new Date().toLocaleString("es-CL"),
      productos: pedido, subtotal, descuentoPct, descuentoFijo, propina, total, nota,
      estado: "Enviado"
    };
    const sinMesa = enviados.filter((p: any) => !(p.mesa === mesaNombre && p.estado === "Enviado"));
    localStorage.setItem("pedidos_enviados", JSON.stringify([nuevo, ...sinMesa]));
    alert("Pedido guardado para " + mesaNombre);
    window.location.href = "/pedidos";
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex justify-between gap-4 mb-8">
        <a href="/pedidos" className="text-orange-400 hover:underline">Volver a mesas</a>
        <a href="/pedidos/enviados" className="text-orange-400 hover:underline">Ver pedidos activos</a>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{mesaNombre}</h1>
        <p className="text-zinc-400 mt-1">Agrega productos al pedido.</p>
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-4">Productos</h2>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white mb-4" />
          <div className="flex flex-wrap gap-2 mb-5">
            {categorias.map((cat) => (
              <button key={cat} onClick={() => setCategoriaFiltro(cat)}
                className={categoriaFiltro === cat ? "rounded-xl bg-orange-500 px-4 py-2 font-bold text-black" : "rounded-xl bg-zinc-800 px-4 py-2 font-bold hover:bg-zinc-700"}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtrados.map((p) => (
              <button key={p.id} onClick={() => agregar(p)} className="rounded-xl bg-zinc-800 p-4 text-left hover:bg-orange-500 hover:text-black transition">
                <h3 className="font-bold">{p.nombre}</h3>
                <p>$ {fmt(p.precio)}</p>
                <p className="text-sm opacity-75">{p.categoria}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Pedido actual</h2>
          {pedido.length === 0 ? <p className="text-zinc-400 mb-4">Sin productos.</p> : (
            <div className="space-y-3 mb-4">
              {pedido.map((item) => (
                <div key={item.id} className="flex justify-between items-center rounded-xl bg-zinc-800 p-3">
                  <div>
                    <p className="font-bold">{item.nombre} <span className="text-orange-400">x{item.cantidad}</span></p>
                    <p className="text-zinc-400 text-sm">$ {fmt(item.precio * item.cantidad)}</p>
                  </div>
                  <button onClick={() => restar(item.id)} className="rounded-lg bg-red-600 px-3 py-2 font-bold">-1</button>
                </div>
              ))}
            </div>
          )}

          <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observacion..." className="w-full min-h-20 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white mb-3" />

          <button onClick={() => setMostrarExtras(!mostrarExtras)} className="w-full rounded-xl border border-zinc-700 py-2 font-bold text-zinc-300 hover:bg-zinc-800 mb-3">
            {mostrarExtras ? "Ocultar extras" : "Descuentos y propina"}
          </button>

          {mostrarExtras && (
            <div className="space-y-4 mb-4 rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
              <div>
                <p className="text-sm text-zinc-400 font-bold mb-2">Descuento %</p>
                <div className="flex gap-2">
                  {[0,5,10,15,20].map((p) => (
                    <button key={p} onClick={() => setDescuentoPct(p)}
                      className={descuentoPct === p ? "flex-1 rounded-lg bg-orange-500 text-black font-bold py-2" : "flex-1 rounded-lg bg-zinc-800 font-bold py-2 hover:bg-zinc-700"}>
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-bold mb-1">Descuento fijo $</p>
                <input type="number" value={descuentoFijo || ""} onChange={(e) => setDescuentoFijo(Number(e.target.value))} placeholder="0" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-bold mb-2">Propina</p>
                <div className="flex gap-2 mb-2">
                  {[0,1000,2000,5000].map((v) => (
                    <button key={v} onClick={() => { setPropina(v); setPropinaCustom(""); }}
                      className={propina === v && propinaCustom === "" ? "flex-1 rounded-lg bg-green-600 text-white font-bold py-2" : "flex-1 rounded-lg bg-zinc-800 font-bold py-2 hover:bg-zinc-700"}>
                      {v === 0 ? "Sin" : "$" + fmt(v)}
                    </button>
                  ))}
                </div>
                <input type="number" value={propinaCustom} onChange={(e) => { setPropinaCustom(e.target.value); setPropina(Number(e.target.value)); }} placeholder="Monto personalizado..." className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" />
              </div>
            </div>
          )}

          <div className="border-t border-zinc-800 pt-4 space-y-2 mb-4">
            <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>$ {fmt(subtotal)}</span></div>
            {descuentoPct > 0 && <div className="flex justify-between text-orange-400"><span>Desc. {descuentoPct}%</span><span>- $ {fmt(montoDescPct)}</span></div>}
            {descuentoFijo > 0 && <div className="flex justify-between text-orange-400"><span>Desc. fijo</span><span>- $ {fmt(descuentoFijo)}</span></div>}
            {propina > 0 && <div className="flex justify-between text-green-400"><span>Propina</span><span>+ $ {fmt(propina)}</span></div>}
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-zinc-700"><span>Total</span><span>$ {fmt(total)}</span></div>
          </div>

          <button onClick={guardar} className="w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400">
            Guardar pedido
          </button>
        </div>
      </section>
    </main>
  );
}
