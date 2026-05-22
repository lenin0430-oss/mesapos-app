"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Categoria = {
  id: string;
  nombre: string;
  activa: boolean;
};

export default function CategoriasPage() {
  const router = useRouter();

  const [empresaId, setEmpresaId] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
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
      .from("categorias")
      .select("id, nombre, activa")
      .eq("empresa_id", perfil.empresa_id)
      .order("nombre", { ascending: true });

    setCategorias(data || []);
    setLoading(false);
  };

  const crearCategoria = async () => {
    if (!nuevoNombre || !empresaId) return;

    await supabase.from("categorias").insert({
      empresa_id: empresaId,
      nombre: nuevoNombre,
      activa: true,
    });

    setNuevoNombre("");
    cargarCategorias();
  };

  const cambiarEstado = async (id: string, activa: boolean) => {
    await supabase.from("categorias").update({ activa }).eq("id", id);
    cargarCategorias();
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Categorías</h1>
            <p className="text-zinc-400 mt-2">Crea y organiza las categorías del negocio.</p>
          </div>

          <a href="/dashboard" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg">
            Volver
          </a>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 mb-8">
          <h2 className="text-2xl font-bold mb-4">Agregar categoría</h2>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="Nombre de la categoría"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-3"
            />

            <button
              onClick={crearCategoria}
              className="bg-orange-600 hover:bg-orange-500 rounded-lg p-3 font-semibold"
            >
              Agregar
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando categorías...</p>
        ) : (
          <div className="space-y-4">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-xl font-bold">{categoria.nombre}</h2>
                  <p className="mt-2 text-sm">
                    Estado:{" "}
                    <span className={categoria.activa ? "text-green-400" : "text-red-400"}>
                      {categoria.activa ? "Activa" : "Inactiva"}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => cambiarEstado(categoria.id, !categoria.activa)}
                  className="bg-orange-600 hover:bg-orange-500 rounded-lg px-4 py-3 font-semibold"
                >
                  {categoria.activa ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
