"use client";

import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
};

type MetodoPago =
  | "Efectivo"
  | "Débito"
  | "Crédito"
  | "Transferencia"
  | "Mercado Pago"
  | "Cortesía"
  | "Colación empleado";

type PedidoGuardado = {
  id: number;
  mesa: string;
  productos: Producto[];
  total: number;
  fecha: string;
  observacion?: string;
  estado: "Enviado" | "En preparación" | "Entregado" | "Anulado";
  metodoPago?: MetodoPago;
};

const metodosPago: MetodoPago[] = [
  "Efectivo",
  "Débito",
  "Crédito",
  "Transferencia",
  "Mercado Pago",
  "Cortesía",
  "Colación empleado",
];

export default function PedidosEnviadosPage() {
  const [pedidos, setPedidos] = useState<PedidoGuardado[]>([]);
  const [pedidoCobrandoId, setPedidoCobrandoId] = useState<number | null>(null);
  const [mostrarResumenCaja, setMostrarResumenCaja] = useState(false);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("pedidos_enviados") || "[]");
    setPedidos(guardados);
  }, []);

  const pedidosActivos = pedidos.filter(
    (pedido) => pedido.estado !== "Entregado" && pedido.estado !== "Anulado"
  );

  const historial = pedidos.filter(
    (pedido) => pedido.estado === "Entregado" || pedido.estado === "Anulado"
  );

  const totalActivo = pedidosActivos.reduce((sum, pedido) => sum + pedido.total, 0);

  const metodosVentaReal: MetodoPago[] = [
    "Efectivo",
    "Débito",
    "Crédito",
    "Transferencia",
    "Mercado Pago",
  ];

  const totalVendido = pedidos
    .filter(
      (pedido) =>
        pedido.estado === "Entregado" &&
        pedido.metodoPago &&
        metodosVentaReal.includes(pedido.metodoPago)
    )
    .reduce((sum, pedido) => sum + pedido.total, 0);

  const totalCortesia = pedidos
    .filter(
      (pedido) =>
        pedido.estado === "Entregado" && pedido.metodoPago === "Cortesía"
    )
    .reduce((sum, pedido) => sum + pedido.total, 0);

  const totalColacion = pedidos
    .filter(
      (pedido) =>
        pedido.estado === "Entregado" && pedido.metodoPago === "Colación empleado"
    )
    .reduce((sum, pedido) => sum + pedido.total, 0);

  const ventasPorProducto = pedidos
    .filter((pedido) => pedido.estado === "Entregado")
    .flatMap((pedido) => pedido.productos)
    .reduce((acc, producto) => {
      const encontrado = acc.find((item) => item.id === producto.id);

      if (encontrado) {
        encontrado.cantidad += 1;
        encontrado.total += producto.precio;
      } else {
        acc.push({
          id: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          total: producto.precio,
        });
      }

      return acc;
    }, [] as Array<{ id: number; nombre: string; cantidad: number; total: number }>);

  const ventasPorMetodo = metodosPago.map((metodo) => {
    const total = pedidos
      .filter(
        (pedido) =>
          pedido.estado === "Entregado" && pedido.metodoPago === metodo
      )
      .reduce((sum, pedido) => sum + pedido.total, 0);

    return {
      metodo,
      total,
    };
  });

  const formatoPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-CL").format(valor);
  };

  const cambiarEstado = (id: number, nuevoEstado: PedidoGuardado["estado"]) => {
    const actualizados = pedidos.map((pedido) =>
      pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido
    );

    localStorage.setItem("pedidos_enviados", JSON.stringify(actualizados));
    setPedidos(actualizados);
  };

  const cobrarConMetodo = (id: number, metodoPago: MetodoPago) => {
    const actualizados = pedidos.map((pedido) =>
      pedido.id === id
        ? {
            ...pedido,
            estado: "Entregado" as const,
            metodoPago,
          }
        : pedido
    );

    localStorage.setItem("pedidos_enviados", JSON.stringify(actualizados));
    setPedidos(actualizados);
    setPedidoCobrandoId(null);
  };

  const eliminarPedido = (id: number) => {
    if (!confirm("¿Eliminar este pedido?")) {
      return;
    }

    const actualizados = pedidos.filter((pedido) => pedido.id !== id);
    localStorage.setItem("pedidos_enviados", JSON.stringify(actualizados));
    setPedidos(actualizados);
  };

  const verResumenCaja = () => {
    setMostrarResumenCaja(!mostrarResumenCaja);
  };

  const generarTextoResumenCaja = () => {
    const ahora = new Date();
    const cierreId = `${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, "0")}${String(ahora.getDate()).padStart(2, "0")}-${String(ahora.getHours()).padStart(2, "0")}${String(ahora.getMinutes()).padStart(2, "0")}`;

    return [
      `CIERRE #${cierreId}`,
      "LA FELICITTA",
      "RESUMEN DE CAJA",
      `Fecha: ${ahora.toLocaleString("es-CL")}`,
      "",
      `Efectivo: $ ${formatoPrecio(ventasPorMetodo.find((item) => item.metodo === "Efectivo")?.total || 0)}`,
      `Débito: $ ${formatoPrecio(ventasPorMetodo.find((item) => item.metodo === "Débito")?.total || 0)}`,
      `Crédito: $ ${formatoPrecio(ventasPorMetodo.find((item) => item.metodo === "Crédito")?.total || 0)}`,
      `Transferencia: $ ${formatoPrecio(ventasPorMetodo.find((item) => item.metodo === "Transferencia")?.total || 0)}`,
      `Mercado Pago: $ ${formatoPrecio(ventasPorMetodo.find((item) => item.metodo === "Mercado Pago")?.total || 0)}`,
      "",
      `TOTAL VENDIDO REAL: $ ${formatoPrecio(totalVendido)}`,
      `Cortesía: $ ${formatoPrecio(totalCortesia)}`,
      `Colación empleado: $ ${formatoPrecio(totalColacion)}`,
      "",
      `Pedidos en historial: ${historial.length}`,
      "",
      "VENTAS POR PRODUCTO",
      ...ventasPorProducto.map(
        (item) => `${item.nombre} x${item.cantidad}: $ ${formatoPrecio(item.total)}`
      ),
    ].join("\n");
  };

  const copiarResumenCaja = async () => {
    const resumen = generarTextoResumenCaja();

    await navigator.clipboard.writeText(resumen);
    alert("Resumen de caja copiado.");
  };

  const guardarCierreCaja = (limpiarHistorial = false) => {
    const ahora = new Date();
    const cierreId = `${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, "0")}${String(ahora.getDate()).padStart(2, "0")}-${String(ahora.getHours()).padStart(2, "0")}${String(ahora.getMinutes()).padStart(2, "0")}`;

    const cierre = {
      id: cierreId,
      fecha: ahora.toLocaleString("es-CL"),
      efectivo: ventasPorMetodo.find((item) => item.metodo === "Efectivo")?.total || 0,
      debito: ventasPorMetodo.find((item) => item.metodo === "Débito")?.total || 0,
      credito: ventasPorMetodo.find((item) => item.metodo === "Crédito")?.total || 0,
      transferencia: ventasPorMetodo.find((item) => item.metodo === "Transferencia")?.total || 0,
      mercadoPago: ventasPorMetodo.find((item) => item.metodo === "Mercado Pago")?.total || 0,
      totalVendido,
      totalCortesia,
      totalColacion,
      pedidosHistorial: historial.length,
      ventasPorProducto,
      texto: generarTextoResumenCaja(),
    };

    const cierresActuales = JSON.parse(localStorage.getItem("cierres_caja") || "[]");

    const yaExiste = cierresActuales.some((item: { id: string }) => item.id === cierreId);

    if (yaExiste) {
      alert("Este cierre ya fue guardado.");
      return;
    }

    localStorage.setItem("cierres_caja", JSON.stringify([cierre, ...cierresActuales]));

    if (limpiarHistorial) {
      const pedidosActivosRestantes = pedidos.filter(
        (pedido) => pedido.estado !== "Entregado" && pedido.estado !== "Anulado"
      );

      localStorage.setItem("pedidos_enviados", JSON.stringify(pedidosActivosRestantes));
      setPedidos(pedidosActivosRestantes);

      alert("Cierre guardado y caja reiniciada correctamente.");
      window.location.href = "/pedidos/cierres";
      return;
    }

    alert("Cierre de caja guardado correctamente.");
  };

  const imprimirResumenCaja = () => {
    const resumen = generarTextoResumenCaja();
    const ventana = window.open("", "_blank");

    if (!ventana) {
      alert("No se pudo abrir la ventana de impresión.");
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Resumen de caja</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              white-space: pre-line;
              font-size: 16px;
            }
          </style>
        </head>
        <body>${resumen}</body>
      </html>
    `);

    ventana.document.close();
    ventana.print();
  };

  const borrarPedidos = () => {
    if (!confirm("¿Seguro que quieres borrar todos los pedidos?")) {
      return;
    }

    localStorage.removeItem("pedidos_enviados");
    setPedidos([]);
  };

  const agruparProductos = (productos: Producto[]) => {
    return productos.reduce((acc, producto) => {
      const encontrado = acc.find((item) => item.id === producto.id);

      if (encontrado) {
        encontrado.cantidad += 1;
        encontrado.subtotal += producto.precio;
      } else {
        acc.push({
          ...producto,
          cantidad: 1,
          subtotal: producto.precio,
        });
      }

      return acc;
    }, [] as Array<Producto & { cantidad: number; subtotal: number }>);
  };

  const PedidoCard = ({ pedido }: { pedido: PedidoGuardado }) => (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold">{pedido.mesa}</h2>
          <p className="text-zinc-400">{pedido.fecha}</p>
        </div>

        <span
          className={
            pedido.estado === "Anulado"
              ? "rounded-full bg-red-600 px-3 py-1 text-sm font-bold"
              : pedido.estado === "Entregado"
              ? "rounded-full bg-green-600 px-3 py-1 text-sm font-bold"
              : pedido.estado === "En preparación"
              ? "rounded-full bg-yellow-500 text-black px-3 py-1 text-sm font-bold"
              : "rounded-full bg-blue-600 px-3 py-1 text-sm font-bold"
          }
        >
          {pedido.estado}
        </span>
      </div>

      {pedido.metodoPago && (
        <div className="mb-4 rounded-xl border border-green-500/40 bg-green-500/10 p-3">
          <p className="text-sm text-green-300 font-bold">Método de pago</p>
          <p className="text-white">{pedido.metodoPago}</p>
        </div>
      )}

      {pedido.observacion && (
        <div className="mb-4 rounded-xl border border-orange-500/40 bg-orange-500/10 p-3">
          <p className="text-sm text-orange-300 font-bold">Observación</p>
          <p className="text-white">{pedido.observacion}</p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {agruparProductos(pedido.productos).map((producto) => (
          <div
            key={producto.id}
            className="flex justify-between rounded-xl bg-zinc-800 p-3"
          >
            <span>
              {producto.nombre}{" "}
              <strong className="text-orange-400">x{producto.cantidad}</strong>
            </span>
            <span>$ {formatoPrecio(producto.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t border-zinc-800 pt-4 text-xl font-bold">
        <span>Total</span>
        <span>$ {formatoPrecio(pedido.total)}</span>
      </div>

      {pedido.estado !== "Entregado" && pedido.estado !== "Anulado" && (
        <div className="mt-5">
          <a
            href={`/pedidos/mesa-${pedido.mesa.replace("Mesa ", "")}`}
            className="block rounded-xl bg-orange-500 text-black font-bold py-3 text-center"
          >
            Editar pedido
          </a>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => cambiarEstado(pedido.id, "En preparación")}
              className="rounded-xl bg-yellow-500 text-black font-bold py-3"
            >
              Preparar
            </button>

            <button
              onClick={() => setPedidoCobrandoId(pedido.id)}
              className="rounded-xl bg-green-600 text-white font-bold py-3"
            >
              Cobrar mesa
            </button>

            <button
              onClick={() => cambiarEstado(pedido.id, "Anulado")}
              className="rounded-xl bg-red-600 text-white font-bold py-3 col-span-2"
            >
              Anular
            </button>
          </div>

          {pedidoCobrandoId === pedido.id && (
            <div className="mt-4 rounded-2xl border border-green-500/40 bg-green-500/10 p-4">
              <h3 className="text-lg font-bold mb-3">Selecciona método de pago</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {metodosPago.map((metodo) => (
                  <button
                    key={metodo}
                    onClick={() => cobrarConMetodo(pedido.id, metodo)}
                    className="rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-500"
                  >
                    {metodo}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPedidoCobrandoId(null)}
                className="mt-3 w-full rounded-xl border border-zinc-700 py-3 font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar cobro
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => eliminarPedido(pedido.id)}
        className="mt-4 w-full rounded-xl border border-red-600 text-red-400 font-bold py-2 hover:bg-red-600 hover:text-white transition"
      >
        Eliminar pedido
      </button>
    </article>
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <a href="/pedidos" className="text-orange-400 hover:underline">
            ← Volver a mesas
          </a>

          <h1 className="text-3xl font-bold mt-6">Pedidos</h1>
          <p className="text-zinc-400 mt-2">
            Control de pedidos activos e historial.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={verResumenCaja}
            className="rounded-xl bg-green-600 px-4 py-3 font-bold hover:bg-green-500"
          >
            Resumen de caja
          </button>

          <button
            onClick={borrarPedidos}
            className="rounded-xl bg-red-600 px-4 py-3 font-bold hover:bg-red-500"
          >
            Borrar todo
          </button>
        </div>
      </div>

      {mostrarResumenCaja && (
        <section className="mb-10 rounded-2xl border border-green-600 bg-green-950/30 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold">Resumen de caja</h2>
              <p className="text-green-300 font-bold">La Felicitta</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copiarResumenCaja}
                className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-500"
              >
                Copiar resumen
              </button>

              <button
                onClick={imprimirResumenCaja}
                className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
              >
                Imprimir
              </button>

              <button
                onClick={() => guardarCierreCaja(false)}
                className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-black hover:bg-orange-400"
              >
                Guardar cierre
              </button>

              <button
                onClick={() => {
                  if (confirm("¿Guardar cierre y reiniciar la caja? Esto limpiará el historial de pedidos.")) {
                    guardarCierreCaja(true);
                  }
                }}
                className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
              >
                Cierre definitivo
              </button>

              <a
                href="/pedidos/cierres"
                className="rounded-xl border border-zinc-700 px-4 py-2 font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Ver cierres
              </a>

              <button
                onClick={() => setMostrarResumenCaja(false)}
                className="rounded-xl border border-zinc-700 px-4 py-2 font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ventasPorMetodo.map((item) => (
              <div
                key={item.metodo}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <p className="text-zinc-400">{item.metodo}</p>
                <p className="text-2xl font-bold">$ {formatoPrecio(item.total)}</p>
              </div>
            ))}

            <div className="rounded-xl border border-green-600 bg-green-900/30 p-4">
              <p className="text-green-300">Total vendido real</p>
              <p className="text-2xl font-bold">$ {formatoPrecio(totalVendido)}</p>
            </div>

            <div className="rounded-xl border border-orange-600 bg-orange-900/20 p-4">
              <p className="text-orange-300">Cortesía</p>
              <p className="text-2xl font-bold">$ {formatoPrecio(totalCortesia)}</p>
            </div>

            <div className="rounded-xl border border-yellow-600 bg-yellow-900/20 p-4">
              <p className="text-yellow-300">Colación empleado</p>
              <p className="text-2xl font-bold">$ {formatoPrecio(totalColacion)}</p>
            </div>

            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
              <p className="text-zinc-400">Pedidos en historial</p>
              <p className="text-2xl font-bold">{historial.length}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-xl font-bold mb-4">Ventas por producto</h3>

            {ventasPorProducto.length === 0 ? (
              <p className="text-zinc-400">Todavía no hay productos vendidos.</p>
            ) : (
              <div className="space-y-2">
                {ventasPorProducto.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between rounded-xl bg-zinc-800 p-3"
                  >
                    <span>
                      {item.nombre}{" "}
                      <strong className="text-orange-400">x{item.cantidad}</strong>
                    </span>
                    <span>$ {formatoPrecio(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Pedidos activos</p>
          <h2 className="text-3xl font-bold mt-2">{pedidosActivos.length}</h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Total activo</p>
          <h2 className="text-3xl font-bold mt-2">$ {formatoPrecio(totalActivo)}</h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Total vendido real</p>
          <h2 className="text-3xl font-bold mt-2">$ {formatoPrecio(totalVendido)}</h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Historial</p>
          <h2 className="text-3xl font-bold mt-2">{historial.length}</h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Cortesía</p>
          <h2 className="text-3xl font-bold mt-2">$ {formatoPrecio(totalCortesia)}</h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">Colación empleado</p>
          <h2 className="text-3xl font-bold mt-2">$ {formatoPrecio(totalColacion)}</h2>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Ventas por método de pago</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ventasPorMetodo.map((item) => (
            <div
              key={item.metodo}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <p className="text-zinc-400">{item.metodo}</p>
              <h3 className="text-2xl font-bold mt-2">
                $ {formatoPrecio(item.total)}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Pedidos activos</h2>

        {pedidosActivos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">No hay pedidos activos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pedidosActivos.map((pedido) => (
              <PedidoCard key={pedido.id} pedido={pedido} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Historial</h2>

        {historial.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Todavía no hay historial.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-80">
            {historial.map((pedido) => (
              <PedidoCard key={pedido.id} pedido={pedido} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
