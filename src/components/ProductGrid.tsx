import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-stone">
        Nenhum produto nesta categoria por enquanto.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
