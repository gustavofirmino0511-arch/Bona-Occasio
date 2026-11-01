import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Lock, Menu, X } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { trayProductIds, isAdminAuthenticated } = useCompare();

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
    { to: "/", label: "Início" },
    { to: "/comparar", label: "Comparador" },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/sobre", label: "Sobre" },
    ...(isAdminAuthenticated
      ? [{ to: "/estudio-ia", label: "Painel do Dono (IA)" }]
      : []),
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-colors duration-200",
          scrolled
            ? "border-b border-sand bg-cream/95 backdrop-blur-md"
            : "border-b border-sand/60 bg-cream/80",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-5 sm:px-8">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-forest whitespace-nowrap shrink-0"
          >
            Bona Occasio
          </Link>

          {/* Zone 2: Navigation links */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-7 text-sm font-medium text-stone sm:flex"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "py-1 transition-colors hover:text-forest whitespace-nowrap shrink-0",
                    isActive &&
                      "border-b-2 border-copper font-semibold text-forest",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 primary action (desktop) + mobile menu trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/comparar"
              className="hidden rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft sm:inline-flex whitespace-nowrap shrink-0"
            >
              {trayProductIds.length > 0
                ? `Comparar (${trayProductIds.length})`
                : "Comparar produtos"}
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-lg p-2 text-forest transition-colors hover:bg-sand hover:text-copper sm:hidden"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs transition-opacity duration-200 sm:hidden",
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-cream shadow-2xl transition-transform duration-200 ease-out sm:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sand px-6">
          <span className="font-display text-lg font-semibold text-forest">
            Bona Occasio
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-stone transition-colors hover:bg-sand hover:text-forest"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-forest text-cream font-semibold"
                      : "text-stone hover:bg-sand hover:text-forest",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 border-t border-sand pt-6">
            <Link
              to="/comparar"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-lg bg-forest px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-soft"
            >
              Comparar Produtos
            </Link>

            {isAdminAuthenticated && (
              <Link
                to="/estudio-ia"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-copper px-4 py-2.5 text-xs font-semibold text-copper"
              >
                <Lock className="size-3.5" />
                Painel do Dono (IA)
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
