import React, { useEffect, useRef, useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Navbar from '../components/Navbar';
import styles from './Home.module.css';

/**
 * Home Component
 * The central hub of Foodify. Provides a modern hero section for searching 
 * and a dynamic, infinite-scrolling grid for product discovery.
 */
const Home = () => {
    const { products, loading, error, hasMore, loadMore, searchQuery, setSearchQuery } = useProducts();
    const location = useLocation();
    const observerTarget = useRef(null);

    // --- Hero Visuals ---
    const [rotatingIndex, setRotatingIndex] = useState(0);
    const keywords = ["Scan.", "Search.", "Eat."];

    /**
     * Hero Word Rotation
     * Circles through high-impact action words to engage the user.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setRotatingIndex(prev => (prev + 1) % keywords.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [keywords.length]);

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
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0, rootMargin: '100px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadMore]);

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
                                <input
                                    type="text"
                                    placeholder="Search over 3M+ food products..."
                                    className={styles.heroSearchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    className={styles.searchBtn}
                                    onClick={() => {
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
                    </div>

                    {/* Progress Indicator */}
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loader}></div>
                            <p>Discovering Food...</p>
                        </div>
                    )}

                    {/* Empty Search Feedback */}
                    {!loading && products.length === 0 && !error && (
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
