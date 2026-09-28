import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { HoneyProduct } from '../types';
import { HONEY_PRODUCTS, HIVE_TREASURE_IDS } from '../data/honeyProducts';
import { fetchWooCommerceProducts, WOO_CONFIG } from '../services/wooCommerceService';

interface ProductContextType {
  products: HoneyProduct[];
  honeyVarieties: HoneyProduct[];
  hiveTreasures: HoneyProduct[];
  isLoading: boolean;
  isLiveWooCommerce: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductById: (idOrSlug: string) => HoneyProduct | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const CACHE_KEY = 'pasieka_products_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minut cache

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Początkowy stan inicjalizowany z pamięci podręcznej lub fallbacku
  const [products, setProducts] = useState<HoneyProduct[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      }
    } catch {}
    return HONEY_PRODUCTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(Boolean(WOO_CONFIG.isConfigured));
  const [isLiveWooCommerce, setIsLiveWooCommerce] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!WOO_CONFIG.isConfigured) {
      setProducts(HONEY_PRODUCTS);
      setIsLiveWooCommerce(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await fetchWooCommerceProducts();
    setProducts(res.products);
    setIsLiveWooCommerce(res.isLiveWooCommerce);
    if (res.error) setError(res.error);

    // Zapisz w cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: res.products,
        })
      );
    } catch {}

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const honeyVarieties = useMemo(
    () => products.filter(p => !HIVE_TREASURE_IDS.includes(p.id)),
    [products]
  );

  const hiveTreasures = useMemo(
    () => products.filter(p => HIVE_TREASURE_IDS.includes(p.id)),
    [products]
  );

  const getProductById = useCallback(
    (idOrSlug: string) => {
      const normalized = idOrSlug.toLowerCase().trim();
      return products.find(p => p.id.toLowerCase() === normalized || p.name.toLowerCase() === normalized);
    },
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      honeyVarieties,
      hiveTreasures,
      isLoading,
      isLiveWooCommerce,
      error,
      refreshProducts: loadProducts,
      getProductById,
    }),
    [products, honeyVarieties, hiveTreasures, isLoading, isLiveWooCommerce, error, loadProducts, getProductById]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
