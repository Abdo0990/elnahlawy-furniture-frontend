import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'elnahlawy_cart';
const CartContext = createContext(null);

function getStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    if (!product?.isAvailable) return;

    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);
      return existing
        ? current.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setItems((current) =>
      current.map((item) =>
        item._id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (productId) => {
    setItems((current) => current.filter((item) => item._id !== productId));
  };

  const clearCart = () => setItems([]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      total,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, total, isCartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('يجب استخدام useCart داخل CartProvider');
  return context;
}
