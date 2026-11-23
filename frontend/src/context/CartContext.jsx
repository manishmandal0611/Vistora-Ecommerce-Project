import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const emptyCart = {
  id: null,
  items: [],
  totalItems: 0,
  subtotal: 0,
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(emptyCart);
      return;
    }

    setCartLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart || emptyCart);
    } catch {
      setCart(emptyCart);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/cart/items", { productId, quantity });
    setCart(data.cart || emptyCart);
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity });
    setCart(data.cart || emptyCart);
    return data;
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/items/${productId}`);
    setCart(data.cart || emptyCart);
    return data;
  };

  const clearCart = async () => {
    const { data } = await api.delete("/cart");
    setCart(data.cart || emptyCart);
    return data;
  };

  const value = {
    cart,
    items: cart.items || [],
    totalItems: cart.totalItems || 0,
    subtotal: cart.subtotal || 0,
    cartLoading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
