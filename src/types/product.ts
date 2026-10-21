export type CategoryId = "tech" | "fashion" | "fitness" | "home";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: CategoryId;
  affiliateUrl: string;
  featured?: boolean;
}

export interface Category {
  id: CategoryId | "all";
  label: string;
}
