import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareTray } from "@/components/CompareTray";
import { CompareProvider } from "@/context/CompareContext";
import { Home } from "@/pages/Home";
import { Catalog } from "@/pages/Catalog";
import { Compare } from "@/pages/Compare";
import { AiStudio } from "@/pages/AiStudio";
import { ProductDetail } from "@/pages/ProductDetail";
import { About } from "@/pages/About";

export default function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/comparar" element={<Compare />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/estudio-ia" element={<AiStudio />} />
              <Route path="/admin" element={<AiStudio />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/sobre" element={<About />} />
            </Routes>
          </main>
          <CompareTray />
          <Footer />
        </div>
      </BrowserRouter>
    </CompareProvider>
  );
}
