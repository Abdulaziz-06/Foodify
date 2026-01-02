
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
        if (loadingRef.current && !reset) return; // Allow reset to bypass
        loadingRef.current = true;
        setLoading(true);

        if (reset) {
            setError(null);
            setProducts([]); // Clear immediately for visual feedback
        }

        try {
            const currentPage = reset ? 1 : page;
            let data;

            if (searchQuery) {
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
                setPage(2);
            } else {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p._id));
                    const uniqueNew = newProducts.filter(p => !existingIds.has(p._id));
                    return [...prev, ...uniqueNew];
                });
                setPage(prev => prev + 1);
            }

            setHasMore(newProducts.length >= 20);
            setError(null);

        } catch (err) {
            console.error("Fetch error:", err);
            if (reset) {
                setError("Failed to load products. The OpenFoodFacts API might be busy. Please try again.");
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [page, searchQuery, selectedCategory, sortBy]);

    // Initial Load
    useEffect(() => {
        loadProducts(true);
    }, []); 

    // Handle Search/Filter changes with Debounce
    useEffect(() => {
        // Skip initial call as it's handled by mount useEffect
        const isInitial = !searchQuery && !selectedCategory && sortBy === 'unique_scans_n' && page === 1;
        
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(() => {
            loadProducts(true);
        }, 600); // Slightly faster debounce

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
