
import axios from 'axios';

// baseURL is not set because we are using Vite proxy for /cgi, /category, /api
const api = axios.create({
    timeout: 45000, // Increased to 45 seconds for very slow OpenFoodFacts API
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for better error handling with retry logic
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Initialize retry count if not present
        if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
        }

        // Retry logic for network errors or timeouts (max 2 retries)
        if (originalRequest._retryCount < 2 &&
            (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)) {
            originalRequest._retryCount++;
            const retryDelay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 3000);

            console.log(`Retry attempt ${originalRequest._retryCount}/2 for ${originalRequest.url} after ${retryDelay}ms`);

            // Exponential backoff: wait longer for each retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));

            // Increase timeout for retry attempts
            originalRequest.timeout = 45000;
            return api(originalRequest);
        }

        console.log('Request failed after retries:', originalRequest.url);
        return Promise.reject(error);
    }
);

/**
 * Get products by category
 */
export const getProductsByCategory = async (category, page = 1, sort = 'unique_scans_n') => {
    // Only fetch by category if category is provided
    if (!category) {
        return fetchAllProducts(page, sort);
    }

    // Use search.pl with category tag - improved URL structure for better reliability
    const url = `/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&sort_by=${sort}&page_size=24&json=true&page=${page}`;
    const response = await api.get(url);
    return response.data;
};

/**
 * Search products by name
 * Endpoint: https://world.openfoodfacts.org/cgi/search.pl?search_terms={name}&json=true
 */
export const searchProductsByName = async (name, page = 1, sort = 'unique_scans_n', category = '') => {
    let url = `/cgi/search.pl?action=process&search_terms=${encodeURIComponent(name)}&json=true&page=${page}&sort_by=${sort}&page_size=24`;

    if (category) {
        url += `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}`;
    }

    const response = await api.get(url);
    return response.data;
};

/**
 * Get product details by barcode
 * Endpoint: https://world.openfoodfacts.org/api/v0/product/{barcode}.json
 */
export const getProductByBarcode = async (barcode) => {
    const url = `/api/v0/product/${barcode}.json`;
    const response = await api.get(url);
    return response.data;
};

/**
 * Generic search/fetch for initial load or sorting when no specific category/search is selected
 */
export const fetchAllProducts = async (page = 1, sort = 'unique_scans_n') => {
    const url = `/cgi/search.pl?action=process&sort_by=${sort}&page_size=24&json=true&page=${page}`;
    const response = await api.get(url);
    return response.data;
};

/**
 * Get categories for filters
 */
export const getCategories = async () => {
    try {
        const url = '/categories.json';
        const response = await api.get(url);

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
    } catch {
        return [];
    }
};
