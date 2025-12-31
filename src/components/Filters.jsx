
import React from 'react';
import { useProducts } from '../context/ProductContext';
import styles from './Filters.module.css';

const Filters = () => {
    const { categories, selectedCategory, setSelectedCategory, sortBy, setSortBy } = useProducts();

    return (
        <div className={styles.filterContainer}>
            <div>
                <span className={styles.label}>Category:</span>
                <select
                    className={styles.select}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.products})</option>
                    ))}
                </select>
            </div>

            <div>
                <span className={styles.label}>Sort By:</span>
                <select
                    className={styles.select}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="unique_scans_n">Popularity</option>
                    <option value="product_name">Name (A-Z)</option>
                    <option value="created_t">Newest</option>
                </select>
            </div>
        </div>
    );
};

export default Filters;
