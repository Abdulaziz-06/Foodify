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
 * Retries failed requests up to 2 times with exponential backoff.
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
 * Handles barcode lookup, text search, filtering, and sorting.
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
    let url = `/cgi/search.pl?action=process&json=true&page=${page}&page_size=${limit}${useRelevance ? '' : `&sort_by=${encodeURIComponent(sort)}`}`;

    // Quality Filter: When sorting by Grade, restrict to products with completed nutrition facts
    if (sort === 'nutrition_grades_tags') {
        url += '&states_tags=en:nutrition-facts-completed';
    }

    let tagIndex = 0;

    if (searchQuery) {
        url += `&search_terms=${encodeURIComponent(searchQuery)}`;
    }

    if (category) {
        url += `&tagtype_${tagIndex}=categories&tag_contains_${tagIndex}=contains&tag_${tagIndex}=${encodeURIComponent(category)}`;
        tagIndex++;
    }

    if (vegOnly) {
        // We use ingredients_analysis to get more accurate results than just labels
        // as it's computed by Open Food Facts based on the ingredient list.
        url += `&tagtype_${tagIndex}=ingredients_analysis&tag_contains_${tagIndex}=contains&tag_${tagIndex}=en:vegetarian`;
        tagIndex++;
    }

    const response = await api.get(url, options);

    // Client-side Quality Filter
    if (response.data && response.data.products) {
        if (sort === 'nutrition_grades_tags') {
            // Strict Grade Filtering: Only showing items with known grades (A-E)
            response.data.products = response.data.products.filter(p =>
                p.nutrition_grades_tags &&
                ['a', 'b', 'c', 'd', 'e'].includes(p.nutrition_grades_tags[0])
            );

            // Client-Side Batch Sort: Ensure strictly A->B->C... for this page
            response.data.products.sort((a, b) => {
                const gradeA = a.nutrition_grades_tags[0];
                const gradeB = b.nutrition_grades_tags[0];
                return gradeA.localeCompare(gradeB);
            });
        } else {
            // General Filtering: Remove products with missing names
            response.data.products = response.data.products.filter(p =>
                p.product_name && p.product_name.trim().length > 0
            );
        }
    }

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
