
import axios from 'axios';

// baseURL is not set because we are using Vite proxy for /cgi, /category, /api
const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetchProducts = async (page = 1, category = '', sort = 'unique_scans_n') => {
    try {
        let url;
        if (category) {
            // Search by category
            url = `/category/${category}.json?page=${page}`;
        } else {
            // Search.pl endpoint via proxy
            url = `/cgi/search.pl?search_simple=1&action=process&json=1&page=${page}&sort_by=${sort}`;
        }

        console.log(`[API] Fetching products: ${url}`);
        const response = await api.get(url);
        console.log("[API] Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("[API] Error fetching products:", error);
        throw error;
    }
};

export const searchProductsByName = async (name, page = 1, sort = 'unique_scans_n') => {
    try {
        const url = `/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1&page=${page}&sort_by=${sort}`;
        console.log(`[API] Searching products: ${url}`);
        const response = await api.get(url);
        if (!response.data) {
            throw new Error("No data received from API");
        }
        console.log("[API] Search Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`[API] Error searching products "${name}":`, error);
        throw error;
    }
};

export const getProductByBarcode = async (barcode) => {
    try {
        const url = `/api/v0/product/${barcode}.json`;
        console.log(`[API] Fetching barcode: ${url}`);
        const response = await api.get(url);
        console.log("[API] Barcode Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`[API] Error fetching barcode "${barcode}":`, error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const url = '/categories.json';
        console.log(`[API] Fetching categories: ${url}`);
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
    } catch (error) {
        console.error("[API] Error fetching categories:", error);
        return [];
    }
}
