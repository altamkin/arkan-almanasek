"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/app/components/ui/toast";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
  CartItem,
} from "../lib/utils/cart";

let cartCache: CartItem[] | null = null;
const subscribers = new Set<() => void>();

function getSnapshot(): CartItem[] {
  if (cartCache === null) {
    cartCache = getCart();
  }
  return cartCache;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function subscribe(listener: () => void) {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

function emitChange(nextCart: CartItem[]) {
  cartCache = nextCart;
  for (const listener of subscribers) listener();
}

function computeTotal(cart: CartItem[]) {
  return cart.reduce(
    (total, item) => total + (item.price ?? 0) * item.quantity,
    0,
  );
}

function computeCount(cart: CartItem[]) {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

export function useCart() {
  const tCommon = useTranslations("common");
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleAdd = useCallback(
    (item: CartItem, mode: "increment" | "replace" = "increment") => {
      const updated = addToCart(item, mode);
      emitChange(updated);

      if (typeof document !== "undefined") {
        toast.success(tCommon("addedToCart"));
      }
    },
    [tCommon],
  );

  const handleRemove = useCallback((id: number) => {
    const updated = removeFromCart(id);
    emitChange(updated);
  }, []);

  const handleUpdate = useCallback((id: number, quantity: number) => {
    const updated = updateQuantity(id, quantity);
    emitChange(updated);
  }, []);

  const handleClear = useCallback(() => {
    clearCart();
    emitChange([]);
  }, []);

  const handleReplace = useCallback((nextCart: CartItem[]) => {
    const updated = setCart(nextCart);
    emitChange(updated);
  }, []);

  return {
    cart,
    addProduct: handleAdd,
    removeProduct: handleRemove,
    updateProduct: handleUpdate,
    clearCart: handleClear,
    replaceCart: handleReplace,
    total: computeTotal(cart),
    count: computeCount(cart),
  };
}
