import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { getProducts, getCategories } from '../services/api';

/**
 * Product Context
 * Provides global state management for food products across the whole application.
 * Using context ensures that search results and filter settings are preserved 
 * as the user navigates between pages.
 */
const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    // --- State Storage ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // --- Search & Filter Settings ---
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('unique_scans_n');
    const [vegOnly, setVegOnly] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // --- Internal Refs for Performance ---
    const debounceTimeout = useRef(null);
    const abortController = useRef(null);
    const isLoadingRef = useRef(false);

    // --- Data Initialization ---
    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    // --- Network Status Monitor ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // --- Core Data Fetcher ---
    const loadProducts = useCallback(async (isNewSearch = false, targetPage = page) => {
        if (!navigator.onLine) {
            setError("404 Error: No internet available.");
            setLoading(false);
            return;
        }

        // Prevent parallel fetches for the same page (pagination lock)
        // But allow new searches to override current fetches
        if (isLoadingRef.current && !isNewSearch) return;

        // Cancel any pending request to prevent race conditions
        if (abortController.current) {
            abortController.current.abort();
        }

        // Create a local reference to the controller for THIS SPECIFIC request
        const currentController = new AbortController();
        abortController.current = currentController;

        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            // If it's a new search, we might want to clear products visually beforehand
            // But we already do that in the state setters for better UX

            // If sorting by Grade, we need a larger batch (100) because we strictly filter out 
            const limit = sortBy === 'nutrition_grades_tags' ? 100 : 24;

            const data = await getProducts(
                targetPage,
                limit,
                searchQuery,
                selectedCategory,
                sortBy,
                vegOnly,
                { signal: currentController.signal }
            );

            // ONLY process results if this is still the active request
            if (abortController.current === currentController) {
                if (data.products && data.products.length > 0) {
                    setProducts(prev => {
                        const merged = isNewSearch ? data.products : [...prev, ...data.products];

                        // Global Sort: Ensure entire list is ordered A->B->C... 
                        // This creates a visual shift but guarantees strict order.
                        if (sortBy === 'nutrition_grades_tags') {
                            return merged.sort((a, b) => {
                                const gradeA = (a.nutrition_grades_tags?.[0] || 'z').toLowerCase();
                                const gradeB = (b.nutrition_grades_tags?.[0] || 'z').toLowerCase();
                                return gradeA.localeCompare(gradeB);
                            });
                        }
                        return merged;
                    });
                    // If we got fewer than requested, we're likely done
                    if (data.products.length < 24) setHasMore(false);
                    else setHasMore(true);
                } else {
                    if (isNewSearch) setProducts([]);
                    setHasMore(false);
                }
            }
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Problem loading products:", err);
                if (!navigator.onLine || err.code === 'ERR_NETWORK') {
                    setError("404 Error: No internet connection.");
                } else if (err.response?.status === 429) {
                    setError("Too many requests. Please wait a moment.");
                } else {
                    setError('We couldn\'t load the products. Please try again.');
                }
            }
        } finally {
            // Only turn off loading if this request is still active
            if (abortController.current === currentController) {
                isLoadingRef.current = false;
                setLoading(false);
                setIsSearching(false);
            }
        }
    }, [page, searchQuery, selectedCategory, sortBy, vegOnly]);

    // --- Effect: Watcher for Changes ---
    // This SINGLE effect handles all re-fetching when filters change.
    // It replaces the multiple confusing effects from before.
    useEffect(() => {
        const isSearch = searchQuery.length > 0;
        const delay = isSearch ? 500 : 0; // Debounce mainly for text search

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            // If page is 1, it's a "new search" effectively (or a reset)
            // We pass true for isNewSearch if page === 1 to force replacement
            loadProducts(page === 1, page);
        }, delay);

        return () => clearTimeout(debounceTimeout.current);
    }, [page, searchQuery, selectedCategory, sortBy, vegOnly, loadProducts]);


    // --- Enhanced State Setters ---
    // These update the state AND reset the page to 1, guaranteeing a "New Search" trigger

    const handleSearchChange = (query) => {
        if (query === searchQuery) return;
        setSearchQuery(query);
        setPage(1);
        setIsSearching(true);
        // Clear old results to indicate a new search
        setProducts([]);
    };

    const handleCategoryChange = (cat) => {
        if (cat === selectedCategory) return;
        setSelectedCategory(cat);
        setPage(1);
        setSearchQuery(''); // Clear search when switching category
        setIsSearching(true);
        setProducts([]);
    };

    const handleSortChange = (sort) => {
        if (sort === sortBy) return;
        setSortBy(sort);
        setPage(1);
        setIsSearching(true);
        setProducts([]);
    };

    const handleVegToggle = (val) => {
        if (val === vegOnly) return;
        setVegOnly(val);
        setPage(1);
        setIsSearching(true);
        setProducts([]);

        // Edge Case: If we are in a "Meat" category and toggle Veg, we might need to reset category?
        // The Filters component handles hiding incompatible categories, but if one is *already* selected:
        if (val === true && selectedCategory) {
            // Check if selected category is meat-based (simple heuristic)
            const isMeat = selectedCategory.toLowerCase().includes('meat');
            if (isMeat) {
                setSelectedCategory(''); // Reset to all if incompatible
            }
        }
    };

    const forceSearch = () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        setIsSearching(true);
        setProducts([]);
        setPage(1);
        loadProducts(true, 1);
    };

    const loadMore = () => {
        if (!loading && !isLoadingRef.current && hasMore && isOnline && !error) {
            setPage(prev => prev + 1);
        }
    };

    const value = {
        products,
        categories,
        loading,
        isSearching,
        error,
        hasMore,
        loadMore,
        searchQuery,
        setSearchQuery: handleSearchChange,
        forceSearch,
        selectedCategory,
        setSelectedCategory: handleCategoryChange,
        sortBy,
        setSortBy: handleSortChange,
        vegOnly,
        setVegOnly: handleVegToggle,
        isOnline
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
