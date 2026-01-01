
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


            if (searchQuery) {
                // If query is numeric, it might be a barcode
                if (/^\d+$/.test(searchQuery)) {
                    const barcodeData = await api.getProductByBarcode(searchQuery);
                    data = { products: barcodeData.product ? [barcodeData.product] : [] };
                } else {
                    data = await api.searchProductsByName(searchQuery, currentPage, sortBy, selectedCategory);
                }
            } else if (selectedCategory) {
                data = await api.getProductsByCategory(selectedCategory, currentPage, sortBy);
            } else {
                data = await api.fetchAllProducts(currentPage, sortBy);
            }

            const newProducts = data.products || [];

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
            console.error("Fetch error:", err);
            console.error("Error details:", {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                url: err.config?.url,
                method: err.config?.method
            });

            // Set user-friendly error message
            if (reset) {
                if (err.code === 'ECONNABORTED') {
                    setError("Request timed out. The API is slow, please try again.");
                } else if (err.response?.status === 429) {
                    setError("Too many requests. Please wait a moment and try again.");
                } else if (err.response?.status >= 500) {
                    setError("Server error. The API is temporarily unavailable.");
                } else {
                    setError("Failed to load products. Please check your connection.");
                }
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [page, searchQuery, selectedCategory, sortBy]);

    // Initial Load: Load products immediately on mount
    useEffect(() => {
        loadProducts(true);
    }, []); // Only run once on mount

    // Handle Search/Filter changes with Debounce
    useEffect(() => {
        // Skip initial render (when all filters are default/empty and products are empty)
        if (products.length === 0 && !searchQuery && !selectedCategory && sortBy === 'unique_scans_n') {
            return; // Let the initial load effect handle this
        }

        // Clear any pending timeouts
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        // Reset state for new search
        setHasMore(true);
        // Set loading immediately for visual feedback
        setLoading(true);

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
