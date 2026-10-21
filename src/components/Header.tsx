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

  const navLinks = [
    { to: "/catalogo", label: "Catálogo" },
    { to: "/sobre", label: "Sobre" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || isMenuOpen
          ? "bg-cream/95 backdrop-blur-md border-b border-sand"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 relative">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-forest"
          onClick={() => setIsMenuOpen(false)}
        >
          Bona Occasio<span className="text-copper">.</span>
        </Link>

        {/* Navegação Desktop */}
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

          {/* Botão do Menu Hambúrguer */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-forest hover:text-copper transition-colors"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Painel do Menu Suspenso */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 w-72 rounded-2xl border border-sand bg-cream p-6 shadow-2xl shadow-forest/10 sm:right-8">
            
            {/* Seção Grupos */}
            <div className="mb-6">
              <p className="text-xs font-bold tracking-widest text-forest uppercase mb-3">
                Nossos Grupos
              </p>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone hover:bg-sand hover:text-forest cursor-pointer transition-colors">
                  <Send className="size-4" />
                  Telegram
                </span>
                <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone hover:bg-sand hover:text-forest cursor-pointer transition-colors">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </span>
              </div>
            </div>

            <hr className="border-sand mb-6" />

            {/* Seção Redes Sociais */}
            <div>
              <p className="text-xs font-bold tracking-widest text-forest uppercase mb-3">
                Nos acompanhe nas redes sociais
              </p>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone hover:bg-sand hover:text-forest cursor-pointer transition-colors">
                  <Instagram className="size-4" />
                  Instagram
                </span>
                <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone hover:bg-sand hover:text-forest cursor-pointer transition-colors">
                  <Facebook className="size-4" />
                  Facebook
                </span>
                <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone hover:bg-sand hover:text-forest cursor-pointer transition-colors">
                  <Video className="size-4" />
                  TikTok
                </span>
              </div>
            </div>

          </div>
        )}
      </div>
    </header>
  );
}
