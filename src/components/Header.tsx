import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Ícones de marcas (SVGs oficiais, pois o lucide-react removeu na v1) ---
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sand px-6">
          <span className="font-display text-lg font-semibold text-forest">
            Menu
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="rounded-full p-2 text-stone transition-colors hover:bg-sand hover:text-forest"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          <div className="mb-10">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-forest uppercase">
              Nos siga nas redes sociais
            </h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <InstagramIcon className="size-5 text-copper" />
                Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <FacebookIcon className="size-5 text-copper" />
                Facebook
              </a>
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <TikTokIcon className="size-5 text-copper" />
                TikTok
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-forest uppercase">
              Nossos Grupos
            </h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <TelegramIcon className="size-5 text-copper" />
                Grupo no Telegram
              </a>
              <a
                href="#"
                className="flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-stone transition-all hover:border-sand hover:bg-white hover:text-forest hover:shadow-sm"
              >
                <WhatsAppIcon className="size-5 text-copper" />
                Canal no WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
