import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
// Importação corrigida: Facebook e Instagram removidos daqui
import { Menu, X, Send, MessageCircle, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mantive o useEffect que estava no seu import original (ajuste a lógica se necessário)
  useEffect(() => {
    // Lógica de scroll ou comportamento do menu aqui
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Seu Logo Aqui
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-semibold")}
          >
            Início
          </NavLink>
          <NavLink 
            to="/sobre" 
            className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-semibold")}
          >
            Sobre
          </NavLink>
          <NavLink 
            to="/contato" 
            className={({ isActive }) => cn("hover:text-primary transition-colors", isActive && "text-primary font-semibold")}
          >
            Contato
          </NavLink>
        </nav>

        {/* Ações e Redes Sociais (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Redes Sociais em Texto (Substituindo os ícones) */}
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <a 
              href="LINK_DO_INSTAGRAM_AQUI" // <-- COLE SEU LINK AQUI
              target="_blank" 
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Instagram
            </a>
            <a 
              href="LINK_DO_FACEBOOK_AQUI" // <-- COLE SEU LINK AQUI
              target="_blank" 
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Facebook
            </a>
          </div>

          {/* Ícones Utilitários (Mantidos) */}
          <div className="flex items-center gap-4 border-l pl-6">
            <a href="https://wa.me/seu-numero" target="_blank" rel="noreferrer" title="WhatsApp">
              <MessageCircle className="w-5 h-5 text-gray-600 hover:text-primary transition-colors" />
            </a>
            <a href="/enviar" title="Enviar">
              <Send className="w-5 h-5 text-gray-600 hover:text-primary transition-colors" />
            </a>
            <Video className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Botão Mobile */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white absolute w-full shadow-lg">
          <nav className="flex flex-col p-4 gap-4">
            <NavLink to="/" className="hover:text-primary">Início</NavLink>
            <NavLink to="/sobre" className="hover:text-primary">Sobre</NavLink>
            <NavLink to="/contato" className="hover:text-primary">Contato</NavLink>
            
            {/* Redes Sociais em Texto (Mobile) */}
            <div className="flex gap-4 pt-4 border-t text-sm font-medium text-gray-600">
              <a 
                href="LINK_DO_INSTAGRAM_AQUI" // <-- COLE SEU LINK AQUI
                target="_blank" 
                rel="noreferrer"
              >
                Instagram
              </a>
              <a 
                href="LINK_DO_FACEBOOK_AQUI" // <-- COLE SEU LINK AQUI
                target="_blank" 
                rel="noreferrer"
              >
                Facebook
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
