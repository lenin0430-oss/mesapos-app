"use client";

import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  activo: boolean;
};

const categoriasBase = [
  "Comida rápida",
  "Platos",
  "Arepas",
  "Pepitos",
  "Pasapalos",
  "Acompañamientos",
  "Bebidas",
];

const productosBase: Producto[] = [
  { id: 1, nombre: "Hamburguesa", precio: 3000, categoria: "Comida rápida", activo: true },
  { id: 2, nombre: "Perro caliente", precio: 1000, categoria: "Comida rápida", activo: true },
  { id: 3, nombre: "Arroz chino", precio: 7500, categoria: "Platos", activo: true },
  { id: 4, nombre: "Cachapa", precio: 6000, categoria: "Platos", activo: true },
  { id: 5, nombre: "Arepa carne mechada", precio: 5500, categoria: "Arepas", activo: true },
  { id: 6, nombre: "Arepa reina pepiada", precio: 5500, categoria: "Arepas", activo: true },
  { id: 7, nombre: "Pepito mixto", precio: 8500, categoria: "Pepitos", activo: true },
  { id: 8, nombre: "Pepito de pollo", precio: 7500, categoria: "Pepitos", activo: true },
  { id: 9, nombre: "Tequeños 6 unidades", precio: 4500, categoria: "Pasapalos", activo: true },
  { id: 10, nombre: "Papas fritas", precio: 3500, categoria: "Acompañamientos", activo: true },
];

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(categoriasBase);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState(categoriasBase[0]);

  useEffect(() => {
    const guardados = localStorage.getItem("productos_pos");

    if (guardados) {
      setProductos(JSON.parse(guardados));
    } else {
      localStorage.setItem("productos_pos", JSON.stringify(productosBase));
      setProductos(productosBase);
    }

    const categoriasGuardadas = localStorage.getItem("categorias_pos");

    if (categoriasGuardadas) {
      const categoriasActivas = JSON.parse(categoriasGuardadas)
        .filter((cat: any) => cat.activa)
        .map((cat: any) => cat.nombre);

      setCategorias(categoriasActivas);
      setCategoria(categoriasActivas[0] || categoriasBase[0]);
    }
  }, []);

  const guardarProductos = (data: Producto[]) => {
    localStorage.setItem("productos_pos", JSON.stringify(data));
    setProductos(data);
  };

  const formatoPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-CL").format(valor);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setPrecio("");
    setCategoria(categoriasBase[0]);
  };

  const guardarProducto = () => {
    if (!nombre.trim()) {
      alert("Ingresa el nombre del producto.");
      return;
    }

    const precioNumero = Number(precio);

    if (!precioNumero || precioNumero <= 0) {
      alert("Ingresa un precio válido.");
      return;
    }

    if (editandoId) {
      const actualizados = productos.map((producto) =>
        producto.id === editandoId
          ? {
              ...producto,
              nombre: nombre.trim(),
              precio: precioNumero,
              categoria,
            }
          : producto
      );

      guardarProductos(actualizados);
      limpiarFormulario();
      return;
    }

    const nuevoProducto: Producto = {
      id: Date.now(),
      nombre: nombre.trim(),
      precio: precioNumero,
      categoria,
      activo: true,
    };

    guardarProductos([nuevoProducto, ...productos]);
    limpiarFormulario();
  };

  const editarProducto = (producto: Producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setPrecio(String(producto.precio));
    setCategoria(producto.categoria);
  };

  const eliminarProducto = (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;

    const actualizados = productos.filter((producto) => producto.id !== id);
    guardarProductos(actualizados);
  };

  const cambiarEstado = (id: number) => {
    const actualizados = productos.map((producto) =>
      producto.id === id ? { ...producto, activo: !producto.activo } : producto
    );

    guardarProductos(actualizados);
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
          ← Volver al dashboard
        </a>

        <div className="flex items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-zinc-400 mt-2">
              Administra productos, precios, categorías y estado.
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
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400"
            >
              {editandoId ? "Guardar cambios" : "Crear producto"}
            </button>

            {editandoId && (
              <button
                onClick={limpiarFormulario}
                className="w-full rounded-xl border border-zinc-700 py-3 font-bold hover:bg-zinc-800"
              >
                Cancelar edición
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
            {productosFiltrados.length === 0 ? (
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
                      onClick={() => cambiarEstado(producto.id)}
                      className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400"
                    >
                      {producto.activo ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 font-bold hover:bg-red-500"
                    >
                      Eliminar
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
