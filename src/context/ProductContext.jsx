import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { getProducts } from '../services/api';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Search & Filter Settings ---
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('popularity');

    // --- Internal Refs for Performance ---
    const debounceTimeout = useRef(null);
    const abortController = useRef(null);

    /**
     * Data Reset
     * Clears the product list and resets pagination. 
     * Usually called when the user changes a search term or category.
     */
    const resetList = () => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
    };

    /**
     * Automatic Reset
     * Whenever a filter or search query changes, we start back from page 1.
     */
    useEffect(() => {
        resetList();
    }, [searchQuery, selectedCategory, sortBy]);

    /**
     * Core Data Fetcher
     * Handles the complexity of fetching items from the Open Food Facts API.
     * 
     * @param {boolean} isNewSearch - If true, replaces the list rather than appending (used for resets).
     */
    const loadProducts = useCallback(async (isNewSearch = false) => {
        if (loading) return;

        // If a request is already in progress, we cancel it to avoid "race conditions"
        // where old results might arrive after new ones.
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const data = await getProducts(
                page,
                24,
                searchQuery,
                selectedCategory,
                sortBy,
                { signal: abortController.current.signal }
            );

            if (data.products && data.products.length > 0) {
                // If it's a new search, we clear old items. Otherwise, we add to them (for infinite scroll).
                setProducts(prev => isNewSearch ? data.products : [...prev, ...data.products]);

                // If we got fewer items than requested, it means we've reached the end of the database.
                if (data.products.length < 24) setHasMore(false);
            } else {
                if (isNewSearch) setProducts([]);
                setHasMore(false);
            }
        } catch (err) {
            // We ignore AbortErrors because they are triggered intentionally by our cancel logic.
            if (err.name !== 'AbortError') {
                console.error("Problem loading products:", err);
                setError('We couldn\'t load the products right now. Please check your connection.');
            }
        } finally {
            // Only update loading state if the request wasn't cancelled mid-way.
            if (!abortController.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, [page, searchQuery, selectedCategory, sortBy, loading]);

    /**
     * Smart Fetch Trigger
     * Listens for changes to filters or page numbers.
     * Uses a 500ms "debounce" for search queries so we don't spam the API while the user is typing.
     */
    useEffect(() => {
        const isSearch = searchQuery.length > 0;
        const delay = isSearch ? 500 : 0; // Typing gets a delay, filters are immediate.

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            loadProducts(page === 1);
        }, delay);

        return () => clearTimeout(debounceTimeout.current);
    }, [page, searchQuery, selectedCategory, sortBy]);

    /**
     * Pagination Helper
     * Moves to the next page of results, which triggers the fetch cycle.
     */
    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    // --- Exposed Context Values ---
    const value = {
        products,
        loading,
        error,
        hasMore,
        loadMore,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
