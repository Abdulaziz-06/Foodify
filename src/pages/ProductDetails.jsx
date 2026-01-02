import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductByBarcode } from '../services/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, Info, Zap, Package, Beef, Droplets } from 'lucide-react';
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
            <div className={styles.loadingContainer}>
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
    const nutriments = product.nutriments || {};

    const nutritionFacts = [
        { label: 'Energy', value: nutriments.energy_100g, unit: 'kcal', icon: <Zap size={16} /> },
        { label: 'Fat', value: nutriments.fat_100g, unit: 'g', icon: <Droplets size={16} /> },
        { label: 'Proteins', value: nutriments.proteins_100g, unit: 'g', icon: <Beef size={16} /> },
        { label: 'Carbohydrates', value: nutriments.carbohydrates_100g, unit: 'g', icon: <Package size={16} /> }
    ];

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <main className={styles.container}>
                <button
                    onClick={() => navigate(-1)}
                    className={styles.backLink}
                >
                    <ArrowLeft size={20} /> Back to Products
                </button>

                <div className={styles.grid}>
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.imageSection}
                    >
                        <img
                            src={product.image_front_url || product.image_url}
                            alt={name}
                            className={styles.mainImage}
                        />
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={styles.detailsSection}
                    >
                        <span className={styles.brand}>
                            {product.brands ? product.brands.split(',')[0] : 'Essential Choice'}
                        </span>
                        <h1 className={styles.title}>{name}</h1>

                        <div className={styles.statsRow}>
                            <div className={styles.gradeCard}>
                                <span className={styles.statLabel}>Nutri-Score</span>
                                <div className={styles.gradeWrapper}>
                                    <div className={styles.gradeCircle} data-grade={grade}>
                                        {grade}
                                    </div>
                                    <span className={styles.gradeText}>
                                        Grade {grade.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.badges}>
                            {product.categories?.split(',').slice(0, 5).map((cat, i) => (
                                <span key={i} className={styles.badge}>
                                    {cat.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')}
                                </span>
                            ))}
                        </div>

                        <div className={styles.detailsCard}>
                            <div className={styles.cardHeader}>
                                <Info size={20} />
                                <h3>Ingredients</h3>
                            </div>
                            <p className={styles.ingredients}>
                                {product.ingredients_text || "No ingredient information available for this product."}
                            </p>
                        </div>

                        <div className={styles.detailsCard}>
                            <div className={styles.cardHeader}>
                                <Zap size={20} />
                                <h3>Nutrition Facts (per 100g)</h3>
                            </div>
                            <table className={styles.nutritionTable}>
                                <thead>
                                    <tr>
                                        <th>Nutrient</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nutritionFacts.map((fact, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {fact.icon}
                                                    {fact.label}
                                                </div>
                                            </td>
                                            <td>{fact.value !== undefined ? `${fact.value} ${fact.unit}` : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.verification} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                <CheckCircle size={18} color="var(--grade-a)" />
                                Data sourced from Open Food Facts
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;
