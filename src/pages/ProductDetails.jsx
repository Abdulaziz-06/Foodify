import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductByBarcode } from '../services/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Robust name extraction
    const getBestName = (p) => {
        const name = p.product_name || p.product_name_en || p.generic_name;
        if (name && name.trim() && name.toLowerCase() !== 'unknown') return name;
        const brand = p.brands?.split(',')[0];
        if (brand && brand.trim() && brand.toLowerCase() !== 'unknown') return brand;
        const category = p.categories?.split(',')[0];
        if (category && category.trim() && category.toLowerCase() !== 'unknown') {
            return category.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');
        }
        return "Essential Food Product";
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductByBarcode(id);
                if (data.status === 0 || !data.product) {
                    setError('Product details not found.');
                } else {
                    setProduct(data.product);
                }
            } catch (err) {
                setError('Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader}></div>
                <p>Retrieving nutrition data...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.errorContainer}>
                <Navbar />
                <div className={styles.errorContent}>
                    <AlertTriangle size={64} />
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className={styles.backBtn}>
                        <ArrowLeft size={20} /> Back to Search
                    </button>
                </div>
            </div>
        );
    }

    const name = getBestName(product);
    const grade = product.nutrition_grades?.toLowerCase() || 'unknown';

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <main className={styles.container}>
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className={styles.floatBackBtn}
                >
                    <ArrowLeft size={24} />
                </motion.button>

                <div className={styles.contentGrid}>
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.imageSection}
                    >
                        <div className={styles.mainImageContainer}>
                            <img
                                src={product.image_front_url || product.image_url}
                                alt={name}
                                className={styles.mainImage}
                            />
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={styles.detailsSection}
                    >
                        <div className={styles.header}>
                            <span className={styles.categoryBadge}>{product.categories?.split(',')[0].replace(/^[a-z]{2}:/, '')}</span>
                            <h1 className={styles.productTitle}>{name}</h1>
                            <p className={styles.brandName}>{product.brands ? `by ${product.brands.split(',')[0]}` : 'Essential Choice'}</p>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statCard} data-grade={grade}>
                                <div className={styles.gradeCircle}>
                                    {grade}
                                </div>
                                <span className={styles.statLabel}>Nutri-Score</span>
                            </div>
                            <div className={styles.statCard}>
                                <Zap size={24} className={styles.statIcon} />
                                <span className={styles.statValue}>
                                    {product.nutriments?.energy_100g || 0}
                                    <small>kcal/100g</small>
                                </span>
                                <span className={styles.statLabel}>Energy Value</span>
                            </div>
                        </div>

                        <div className={styles.infoSection}>
                            <div className={styles.sectionHeader}>
                                <Info size={20} />
                                <h3>Product Intel</h3>
                            </div>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>Quantity</label>
                                    <span>{product.quantity || 'N/A'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Ingredients Analyzed</label>
                                    <span>{product.ingredients_text ? 'Available' : 'Limited Data'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Packaging</label>
                                    <span>{product.packaging || 'Standard Packaging'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Serving Size</label>
                                    <span>{product.serving_size || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.verification}>
                                <CheckCircle size={18} />
                                Authenticated by Open Food Facts
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;
