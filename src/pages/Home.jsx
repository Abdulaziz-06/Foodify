import React, { useEffect, useRef, useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Filters from '../components/Filters';
import Navbar from '../components/Navbar';
import styles from './Home.module.css';

/**
 * Home Component
 * The central hub of Foodify. Provides a modern hero section for searching 
 * and a dynamic, infinite-scrolling grid for product discovery.
 */
const Home = () => {
    const { products, loading, isSearching, error, hasMore, loadMore, searchQuery, setSearchQuery, setSelectedCategory, forceSearch } = useProducts();
    const location = useLocation();
    const observerTarget = useRef(null);

    // --- Hero Visuals ---
    const [rotatingIndex, setRotatingIndex] = useState(0);
    const keywords = ["Scan.", "Search.", "Eat."];

    const placeholders = ["Sweets", "Biryani", "Maggi", "Coca Cola"];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isInputFocused, setIsInputFocused] = useState(false);

    /**
     * Hero Word & Placeholder Rotation
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setRotatingIndex(prev => (prev + 1) % keywords.length);
            setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
        }, 3000); // Balanced rotation interval
        return () => clearInterval(interval);
    }, [keywords.length, placeholders.length]);

    /**
     * Smart Navigation Management
     * Detects if the user was sent here from another page (like Navbar) 
     * specificially to view products, and smooth-scrolls them down.
     */
    useEffect(() => {
        if (location.state?.scrollTo) {
            const section = document.getElementById(location.state.scrollTo);
            if (section) {
                // Short timeout gives the browser time to finish painting the initial layout.
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location]);

    /**
     * Infinite Scroll Engine
     * Uses the Intersection Observer API to detect when the user reaches 
     * the bottom of the grid and automatically loads the next page of products.
     */
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                // Only trigger if we are intersecting, not already loading, have more items, 
                // and there isn't a persistent error or offline state.
                if (entries[0].isIntersecting && hasMore && !loading && !error) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '200px' } // Increased margin for smoother loading
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadMore, error]);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <main className={styles.container}>
                {/* Hero Section: High-impact search and branding */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.title}>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={rotatingIndex}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.5 }}
                                    className={styles.rotatingText}
                                >
                                    {keywords[rotatingIndex]}
                                </motion.span>
                            </AnimatePresence>
                            <br />
                            <span className={styles.staticTitle}>Ingredients. Nutrition. Data.</span>
                        </h1>

                        <div className={styles.searchWrapper}>
                            <div className={styles.heroSearch}>
                                <Search className={styles.searchIcon} size={20} />
                                <div className={styles.inputContainer}>
                                    <input
                                        type="text"
                                        className={styles.heroSearchInput}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (e.target.value.length > 0) {
                                                setSelectedCategory(''); // Reset category when searching
                                            }
                                        }}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (forceSearch) forceSearch();
                                                const section = document.getElementById('product-section');
                                                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }}
                                    />
                                    <AnimatePresence>
                                        {!searchQuery && !isInputFocused && (
                                            <motion.div
                                                layout
                                                className={styles.placeholderOverlay}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <span className={styles.staticPlaceholder}>Search for "</span>
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={placeholderIndex}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -15 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 250, // Standard smooth spring
                                                            damping: 25
                                                        }}
                                                        className={styles.dynamicPlaceholder}
                                                    >
                                                        {placeholders[placeholderIndex]}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <motion.span layout className={styles.staticPlaceholder}>"</motion.span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    className={styles.searchBtn}
                                    onClick={() => {
                                        if (forceSearch) forceSearch();
                                        const section = document.getElementById('product-section');
                                        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                >
                                    Find Food <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Discovery Section: Product filtering and results grid */}
                <div className={styles.contentSection} id="product-section">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Explore Products</h2>
                        <Filters />
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    <div className={styles.productGrid}>
                        {products.map((product, index) => (
                            <ProductCard key={`${product._id}-${index}`} product={product} />
                        ))}

                        {/* Skeleton Loaders during initial or more results load */}
                        {(loading || isSearching) && [...Array(8)].map((_, i) => (
                            <SkeletonCard key={`skeleton-${i}`} />
                        ))}
                    </div>

                    {/* Empty Search Feedback */}
                    {!loading && !isSearching && products.length === 0 && !error && searchQuery && (
                        <div className={styles.emptyState}>
                            <h3>No results for "{searchQuery}"</h3>
                            <p>Try searching for brand names or common food items.</p>
                        </div>
                    )}

                    {/* Invisible trigger for Infinite Scroll */}
                    <div ref={observerTarget} className={styles.loadTrigger} />

                    {/* Shelf End Feedback */}
                    {!hasMore && products.length > 0 && (
                        <div className={styles.endMessage}>
                            You've reached the end of the aisle! 🍏
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
