import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export function About() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-semibold text-copper">
        Nossa Metodologia de Curadoria
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">
        Como escolhemos e comparamos
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-stone sm:text-lg">
        <p>
          O <strong className="font-semibold text-forest">Bona Occasio</strong>{" "}
          nasceu da ideia de simplificar suas compras. Em vez de perder horas
          comparando fichas técnicas confusas e lendo avaliações em dezenas de
          abas abertas na Amazon, Mercado Livre e Shopee, nós cruzamos os dados
          técnicos por você.
        </p>

        <div className="grid gap-6 border-y border-sand py-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-sm font-bold text-copper">
              01. Hardware Real
            </p>
            <p className="mt-2 text-sm text-ink/85">
              Avaliamos geração do processador, placa de vídeo dedicada vs
              integrada, velocidade de memória RAM e qualidade de construção.
            </p>
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-copper">
              02. Custo-Benefício
            </p>
            <p className="mt-2 text-sm text-ink/85">
              Mais caro nem sempre é melhor. Calculamos quanto desempenho real
              você leva para casa por cada real investido.
            </p>
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-copper">
              03. Multi-Loja
            </p>
            <p className="mt-2 text-sm text-ink/85">
              Monitoramos Amazon, Mercado Livre e Shopee para indicar onde o
              mesmo produto está com o menor preço e melhor parcelamento.
            </p>
          </div>
        </div>

        <p className="rounded-xl border border-sand bg-white/70 p-6 text-sm leading-relaxed text-stone">
          <strong className="font-semibold text-forest">
            Compromisso de Transparência:
          </strong>{" "}
          Os links neste site são de programas de afiliados (Amazon, Mercado
          Livre e Shopee), o que significa que podemos receber uma pequena
          comissão se você comprar através deles. Isso nunca aumenta o preço
          final para você — pelo contrário, nossa meta é sempre apontar a opção
          mais vantajosa.
        </p>

        <div className="pt-4">
          <Link
            to="/comparar"
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-soft"
          >
            <Scale className="size-4" />
            Testar o Comparador de Produtos
          </Link>
        </div>
      </div>
    </section>
  );
}
