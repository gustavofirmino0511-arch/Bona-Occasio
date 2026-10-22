import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* textura sutil de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, var(--color-forest) 0, transparent 45%), radial-gradient(circle at 85% 30%, var(--color-copper) 0, transparent 40%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-5 pt-20 pb-16 text-center sm:px-8 sm:pt-28 sm:pb-24">
        {/* O texto "Boas oportunidades, bem escolhidas" foi removido daqui */}

        <h1
          className="animate-fade-up font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.02] font-semibold tracking-tight text-forest"
          style={{ animationDelay: "60ms" }}
        >
          As melhores
          <br />
          oportunidades,
          <br />
          <span className="italic text-copper">para você.</span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-7 max-w-xl text-base text-stone sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Uma seleção enxuta de produtos que valem a pena — com preços e
          condições atualizados para você decidir bem.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "180ms" }}
        >
          <a
            href="#ofertas"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition-all hover:bg-forest-soft hover:shadow-lg hover:shadow-forest/20"
          >
            Explorar ofertas
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#sobre"
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-cream/60 px-6 py-3 text-sm font-medium text-forest transition-colors hover:border-copper hover:text-copper"
          >
            Como escolhemos
          </a>
        </div>
      </div>
    </section>
  );
}
