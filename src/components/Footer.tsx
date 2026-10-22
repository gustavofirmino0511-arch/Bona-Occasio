export function Footer() {
  return (
    <footer id="sobre" className="mt-24 border-t border-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          {/* Logo sem o ponto final */}
          <p className="font-display text-lg font-semibold text-forest">
            Bona Occasio
          </p>
          <p className="mt-3 max-w-xs text-sm text-stone">
            Um catálogo enxuto de produtos que recomendamos de verdade. Os
            links desta página são de afiliado.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-forest uppercase">
            Navegar
          </p>
          <ul className="mt-4 space-y-2 text-sm text-stone">
            <li>
              <a href="/catalogo" className="hover:text-copper">
                Catálogo
              </a>
            </li>
            <li>
              <a href="/sobre" className="hover:text-copper">
                Sobre
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-forest uppercase">
            Transparência
          </p>
          <p className="mt-4 text-sm text-stone">
            Podemos receber comissão por compras feitas através dos links.
            Isso não altera o preço para você.
          </p>
        </div>
      </div>

      <div className="border-t border-sand py-6 text-center text-xs text-stone">
        © {new Date().getFullYear()} Bona Occasio. Todos os direitos reservados.
      </div>
    </footer>
  );
}
