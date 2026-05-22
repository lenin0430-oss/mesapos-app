"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
};

export default function ProductosPage() {
  const router = useRouter();

  const [empresaId, setEmpresaId] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", userData.user.id)
      .single();

    if (!perfil) {
      setLoading(false);
      return;
    }

    setEmpresaId(perfil.empresa_id);

    const { data } = await supabase
      .from("productos")
      .select("id, nombre, descripcion, precio, disponible")
      .eq("empresa_id", perfil.empresa_id)
      .order("nombre", { ascending: true });

    setProductos(data || []);
    setLoading(false);
  };

  const crearProducto = async () => {
    if (!nuevoNombre || !nuevoPrecio || !empresaId) return;

    await supabase.from("productos").insert({
      empresa_id: empresaId,
      nombre: nuevoNombre,
      descripcion: nuevaDescripcion,
      precio: Number(nuevoPrecio),
      disponible: true,
    });

    setNuevoNombre("");
    setNuevoPrecio("");
    setNuevaDescripcion("");

    cargarProductos();
  };

  const cambiarPrecio = async (id: string, precio: number) => {
    await supabase.from("productos").update({ precio }).eq("id", id);
    cargarProductos();
  };

  const cambiarDisponibilidad = async (id: string, disponible: boolean) => {
    await supabase.from("productos").update({ disponible }).eq("id", id);
    cargarProductos();
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Productos</h1>
            <p className="text-zinc-400 mt-2">Edita precios, disponibilidad y crea productos.</p>
          </div>

          <a href="/dashboard" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg">
            Volver
          </a>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 mb-8">
          <h2 className="text-2xl font-bold mb-4">Agregar producto</h2>

          <div className="grid md:grid-cols-4 gap-3">
            <input
              placeholder="Nombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-3"
            />

            <input
              placeholder="Descripción"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-3"
            />

            <input
              placeholder="Precio"
              type="number"
              value={nuevoPrecio}
              onChange={(e) => setNuevoPrecio(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-3"
            />

            <button
              onClick={crearProducto}
              className="bg-orange-600 hover:bg-orange-500 rounded-lg p-3 font-semibold"
            >
              Agregar
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="space-y-4">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h2 className="text-xl font-bold">{producto.nombre}</h2>
                  <p className="text-zinc-400">{producto.descripcion}</p>
                  <p className="mt-2 text-sm">
                    Estado:{" "}
                    <span className={producto.disponible ? "text-green-400" : "text-red-400"}>
                      {producto.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    defaultValue={producto.precio}
                    className="w-32 bg-zinc-900 border border-zinc-700 rounded-lg p-3"
                    onBlur={(e) => cambiarPrecio(producto.id, Number(e.target.value))}
                  />

                  <button
                    onClick={() => cambiarDisponibilidad(producto.id, !producto.disponible)}
                    className="bg-orange-600 hover:bg-orange-500 rounded-lg px-4 py-3 font-semibold"
                  >
                    {producto.disponible ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
