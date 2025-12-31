
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('unique_scans_n'); // default popular

    // Debounce refs
    const searchTimeout = useRef(null);
    const loadingRef = useRef(false);

    // Fetch Categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            const cats = await api.getCategories();
            setCategories(cats);
        };
        loadCategories();
    }, []);

    // Main Fetch Logic
    const loadProducts = useCallback(async (reset = false) => {
        if (loadingRef.current) return; // Prevent double firing
        loadingRef.current = true;
        setLoading(true);

        // If resetting, clear previous error
        if (reset) setError(null);

        try {
            // Logic for page number: if reset, use 1, else use current page state
            const currentPage = reset ? 1 : page;
            let data;

            console.log(`[ProductContext] Loading products. Page: ${currentPage}, Query: ${searchQuery}`);

            if (searchQuery) {
                data = await api.searchProductsByName(searchQuery, currentPage, sortBy);
            } else {
                data = await api.fetchProducts(currentPage, selectedCategory, sortBy);
            }

            const newProducts = data.products || [];
            console.log(`[ProductContext] Fetched ${newProducts.length} products.`);

            if (reset) {
                setProducts(newProducts);
                setPage(2); // Prepare next page
            } else {
                // Prevent duplicates if API returns same page
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p._id));
                    const uniqueNew = newProducts.filter(p => !existingIds.has(p._id));
                    return [...prev, ...uniqueNew];
                });
                setPage(prev => prev + 1);
            }

            // If we got fewer than requested (usually 20 or 24), we are done
            if (newProducts.length < 20) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setError(null);

        } catch (err) {
            console.error("[ProductContext] Error:", err);
            // Only set error if we have NO products to show. 
            // If we have products but loadMore fails, maybe just stop infinite scroll or toast?
            // For now, simple error setting:
            if (reset) {
                setError("Failed to load products. Please check your connection.");
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [page, searchQuery, selectedCategory, sortBy]);

    // Handle Search/Filter changes with Debounce
    useEffect(() => {
        // Clear any pending timeouts
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        // Reset state for new search
        setHasMore(true);

        searchTimeout.current = setTimeout(() => {
            loadProducts(true);
        }, 800); // 800ms debounce

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchQuery, selectedCategory, sortBy]);

    const value = {
        products,
        loading,
        error,
        categories,
        hasMore,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        loadMore: () => {
            // Only load more if we have more and aren't loading
            if (hasMore && !loading && !loadingRef.current) {
                loadProducts(false);
            }
        }
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
