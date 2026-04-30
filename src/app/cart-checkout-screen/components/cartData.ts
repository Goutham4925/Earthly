export interface CartItem {
  id: string;
  productId: string;
  name: string;
  vendor: string;
  image: string;
  imageAlt: string;
  price: number;
  originalPrice: number;
  discountPct: number;
  unit: string;
  quantity: number;
  maxQty: number;
  category: string;
}

export const initialCartItems: CartItem[] = [
{
  id: 'cart-001',
  productId: 'prod-001',
  name: 'DAP Fertilizer (Diammonium Phosphate)',
  vendor: 'Kisan Agro Supplies',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png",
  imageAlt: 'White granular DAP fertilizer in an open bag on wooden surface',
  price: 1350,
  originalPrice: 1600,
  discountPct: 16,
  unit: '50kg bag',
  quantity: 2,
  maxQty: 10,
  category: 'Fertilizers'
},
{
  id: 'cart-002',
  productId: 'prod-007',
  name: 'Organic Vermicompost (Earthworm Compost)',
  vendor: 'NatureFarm Organics',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1174846d6-1772347292568.png",
  imageAlt: 'Dark brown organic vermicompost in an open jute sack on farm ground',
  price: 420,
  originalPrice: 500,
  discountPct: 16,
  unit: '25kg bag',
  quantity: 3,
  maxQty: 20,
  category: 'Organic'
},
{
  id: 'cart-003',
  productId: 'prod-009',
  name: 'Battery-Operated Knapsack Sprayer 16L',
  vendor: 'Agro Tools India',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1736ac5d8-1764657819365.png",
  imageAlt: 'Blue battery-operated knapsack sprayer being used in a vegetable field',
  price: 2850,
  originalPrice: 3400,
  discountPct: 16,
  unit: 'per unit',
  quantity: 1,
  maxQty: 5,
  category: 'Tools'
}];