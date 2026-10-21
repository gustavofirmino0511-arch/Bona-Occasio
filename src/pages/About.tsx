export function About() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">
        Como escolhemos
      </h1>
      <div className="mt-8 space-y-6 text-left text-lg leading-relaxed text-stone">
        <p>
          O Bona Occasio nasceu da ideia de simplificar suas compras. Em vez de perder horas comparando preços e lendo avaliações em dezenas de abas abertas, nós fazemos o trabalho duro para você.
        </p>
        <p>
          Nossa curadoria analisa não apenas o preço, mas a qualidade real, a reputação do vendedor e o histórico de avaliações. Só recomendamos o que compraríamos.
        </p>
        <p className="rounded-xl border border-sand bg-white/50 p-6 text-base italic">
          "Transparência é nosso pilar. Os links neste site são de afiliados, o que significa que podemos receber uma pequena comissão se você comprar através deles. Isso não altera o preço final para você."
        </p>
      </div>
    </section>
  );
}
