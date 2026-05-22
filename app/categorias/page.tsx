"use client";

import { useEffect, useState } from "react";

type Categoria = {
  id: number;
  nombre: string;
  activa: boolean;
};

const categoriasBase: Categoria[] = [
  { id: 1, nombre: "Comida rápida", activa: true },
  { id: 2, nombre: "Platos", activa: true },
  { id: 3, nombre: "Arepas", activa: true },
  { id: 4, nombre: "Pepitos", activa: true },
  { id: 5, nombre: "Pasapalos", activa: true },
  { id: 6, nombre: "Acompañamientos", activa: true },
  { id: 7, nombre: "Bebidas", activa: true },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    const guardadas = localStorage.getItem("categorias_pos");

    if (guardadas) {
      setCategorias(JSON.parse(guardadas));
    } else {
      localStorage.setItem("categorias_pos", JSON.stringify(categoriasBase));
      setCategorias(categoriasBase);
    }
  }, []);

  const guardarCategorias = (data: Categoria[]) => {
    localStorage.setItem("categorias_pos", JSON.stringify(data));
    setCategorias(data);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setEditandoId(null);
  };

  const guardarCategoria = () => {
    if (!nombre.trim()) {
      alert("Ingresa el nombre de la categoría.");
      return;
    }

    if (editandoId) {
      const actualizadas = categorias.map((categoria) =>
        categoria.id === editandoId
          ? { ...categoria, nombre: nombre.trim() }
          : categoria
      );

      guardarCategorias(actualizadas);
      limpiarFormulario();
      return;
    }

    const nuevaCategoria: Categoria = {
      id: Date.now(),
      nombre: nombre.trim(),
      activa: true,
    };

    guardarCategorias([nuevaCategoria, ...categorias]);
    limpiarFormulario();
  };

  const editarCategoria = (categoria: Categoria) => {
    setEditandoId(categoria.id);
    setNombre(categoria.nombre);
  };

  const cambiarEstado = (id: number) => {
    const actualizadas = categorias.map((categoria) =>
      categoria.id === id
        ? { ...categoria, activa: !categoria.activa }
        : categoria
    );

    guardarCategorias(actualizadas);
  };

  const eliminarCategoria = (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return;

    const actualizadas = categorias.filter((categoria) => categoria.id !== id);
    guardarCategorias(actualizadas);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-8">
        <a href="/dashboard" className="text-orange-400 hover:underline">
          ← Volver al dashboard
        </a>

        <div className="flex items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold">Categorías</h1>
            <p className="text-zinc-400 mt-2">
              Administra las categorías de productos.
            </p>
          </div>

          <a
            href="/productos"
            className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-black hover:bg-orange-400"
          >
            Ir a productos
          </a>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-4">
            {editandoId ? "Editar categoría" : "Crear categoría"}
          </h2>

          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          />

          <button
            onClick={guardarCategoria}
            className="mt-4 w-full rounded-xl bg-orange-500 py-3 font-bold text-black hover:bg-orange-400"
          >
            {editandoId ? "Guardar cambios" : "Crear categoría"}
          </button>

          {editandoId && (
            <button
              onClick={limpiarFormulario}
              className="mt-3 w-full rounded-xl border border-zinc-700 py-3 font-bold hover:bg-zinc-800"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold mb-4">Lista de categorías</h2>

          <div className="space-y-3">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="rounded-xl bg-zinc-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold">{categoria.nombre}</h3>
                  <p className={categoria.activa ? "text-green-400" : "text-red-400"}>
                    {categoria.activa ? "Activa" : "Inactiva"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => editarCategoria(categoria)}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold hover:bg-blue-500"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => cambiarEstado(categoria.id)}
                    className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400"
                  >
                    {categoria.activa ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => eliminarCategoria(categoria.id)}
                    className="rounded-xl bg-red-600 px-4 py-2 font-bold hover:bg-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
