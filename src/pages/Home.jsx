
import React, { useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Navbar from '../components/Navbar';
import styles from './Home.module.css';

const Home = () => {
    const { products, loading, error, hasMore, loadMore } = useProducts();
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
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
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Discover Real Food</h1>
                    <p className={styles.subtitle}>
                        Explore ingredients, nutrition grades, and detailed data for over a million food products.
                    </p>
                </div>

                <Filters />

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.grid}>
                    {products.map((product, index) => (
                        <ProductCard key={`${product._id}-${index}`} product={product} />
                    ))}
                </div>

                {loading && <div className={styles.loading}>Loading yummy data...</div>}

                {!loading && products.length === 0 && !error && (
                    <div className={styles.endMessage}>No products found. Try a different search.</div>
                )}

                <div ref={observerTarget} className={styles.loadTrigger} />

                {!hasMore && products.length > 0 && (
                    <div className={styles.endMessage}>You've reached the end of the aisle!</div>
                )}
            </div>
        </>
    );
};

export default Home;
