"use client";
import { useEffect, useState } from "react";

export default function ConfiguracionPage() {
  const [nombre, setNombre] = useState("");
  const [moneda, setMoneda] = useState("$");
  const [mesas, setMesas] = useState("6");
  const [guardado, setGuardado] = useState(false);
  const [urlCarta, setUrlCarta] = useState("/carta");

  useEffect(() => {
    setUrlCarta(window.location.origin + "/carta");
    const config = localStorage.getItem("config_negocio");
    if (config) {
      const datos = JSON.parse(config);
      if (datos.nombre) setNombre(datos.nombre);
      if (datos.moneda) setMoneda(datos.moneda);
      if (datos.mesas) setMesas(datos.mesas);
    }
  }, []);

  const guardar = () => {
    localStorage.setItem("config_negocio", JSON.stringify({ nombre, moneda, mesas }));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-orange-400 hover:underline text-sm">Dashboard</a>
          <h1 className="text-3xl font-bold mt-2">Configuracion</h1>
          <p className="text-zinc-400 mt-1">Personaliza tu negocio.</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-5">Datos del negocio</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-2 block">Nombre del negocio</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: La Felicitta, Burger House..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-2 block">Simbolo de moneda</label>
                <div className="flex gap-2">
                  {["$", "USD", "EUR", "S/", "Bs"].map((m) => (
                    <button key={m} onClick={() => setMoneda(m)} className={moneda === m ? "flex-1 rounded-xl bg-orange-500 text-black font-bold py-3" : "flex-1 rounded-xl bg-zinc-800 font-bold py-3 hover:bg-zinc-700"}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 mb-2 block">Numero de mesas</label>
                <div className="flex gap-2">
                  {["4", "6", "8", "10", "12"].map((n) => (
                    <button key={n} onClick={() => setMesas(n)} className={mesas === n ? "flex-1 rounded-xl bg-orange-500 text-black font-bold py-3" : "flex-1 rounded-xl bg-zinc-800 font-bold py-3 hover:bg-zinc-700"}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">Carta QR</h2>
            <p className="text-zinc-400 text-sm mb-4">Comparte este enlace para que tus clientes vean el menu digital.</p>
            <div className="rounded-xl bg-zinc-950 border border-zinc-700 p-3 flex items-center justify-between gap-3">
              <span className="text-orange-400 text-sm font-bold truncate">{urlCarta}</span>
              <button onClick={() => { navigator.clipboard.writeText(urlCarta); alert("URL copiada"); }} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-bold hover:bg-zinc-600 whitespace-nowrap">Copiar</button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">Accesos rapidos</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/productos" className="rounded-xl bg-zinc-800 p-4 hover:border-orange-500 border border-zinc-700 transition">
                <p className="font-bold">Productos</p>
                <p className="text-zinc-400 text-sm">Gestionar menu</p>
              </a>
              <a href="/categorias" className="rounded-xl bg-zinc-800 p-4 hover:border-orange-500 border border-zinc-700 transition">
                <p className="font-bold">Categorias</p>
                <p className="text-zinc-400 text-sm">Organizar menu</p>
              </a>
              <a href="/mesas" className="rounded-xl bg-zinc-800 p-4 hover:border-orange-500 border border-zinc-700 transition">
                <p className="font-bold">Mesas</p>
                <p className="text-zinc-400 text-sm">Configurar salon</p>
              </a>
              <a href="/carta" className="rounded-xl bg-zinc-800 p-4 hover:border-orange-500 border border-zinc-700 transition">
                <p className="font-bold">Ver carta</p>
                <p className="text-zinc-400 text-sm">Como la ve el cliente</p>
              </a>
            </div>
          </div>

          <button onClick={guardar} className={`w-full rounded-xl py-4 font-bold text-lg transition ${guardado ? "bg-green-600 text-white" : "bg-orange-500 text-black hover:bg-orange-400"}`}>
            {guardado ? "Guardado correctamente" : "Guardar configuracion"}
          </button>
        </div>
      </div>
    </main>
  );
}
