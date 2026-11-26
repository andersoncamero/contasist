import React, { useEffect, useState } from "react";

interface ShowcaseItem {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  heightClass: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    tag: "Contabilidad",
    title: "Contabilidad Precisa",
    description:
      "Automatiza tus registros contables bajo el PUC colombiano con partida doble y trazabilidad en cada movimiento.",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
    alt: "Contabilidad",
    heightClass: "h-[280px]",
  },
  {
    tag: "Finanzas",
    title: "Análisis Financiero",
    description:
      "Visualiza balances, estados de resultados e indicadores clave para tomar decisiones financieras con respaldo real.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    alt: "Finanzas",
    heightClass: "h-[200px]",
  },
  {
    tag: "Operación",
    title: "Gestión Administrativa",
    description:
      "Centraliza clientes, proveedores, cotizaciones y facturación electrónica en un flujo ágil y ordenado.",
    imageUrl:
      "https://www.edenred.mx/hs-fs/hubfs/Media%20Source%202023%20%20(imagenes%20blog)/Diciembre/Procesos%20de%20gesti%C3%B3n%20administrativa%20qu%C3%A9%20son%20y%20para%20qu%C3%A9%20sirven/que-son-los-procesos-de-gestion-administrativa.png?width=600&height=343&name=que-son-los-procesos-de-gestion-administrativa.png",
    alt: "Administración",
    heightClass: "h-[200px]",
  },
  {
    tag: "Control",
    title: "Control Total",
    description:
      "Supervisa tus empresas, inventarios y comprobantes en tiempo real con seguridad basada en roles.",
    imageUrl:
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=800&auto=format&fit=crop",
    alt: "Dashboard",
    heightClass: "h-[280px]",
  },
];

interface ShowcaseCardProps {
  item: ShowcaseItem;
  index: number;
  isActive: boolean;
  onActivate: (index: number) => void;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  item,
  index,
  isActive,
  onActivate,
}) => {
  return (
    <button
      type="button"
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onClick={() => onActivate(index)}
      style={{ animationDelay: `${index * 90}ms` }}
      className={`w-full text-left group relative overflow-hidden rounded-2xl border transition-all duration-700 ease-out focus:outline-none animate-showcase-enter motion-reduce:animate-none ${
        isActive
          ? "ring-2 ring-primary/45 border-primary/40 shadow-2xl shadow-primary/15 -translate-y-1.5 opacity-100"
          : "border-white/70 shadow-lg opacity-85 hover:opacity-100 hover:-translate-y-1"
      }`}
    >
      <img
        src={item.imageUrl}
        alt={item.alt}
        className={`w-full ${item.heightClass} object-cover transition-transform duration-700 ease-out ${
          isActive ? "scale-[1.05]" : "group-hover:scale-[1.03]"
        }`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent transition-opacity duration-500 flex flex-col justify-end p-5 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <span className="inline-flex w-fit items-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/95 mb-1.5">
          {item.tag}
        </span>
        <span className="text-white font-bold text-lg tracking-tight">
          {item.title}
        </span>
      </div>
    </button>
  );
};

export const AuthShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((-ny * 5).toFixed(2)),
      y: Number((nx * 5).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsPaused(false);
  };

  const activeItem = SHOWCASE_ITEMS[activeIndex];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-slate-50 border-l border-slate-100 p-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />

      <div className="relative h-full flex flex-col items-center justify-center">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
          className="grid grid-cols-2 gap-6 w-full max-w-2xl px-4 transition-transform duration-300 ease-out"
        >
          <div className="space-y-6 animate-showcase-float motion-reduce:animate-none">
            <ShowcaseCard
              item={SHOWCASE_ITEMS[0]}
              index={0}
              isActive={activeIndex === 0}
              onActivate={setActiveIndex}
            />
            <ShowcaseCard
              item={SHOWCASE_ITEMS[2]}
              index={2}
              isActive={activeIndex === 2}
              onActivate={setActiveIndex}
            />
          </div>

          <div className="space-y-6 pt-12 animate-showcase-float-reverse motion-reduce:animate-none">
            <ShowcaseCard
              item={SHOWCASE_ITEMS[1]}
              index={1}
              isActive={activeIndex === 1}
              onActivate={setActiveIndex}
            />
            <ShowcaseCard
              item={SHOWCASE_ITEMS[3]}
              index={3}
              isActive={activeIndex === 3}
              onActivate={setActiveIndex}
            />
          </div>
        </div>

        <div className="mt-14 text-center max-w-md space-y-5">
          <div
            key={activeItem.title}
            className="animate-showcase-caption motion-reduce:animate-none"
          >
            <h3 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {activeItem.title}
            </h3>
            <p className="text-slate-500 leading-relaxed font-semibold text-base">
              {activeItem.description}
            </p>
          </div>

          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex items-center justify-center gap-2 pt-1"
          >
            {SHOWCASE_ITEMS.map((item, idx) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Ver ${item.title}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeIndex === idx
                    ? "w-8 bg-primary"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
