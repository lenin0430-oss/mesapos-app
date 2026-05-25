"use client";

import { useEffect, useState } from "react";
import {
  cargarCatalogoEmpresa,
  type CategoriaCatalogo,
  type ProductoCatalogo,
} from "@/lib/catalogo";
import { supabase } from "@/lib/supabase";

type Producto = ProductoCatalogo;

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriasDetalle, setCategoriasDetalle] = useState<CategoriaCatalogo[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");

  const cargarProductos = async () => {
    setCargando(true);
    setError("");

    const catalogo = await cargarCatalogoEmpresa({ incluirInactivos: true });

    setEmpresaId(catalogo.empresaId);
    setProductos(catalogo.productos);
    setCategorias(catalogo.categorias);
    setCategoriasDetalle(catalogo.categoriasDetalle);
    setCategoria((actual) => actual || catalogo.categorias[0] || "");
    setError(catalogo.error || "");
    setCargando(false);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const formatoPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-CL").format(valor);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setPrecio("");
    setCategoria(categorias[0] || "");
  };

  const categoriaSeleccionada = () => {
    return categoriasDetalle.find((item) => item.nombre === categoria);
  };

  const guardarProducto = async () => {
    if (!empresaId) {
      alert("No se encontro la empresa activa.");
      return;
    }

    if (!nombre.trim()) {
      alert("Ingresa el nombre del producto.");
      return;
    }

    const precioNumero = Number(precio);

    if (!precioNumero || precioNumero <= 0) {
      alert("Ingresa un precio valido.");
      return;
    }

    const categoriaActual = categoriaSeleccionada();

    if (!categoriaActual) {
      alert("Selecciona una categoria valida.");
      return;
    }

    setGuardando(true);

    const payload = {
      nombre: nombre.trim(),
      precio: precioNumero,
      categoria_id: categoriaActual.id,
      disponible: true,
    };

    const { error: supabaseError } = editandoId
      ? await supabase.from("productos").update(payload).eq("id", editandoId)
      : await supabase.from("productos").insert({
          ...payload,
          empresa_id: empresaId,
        });

    if (supabaseError) {
      alert("No se pudo guardar: " + supabaseError.message);
      setGuardando(false);
      return;
    }

    limpiarFormulario();
    await cargarProductos();
    setGuardando(false);
  };

  const editarProducto = (producto: Producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setPrecio(String(producto.precio));
    setCategoria(producto.categoria);
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm("Desactivar este producto?")) return;

    const { error: supabaseError } = await supabase
      .from("productos")
      .update({ disponible: false })
      .eq("id", id);

    if (supabaseError) {
      alert("No se pudo desactivar: " + supabaseError.message);
      return;
    }

    await cargarProductos();
  };

  const cambiarEstado = async (producto: Producto) => {
    const { error: supabaseError } = await supabase
      .from("productos")
      .update({ disponible: !producto.activo })
      .eq("id", producto.id);

    if (supabaseError) {
      alert("No se pudo cambiar el estado: " + supabaseError.message);
      return;
    }

    await cargarProductos();
  };

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "Todas" || producto.categoria === categoriaFiltro;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-8">
        <a href="/dashboard" className="text-orange-400 hover:underline">
          Volver al dashboard
        </a>

        <div className="flex items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-zinc-400 mt-2">
              Administra productos, precios, categorias y estado desde Supabase.
            </p>
          </div>

          <a
            href="/pedidos"
            className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-black hover:bg-orange-400"
          >
            Ir a mesas
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <p className="text-sm font-bold text-red-300">{error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-4">
            {editandoId ? "Editar producto" : "Crear producto"}
          </h2>

          <div className="space-y-4">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
            />

            <input
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Precio"
              type="number"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={guardarProducto}
              disabled={guardando || cargando || categorias.length === 0}
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear producto"}
            </button>

            {editandoId && (
              <button
                onClick={limpiarFormulario}
                className="w-full rounded-xl border border-zinc-700 py-3 font-bold hover:bg-zinc-800"
              >
                Cancelar edicion
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
            />

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
            >
              <option value="Todas">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {cargando ? (
              <p className="text-zinc-400">Cargando productos...</p>
            ) : productosFiltrados.length === 0 ? (
              <p className="text-zinc-400">No hay productos para mostrar.</p>
            ) : (
              productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className="rounded-xl bg-zinc-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="text-lg font-bold">{producto.nombre}</h3>
                    <p className="text-zinc-400">{producto.categoria}</p>
                    <p className="font-bold">$ {formatoPrecio(producto.precio)}</p>
                    <p
                      className={
                        producto.activo ? "text-green-400" : "text-red-400"
                      }
                    >
                      {producto.activo ? "Activo" : "Inactivo"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => editarProducto(producto)}
                      className="rounded-xl bg-blue-600 px-4 py-2 font-bold hover:bg-blue-500"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => cambiarEstado(producto)}
                      className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400"
                    >
                      {producto.activo ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 font-bold hover:bg-red-500"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
