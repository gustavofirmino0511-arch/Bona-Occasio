import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Send, MessageCircle, Facebook, Instagram, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trava a rolagem do site quando o menu lateral está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/catalogo", label: "Catálogo" },
    { to: "/sobre", label: "Sobre" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-cream/90 backdrop-blur-md border-b border-sand"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-forest"
          >
            Bona Occasio<span className="text-copper">.</span>
          </Link>

          {/* Navegação Desktop (Telas grandes) */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone sm:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "transition-colors hover:text-forest",
                    isActive && "text-forest font-semibold",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/catalogo"
              className="hidden rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-forest-soft sm:block"
            >
              Ver ofertas
            </Link>

            {/* Botão Hambúrguer (3 barrinhas) - Sempre visível no canto direito */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-forest hover:text-copper transition-colors"
              aria-label="Abrir menu lateral"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 
        =========================================
        GAVETA LATERAL (SIDE DRAWER) - Abre pela direita
        =========================================
      */}
      
      {/* Fundo escuro atrás do menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* O Menu em si */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Cabeçalho do Menu */}
        <div className="flex h-16 items-center justify-between border-b border-sand px-6">
          <span className="font-display text-lg font-semibold text-forest">
            Menu
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="rounded-full p-2 text-stone transition-colors hover:bg-sand hover:text-forest"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Conteúdo do Menu */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Seção Grupos */}
          <div className="mb-10">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-forest uppercase">
              Nossos Grupos
            </h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <Send className="size-5 text-copper" />
                Canal no Telegram
              </a>
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <MessageCircle className="size-5 text-copper" />
                Grupo no WhatsApp
              </a>
            </div>
          </div>

          {/* Seção Redes Sociais */}
          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-forest uppercase">
              Nos acompanhe nas redes sociais
            </h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <Instagram className="size-5 text-copper" />
                Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <Facebook className="size-5 text-copper" />
                Facebook
              </a>
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <Video className="size-5 text-copper" />
                TikTok
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
