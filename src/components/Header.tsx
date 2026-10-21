import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

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
        scrolled
          ? "bg-cream/85 backdrop-blur-md border-b border-sand"
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

        <Link
          to="/catalogo"
          className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-forest-soft"
        >
          Ver ofertas
        </Link>
      </div>
    </header>
  );
}
