"use client";

import { useEffect, useState } from "react";

type CierreCaja = {
  id: string;
  fecha: string;
  efectivo: number;
  debito: number;
  credito: number;
  transferencia: number;
  mercadoPago: number;
  totalVendido: number;
  totalCortesia: number;
  totalColacion: number;
  pedidosHistorial: number;
  ventasPorProducto?: {
    id: number;
    nombre: string;
    cantidad: number;
    total: number;
  }[];
  texto: string;
};

export default function CierresCajaPage() {
  const [cierres, setCierres] = useState<CierreCaja[]>([]);
  const [fechaFiltro, setFechaFiltro] = useState("");

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("cierres_caja") || "[]");
    setCierres(guardados);
  }, []);

  const formatoPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-CL").format(valor);
  };

  const obtenerFechaISO = (fecha: string) => {
    const partes = fecha.split(",")[0].split("-");

    if (partes.length !== 3) {
      return "";
    }

    const [dia, mes, año] = partes;
    return `${año}-${mes}-${dia}`;
  };

  const cierresFiltrados = fechaFiltro
    ? cierres.filter((cierre) => obtenerFechaISO(cierre.fecha) === fechaFiltro)
    : cierres;

  const filtrarHoy = () => {
    const hoy = new Date().toISOString().slice(0, 10);
    setFechaFiltro(hoy);
  };

  const verTodos = () => {
    setFechaFiltro("");
  };

  const exportarCierresExcel = () => {
    if (cierresFiltrados.length === 0) {
      alert("No hay cierres para exportar.");
      return;
    }

    const filas = cierresFiltrados.map((cierre) => {
      const productos =
        cierre.ventasPorProducto
          ?.map((item) => `${item.nombre} x${item.cantidad} = $${item.total}`)
          .join(" | ") || "";

      return `
        <tr>
          <td>${cierre.id}</td>
          <td>${cierre.fecha}</td>
          <td>${cierre.efectivo}</td>
          <td>${cierre.debito}</td>
          <td>${cierre.credito}</td>
          <td>${cierre.transferencia}</td>
          <td>${cierre.mercadoPago}</td>
          <td>${cierre.totalVendido}</td>
          <td>${cierre.totalCortesia}</td>
          <td>${cierre.totalColacion}</td>
          <td>${cierre.pedidosHistorial}</td>
          <td>${productos}</td>
        </tr>
      `;
    }).join("");

    const archivo = `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table border="1">
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Efectivo</th>
              <th>Débito</th>
              <th>Crédito</th>
              <th>Transferencia</th>
              <th>Mercado Pago</th>
              <th>Total Vendido Real</th>
              <th>Cortesía</th>
              <th>Colación Empleado</th>
              <th>Pedidos Historial</th>
              <th>Ventas Por Producto</th>
            </tr>
            ${filas}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([archivo], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fechaFiltro
      ? `cierres-caja-la-felicitta-${fechaFiltro}.xls`
      : "cierres-caja-la-felicitta.xls";
    link.click();
    URL.revokeObjectURL(url);
  };

  const borrarTodosLosCierres = () => {
    if (!confirm("¿Seguro que quieres eliminar todos los cierres guardados?")) {
      return;
    }

    localStorage.removeItem("cierres_caja");
    setCierres([]);
  };

  const eliminarCierre = (id: string) => {
    if (!confirm("¿Eliminar este cierre de caja?")) {
      return;
    }

    const actualizados = cierres.filter((cierre) => cierre.id !== id);
    localStorage.setItem("cierres_caja", JSON.stringify(actualizados));
    setCierres(actualizados);
  };

  const imprimirCierre = (texto: string) => {
    const ventana = window.open("", "_blank");

    if (!ventana) {
      alert("No se pudo abrir la ventana de impresión.");
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Cierre de caja</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              white-space: pre-line;
              font-size: 16px;
            }
          </style>
        </head>
        <body>${texto}</body>
      </html>
    `);

    ventana.document.close();
    ventana.print();
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-8">
        <div className="flex gap-4">
          <a href="/pedidos/enviados" className="text-orange-400 hover:underline">
            ← Volver a pedidos
          </a>

          <a href="/pedidos" className="text-orange-400 hover:underline">
            Ir a mesas →
          </a>
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold">Historial de cierres</h1>
            <p className="text-zinc-400 mt-2">
              Cierres de caja guardados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-bold text-white"
            />

            <button
              onClick={filtrarHoy}
              className="rounded-xl bg-zinc-700 px-4 py-3 font-bold hover:bg-zinc-600"
            >
              Hoy
            </button>

            <button
              onClick={verTodos}
              className="rounded-xl bg-zinc-700 px-4 py-3 font-bold hover:bg-zinc-600"
            >
              Ver todos
            </button>

            <button
              onClick={exportarCierresExcel}
              className="rounded-xl bg-green-600 px-4 py-3 font-bold hover:bg-green-500"
            >
              Exportar Excel
            </button>

            <button
              onClick={borrarTodosLosCierres}
              className="rounded-xl bg-red-600 px-4 py-3 font-bold hover:bg-red-500"
            >
              Borrar todos
            </button>
          </div>
        </div>
      </div>

      {cierresFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">
            {fechaFiltro ? "No hay cierres para esta fecha." : "Todavía no hay cierres guardados."}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cierresFiltrados.map((cierre) => (
            <article
              key={cierre.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <h2 className="text-2xl font-bold">Cierre #{cierre.id}</h2>
                <p className="text-zinc-400">{cierre.fecha}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-zinc-800 p-3">
                  <p className="text-zinc-400">Efectivo</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.efectivo)}</p>
                </div>

                <div className="rounded-xl bg-zinc-800 p-3">
                  <p className="text-zinc-400">Débito</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.debito)}</p>
                </div>

                <div className="rounded-xl bg-zinc-800 p-3">
                  <p className="text-zinc-400">Crédito</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.credito)}</p>
                </div>

                <div className="rounded-xl bg-zinc-800 p-3">
                  <p className="text-zinc-400">Transferencia</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.transferencia)}</p>
                </div>

                <div className="rounded-xl bg-zinc-800 p-3">
                  <p className="text-zinc-400">Mercado Pago</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.mercadoPago)}</p>
                </div>

                <div className="rounded-xl bg-green-900/30 border border-green-600 p-3">
                  <p className="text-green-300">Total vendido real</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.totalVendido)}</p>
                </div>

                <div className="rounded-xl bg-orange-900/20 border border-orange-600 p-3">
                  <p className="text-orange-300">Cortesía</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.totalCortesia)}</p>
                </div>

                <div className="rounded-xl bg-yellow-900/20 border border-yellow-600 p-3">
                  <p className="text-yellow-300">Colación empleado</p>
                  <p className="font-bold">$ {formatoPrecio(cierre.totalColacion)}</p>
                </div>
              </div>

              {cierre.ventasPorProducto && cierre.ventasPorProducto.length > 0 && (
                <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <h3 className="text-lg font-bold mb-3">Ventas por producto</h3>

                  <div className="space-y-2">
                    {cierre.ventasPorProducto.map((item) => (
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
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => imprimirCierre(cierre.texto)}
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-bold hover:bg-blue-500"
                >
                  Imprimir
                </button>

                <button
                  onClick={() => eliminarCierre(cierre.id)}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-bold hover:bg-red-500"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
