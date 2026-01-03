import axios from 'axios';

/**
 * Configure Axios for Open Food Facts API
 * We use a Vite proxy to handle CORS and routing for /cgi, /api, and /category endpoints.
 */
const api = axios.create({
    timeout: 45000,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Network Resilience Interceptor
 * Automatically retries failed requests (timeouts or network errors) up to 2 times
 * using an exponential backoff strategy to avoid overwhelming the server.
 */
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error); // Guard against missing config
        if (!originalRequest._retryCount) originalRequest._retryCount = 0;

        // Don't retry if the request was cancelled
        if (axios.isCancel(error)) return Promise.reject(error);

        // Retry on network errors or timeouts, up to 2 times
        if (originalRequest._retryCount < 2 &&
            (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)) {
            originalRequest._retryCount++;

            // Wait slightly longer before each retry (1s, then 2s)
            const retryDelay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 3000);
            await new Promise(resolve => setTimeout(resolve, retryDelay));

            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

/**
 * Master Product Fetcher
 * This is the primary way to get products from Open Food Facts. It smartly handles:
 * - Direct Barcode Search: If the query is all numbers, it fetches that specific product.
 * - Text Search: General keyword search (e.g., "Pizza").
 * - Category Filtering: Limits results to specific food groups.
 * - Sorting & Pagination: Handles infinite scroll and relevance sorting.
 */
export const getProducts = async (page = 1, limit = 24, searchQuery = '', category = '', sort = 'unique_scans_n', vegOnly = false, options = {}) => {
    // If the user enters a barcode (all digits), we prioritize a direct lookup for speed and accuracy.
    if (searchQuery && /^\d+$/.test(searchQuery)) {
        try {
            const response = await api.get(`/api/v0/product/${searchQuery}.json`, options);
            return {
                count: response.data.product ? 1 : 0,
                products: response.data.product ? [response.data.product] : []
            };
        } catch (error) {
            // If barcode lookup fails, we return an empty set rather than breaking the UI.
            return { count: 0, products: [] };
        }
    }

    // Otherwise, we build a search query using the Open Food Facts process script.
    // If we have a search query, we omit sort_by to let the API use its default relevance scoring,
    // unless a specific sort has been requested.
    const useRelevance = searchQuery && sort === 'unique_scans_n';
    let url = `/cgi/search.pl?action=process&json=true&page=${page}&page_size=${limit}${useRelevance ? '' : `&sort_by=${sort}`}`;
    let tagIndex = 0;

    if (searchQuery) {
        url += `&search_terms=${encodeURIComponent(searchQuery)}`;
    }

    if (category) {
        url += `&tagtype_${tagIndex}=categories&tag_contains_${tagIndex}=contains&tag_${tagIndex}=${encodeURIComponent(category)}`;
        tagIndex++;
    }

    if (vegOnly) {
        url += `&tagtype_${tagIndex}=labels&tag_contains_${tagIndex}=contains&tag_${tagIndex}=en:vegetarian`;
        tagIndex++;
    }

    const response = await api.get(url, options);
    return response.data;
};

/**
 * Direct Barcode Lookup
 * Fetches the full data for a single product using its unique barcode.
 */
export const getProductByBarcode = async (barcode) => {
    const response = await api.get(`/api/v0/product/${barcode}.json`);
    return response.data;
};

/**
 * Category Discovery
 * Retrieves popular food categories from the database.
 * We filter for categories with at least 5000 products to ensure the UI shows meaningful options.
 */
export const getCategories = async () => {
    try {
        const response = await api.get('/categories.json');
        if (response.data && response.data.tags) {
            return response.data.tags
                .filter(tag => tag.products > 5000)
                .map(tag => ({
                    id: tag.id,
                    name: tag.name,
                    products: tag.products
                }))
                .slice(0, 50);
        }
        return [];
    } catch (err) {
        console.error("Could not load categories:", err);
        return [];
    }
};

export default api;
