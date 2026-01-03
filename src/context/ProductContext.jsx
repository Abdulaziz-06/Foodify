import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
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

    /**
     * Data Reset
     * Clears the product list and resets pagination. 
     * Usually called when the user changes a search term or category.
     */
    const resetList = useCallback(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        setIsSearching(searchQuery.length > 0 || selectedCategory !== '');
    }, [searchQuery, selectedCategory]);

    /**
     * Automatic Reset
     * Whenever a filter or search query changes, we start back from page 1.
     */
    useEffect(() => {
        resetList();
    }, [searchQuery, selectedCategory, sortBy, vegOnly, resetList]);

    /**
     * Core Data Fetcher
     * Handles the complexity of fetching items from the Open Food Facts API.
     * 
     * @param {boolean} isNewSearch - If true, replaces the list rather than appending (used for resets).
     */
    const loadProducts = useCallback(async (isNewSearch = false, targetPage = page) => {
        if (!navigator.onLine) {
            setError("404 Error: No internet available.");
            setLoading(false);
            return;
        }

        if (isLoadingRef.current && !isNewSearch) return; // Use isLoadingRef to prevent multiple pagination loads

        // If a request is already in progress, we cancel it to avoid "race conditions"
        // where old results might arrive after new ones.
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        isLoadingRef.current = true; // Set pagination lock
        setLoading(true); // Set general loading state
        setError(null);

        try {
            const data = await getProducts(
                targetPage,
                24,
                searchQuery,
                selectedCategory,
                sortBy,
                vegOnly,
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
            // We ignore cancellations because they are triggered intentionally by our cancel logic.
            if (!axios.isCancel(err)) {
                console.error("Problem loading products:", err);

                // Detailed error mapping
                if (!navigator.onLine || err.code === 'ERR_NETWORK') {
                    setError("404 Error: No internet connection. Please check your network.");
                } else if (err.response?.status === 429) {
                    setError("Too many requests. Please wait a moment before searching again.");
                } else if (err.response?.status === 500) {
                    setError("The food database is currently having trouble. We've paused loading to avoid too many requests.");
                    setHasMore(false); // Stop trying to load more if server is failing
                } else {
                    setError('We couldn\'t load the products right now. Please try again later.');
                }
            }
        } finally {
            // Only update loading state if the request wasn't cancelled mid-way.
            if (!abortController.current?.signal.aborted) {
                isLoadingRef.current = false; // Release pagination lock
                setLoading(false); // Release general loading state
                setIsSearching(false); // Clear typing/searching state
            }
        }
    }, [page, searchQuery, selectedCategory, sortBy, vegOnly]);

    /**
     * Smart Fetch Trigger
     * Listens for changes to filters or page numbers.
     * Uses a 500ms "debounce" for search queries so we don't spam the API while the user is typing.
     */
    useEffect(() => {
        // Don't trigger if offline
        if (!isOnline) {
            setError("No internet available.");
            return;
        }

        const isSearch = searchQuery.length > 0;
        const delay = isSearch ? 700 : 0; // Balanced typing delay

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            loadProducts(page === 1, page);
        }, delay);

        return () => clearTimeout(debounceTimeout.current);
    }, [page, searchQuery, selectedCategory, sortBy, vegOnly, isOnline, loadProducts]);

    const forceSearch = () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        loadProducts(true, 1);
    };

    /**
     * Pagination Helper
     * Moves to the next page of results, which triggers the fetch cycle.
     */
    const loadMore = () => {
        // Prevent multiple simultaneous triggers and respect offline/error states
        if (!loading && !isLoadingRef.current && hasMore && isOnline && !error) {
            setPage(prev => prev + 1);
        }
    };

    // --- Exposed Context Values ---
    const value = {
        products,
        loading,
        isSearching,
        error,
        hasMore,
        loadMore,
        searchQuery,
        setSearchQuery,
        forceSearch,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        vegOnly,
        setVegOnly,
        isOnline
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
