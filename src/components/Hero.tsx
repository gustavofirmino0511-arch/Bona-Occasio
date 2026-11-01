import { Link } from "react-router-dom";
import { ArrowRight, Scale } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-sand">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, var(--color-forest) 0, transparent 45%), radial-gradient(circle at 85% 30%, var(--color-copper) 0, transparent 40%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-5 pt-16 pb-16 text-center sm:px-8 sm:pt-24 sm:pb-20">
        <p className="text-xs font-medium text-copper">
          Curadoria Independente · Amazon · Mercado Livre · Shopee
        </p>

        <h1
          className="animate-fade-up mt-4 font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.06] font-semibold tracking-tight text-forest"
          style={{ textWrap: "balance" }}
        >
          Boas oportunidades,{" "}
          <span className="italic text-copper">comparadas no detalhe.</span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stone sm:text-lg"
          style={{ animationDelay: "80ms" }}
        >
          Não escolha no escuro. Comparamos processador, placa de vídeo, bateria
          e preços nas maiores lojas para apontar qual produto entrega o melhor
          custo-benefício para o seu bolso.
        </p>

        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "140ms" }}
        >
          <Link
            to="/comparar"
            className="group inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-soft whitespace-nowrap shrink-0"
          >
            <Scale className="size-4" />
            Comparar produtos lado a lado
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-lg border border-sand bg-white/70 px-6 py-3 text-sm font-medium text-forest transition-colors hover:border-copper hover:text-copper whitespace-nowrap shrink-0"
          >
            Explorar catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
