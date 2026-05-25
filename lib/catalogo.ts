import { supabase } from "@/lib/supabase";

export type CategoriaCatalogo = {
  id: string;
  nombre: string;
  orden: number;
  activa: boolean;
};

export type ProductoCatalogo = {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  activo: boolean;
  descripcion?: string;
  categoria_id?: string | null;
};

type EmpresaBasica = {
  id: string;
  nombre: string;
};

type CatalogoOpciones = {
  empresaId?: string | null;
  slug?: string | null;
  incluirInactivos?: boolean;
};

type UsuarioEmpresa = {
  empresa_id: string | null;
};

type CategoriaRow = {
  id: string;
  nombre: string | null;
  orden: number | null;
  activo?: boolean | null;
  activa?: boolean | null;
};

type ProductoRow = {
  id: string;
  nombre: string | null;
  precio: number | string | null;
  descripcion: string | null;
  disponible: boolean | null;
  categoria_id: string | null;
};

const SLUG_EMPRESA_FALLBACK = "lafelicitta";

async function buscarEmpresaPorId(id?: string | null): Promise<EmpresaBasica | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("No se pudo buscar empresa por id:", error.message);
    return null;
  }

  return data ? { id: data.id, nombre: data.nombre || "MesaPOS" } : null;
}

async function buscarEmpresaPorSlug(slug?: string | null): Promise<EmpresaBasica | null> {
  if (!slug) return null;

  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("No se pudo buscar empresa por slug:", error.message);
    return null;
  }

  return data ? { id: data.id, nombre: data.nombre || "MesaPOS" } : null;
}

async function buscarEmpresaFelicitta(): Promise<EmpresaBasica | null> {
  const porSlug = await buscarEmpresaPorSlug(SLUG_EMPRESA_FALLBACK);
  if (porSlug) return porSlug;

  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre")
    .ilike("nombre", "%Felicitta%")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("No se pudo buscar La Felicitta:", error.message);
    return null;
  }

  return data ? { id: data.id, nombre: data.nombre || "La Felicitta" } : null;
}

async function buscarEmpresaDeSesion(): Promise<EmpresaBasica | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  let usuario: UsuarioEmpresa | null = null;

  const porId = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!porId.error) usuario = porId.data;

  if (!usuario?.empresa_id && session.user.email) {
    const porEmail = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("email", session.user.email)
      .maybeSingle();

    if (!porEmail.error) usuario = porEmail.data;
  }

  return buscarEmpresaPorId(usuario?.empresa_id);
}

async function resolverEmpresa(opciones: CatalogoOpciones): Promise<EmpresaBasica | null> {
  return (
    (await buscarEmpresaPorId(opciones.empresaId)) ||
    (await buscarEmpresaPorSlug(opciones.slug)) ||
    (await buscarEmpresaDeSesion()) ||
    (await buscarEmpresaFelicitta())
  );
}

export async function cargarCatalogoEmpresa(opciones: CatalogoOpciones = {}) {
  const empresa = await resolverEmpresa(opciones);

  if (!empresa) {
    return {
      empresa: null,
      empresaId: null,
      nombreEmpresa: "MesaPOS",
      categorias: [] as string[],
      categoriasDetalle: [] as CategoriaCatalogo[],
      productos: [] as ProductoCatalogo[],
      error: "No se encontro la empresa activa.",
    };
  }

  const [categoriasRes, productosRes] = await Promise.all([
    supabase
      .from("categorias")
      .select("id, nombre, orden, activo, activa")
      .eq("empresa_id", empresa.id)
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true }),
    supabase
      .from("productos")
      .select("id, nombre, precio, descripcion, disponible, categoria_id")
      .eq("empresa_id", empresa.id)
      .order("nombre", { ascending: true }),
  ]);

  if (categoriasRes.error || productosRes.error) {
    const mensaje =
      categoriasRes.error?.message ||
      productosRes.error?.message ||
      "No se pudo cargar el catalogo.";

    console.error("Error cargando catalogo:", mensaje);

    return {
      empresa,
      empresaId: empresa.id,
      nombreEmpresa: empresa.nombre,
      categorias: [] as string[],
      categoriasDetalle: [] as CategoriaCatalogo[],
      productos: [] as ProductoCatalogo[],
      error: mensaje,
    };
  }

  const categoriasDetalle = ((categoriasRes.data || []) as CategoriaRow[])
    .filter((categoria) => categoria.activo !== false && categoria.activa !== false)
    .map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre || "Sin categoria",
      orden: categoria.orden || 0,
      activa: true,
    }));

  const categoriaPorId = new Map(
    categoriasDetalle.map((categoria) => [categoria.id, categoria.nombre])
  );

  const todosLosProductos = ((productosRes.data || []) as ProductoRow[]).map((producto) => {
    const precio = Number(producto.precio || 0);

    return {
      id: producto.id,
      nombre: producto.nombre || "Sin nombre",
      precio: Number.isFinite(precio) ? precio : 0,
      categoria: categoriaPorId.get(producto.categoria_id || "") || "Sin categoria",
      activo: producto.disponible !== false,
      descripcion: producto.descripcion || undefined,
      categoria_id: producto.categoria_id,
    };
  });

  const productos = opciones.incluirInactivos
    ? todosLosProductos
    : todosLosProductos.filter((producto) => producto.activo);

  const categorias = Array.from(
    new Set([
      ...categoriasDetalle.map((categoria) => categoria.nombre),
      ...productos.map((producto) => producto.categoria),
    ])
  ).filter(Boolean);

  return {
    empresa,
    empresaId: empresa.id,
    nombreEmpresa: empresa.nombre,
    categorias,
    categoriasDetalle,
    productos,
    error: null,
  };
}
