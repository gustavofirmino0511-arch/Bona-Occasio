import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-sand bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-3 sm:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-forest">
            Bona Occasio
          </p>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-stone">
            Curadoria técnica e comparador de custo-benefício. Toda a análise é
            feita dentro do nosso site para você decidir com segurança.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-forest">Navegação</p>
          <ul className="mt-3 space-y-2 text-xs text-stone">
            <li>
              <Link to="/" className="hover:text-copper">
                Início
              </Link>
            </li>
            <li>
              <Link to="/comparar" className="hover:text-copper">
                Comparador Lado a Lado
              </Link>
            </li>
            <li>
              <Link to="/catalogo" className="hover:text-copper">
                Catálogo de Produtos
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-copper">
                Como Escolhemos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-forest">Transparência</p>
          <p className="mt-3 text-xs leading-relaxed text-stone">
            Os links de compra nos produtos são links de afiliado. Podemos
            receber comissão por compras qualificadas sem qualquer custo
            adicional para você.
          </p>
        </div>
      </div>

      <div className="border-t border-sand py-6 text-center text-xs text-stone">
        © {new Date().getFullYear()} Bona Occasio. Todos os direitos reservados.
      </div>
    </footer>
  );
}
