"use client";

import { use, useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  activo: boolean;
};

type ProductoPedido = Producto & {
  cantidad: number;
};

type PageProps = {
  params: Promise<{
    mesa: string;
  }>;
};

export default function MesaPedidoPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const mesa = resolvedParams?.mesa || "mesa-1";
  const mesaNombre = mesa.replace("mesa-", "Mesa ");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedido, setPedido] = useState<ProductoPedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [nota, setNota] = useState("");

  useEffect(() => {
    const guardados = localStorage.getItem("productos_pos");
    const productosGuardados: Producto[] = guardados ? JSON.parse(guardados) : [];
    setProductos(productosGuardados.filter((producto) => producto.activo));

    const pedidos = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");
    const pedidoExistente = pedidos.find(
      (pedidoGuardado: any) =>
        pedidoGuardado.mesa === mesaNombre && pedidoGuardado.estado === "Enviado"
    );

    if (pedidoExistente) {
      setPedido(pedidoExistente.productos || []);
      setNota(pedidoExistente.nota || "");
    }
  }, [mesaNombre]);

  const formatoPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-CL").format(valor);
  };

  const categorias = [
    "Todas",
    ...Array.from(new Set(productos.map((producto) => producto.categoria))),
  ];

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "Todas" || producto.categoria === categoriaFiltro;

    return coincideBusqueda && coincideCategoria;
  });

  const agregarProducto = (producto: Producto) => {
    const existe = pedido.find((item) => item.id === producto.id);

    if (existe) {
      setPedido(
        pedido.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
      return;
    }

    setPedido([...pedido, { ...producto, cantidad: 1 }]);
  };

  const restarProducto = (id: number) => {
    const producto = pedido.find((item) => item.id === id);

    if (!producto) return;

    if (producto.cantidad === 1) {
      setPedido(pedido.filter((item) => item.id !== id));
      return;
    }

    setPedido(
      pedido.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
      )
    );
  };

  const total = pedido.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const guardarPedido = () => {
    if (pedido.length === 0) {
      alert("Agrega al menos un producto.");
      return;
    }

    const pedidos = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");

    const nuevoPedido = {
      id: Date.now(),
      mesa: mesaNombre,
      fecha: new Date().toLocaleString("es-CL"),
      productos: pedido,
      total,
      nota,
      estado: "Enviado",
    };

    const pedidosSinMesa = pedidos.filter(
      (pedidoGuardado: any) =>
        !(
          pedidoGuardado.mesa === mesaNombre &&
          pedidoGuardado.estado === "Enviado"
        )
    );

    localStorage.setItem(
      "pedidos_enviados",
      JSON.stringify([nuevoPedido, ...pedidosSinMesa])
    );

    alert(`Pedido guardado para ${mesaNombre}. Total: $ ${formatoPrecio(total)}`);
    window.location.href = "/pedidos";
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex justify-between gap-4 mb-8">
        <a href="/pedidos" className="text-orange-400 hover:underline">
          ← Volver a mesas
        </a>

        <a href="/pedidos/enviados" className="text-orange-400 hover:underline">
          Ver pedidos enviados →
        </a>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{mesaNombre}</h1>
        <p className="text-zinc-400 mt-2">
          Busca productos, selecciona categoría y agrega al pedido.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-4">Productos</h2>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white mb-4"
          />

          <div className="flex flex-wrap gap-2 mb-5">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={
                  categoriaFiltro === cat
                    ? "rounded-xl bg-orange-500 px-4 py-2 font-bold text-black"
                    : "rounded-xl bg-zinc-800 px-4 py-2 font-bold hover:bg-zinc-700"
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {productosFiltrados.map((producto) => (
              <button
                key={producto.id}
                onClick={() => agregarProducto(producto)}
                className="rounded-xl bg-zinc-800 p-4 text-left hover:bg-orange-500 hover:text-black"
              >
                <h3 className="font-bold">{producto.nombre}</h3>
                <p>$ {formatoPrecio(producto.precio)}</p>
                <p className="text-sm opacity-75">{producto.categoria}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Pedido actual</h2>

          {pedido.length === 0 ? (
            <p className="text-zinc-400">No hay productos agregados.</p>
          ) : (
            <div className="space-y-3">
              {pedido.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center rounded-xl bg-zinc-800 p-3"
                >
                  <div>
                    <h3 className="font-bold">
                      {item.nombre}{" "}
                      <span className="text-orange-400">x{item.cantidad}</span>
                    </h3>
                    <p className="text-zinc-400">
                      $ {formatoPrecio(item.precio * item.cantidad)}
                    </p>
                  </div>

                  <button
                    onClick={() => restarProducto(item.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 font-bold"
                  >
                    -1
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Observación del pedido..."
            className="mt-4 w-full min-h-24 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          />

          <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>$ {formatoPrecio(total)}</span>
          </div>

          <button
            onClick={guardarPedido}
            className="mt-4 w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400"
          >
            Guardar pedido
          </button>
        </div>
      </section>
    </main>
  );
}
