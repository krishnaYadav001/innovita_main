import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';

export interface CartItem extends Product {
  quantity: number;
  rating?: number; // Optional rating from 1-5
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateRating: (productId: string, rating: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        totalItems: 0,

        addToCart: (product: Product, quantity: number = 1) => {
          const { items } = get();
          const existingItem = items.find(item => item.id === product.id);

          if (existingItem) {
            // If item already exists, update quantity
            set({
              items: items.map(item => 
                item.id === product.id 
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              totalItems: get().totalItems + quantity
            });
          } else {
            // Add new item to cart
            set({
              items: [...items, { ...product, quantity }],
              totalItems: get().totalItems + quantity
            });
          }
        },

        removeFromCart: (productId: string) => {
          const { items } = get();
          const itemToRemove = items.find(item => item.id === productId);
          
          if (itemToRemove) {
            set({
              items: items.filter(item => item.id !== productId),
              totalItems: get().totalItems - itemToRemove.quantity
            });
          }
        },

        updateQuantity: (productId: string, quantity: number) => {
          const { items } = get();
          const oldItem = items.find(item => item.id === productId);
          
          if (oldItem) {
            const quantityDiff = quantity - oldItem.quantity;
            
            set({
              items: items.map(item => 
                item.id === productId 
                  ? { ...item, quantity }
                  : item
              ),
              totalItems: get().totalItems + quantityDiff
            });
          }
        },

        updateRating: (productId: string, rating: number) => {
          const { items } = get();
          
          set({
            items: items.map(item => 
              item.id === productId 
                ? { ...item, rating }
                : item
            )
          });
        },

        clearCart: () => {
          set({
            items: [],
            totalItems: 0
          });
        }
      }),
      {
        name: 'cart-store',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);
