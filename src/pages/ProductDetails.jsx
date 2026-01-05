import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Zap,
    Droplets,
    Beef,
    Package,
    Info,
    AlertTriangle,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { getProductByBarcode } from '../services/api';
import Navbar from '../components/Navbar';
import styles from './ProductDetails.module.css';

/**
/**
 * Product Details Page
 * Displays detailed ingredient and nutrition information for a specific product.
 */
const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Extract the most accurate product name from available fields
    const getBestName = (p) => {
        const name = p.product_name || p.product_name_en || p.generic_name;
        if (name && name.trim() && name.toLowerCase() !== 'unknown') return name;

        const brand = p.brands?.split(',')[0];
        if (brand && brand.trim() && brand.toLowerCase() !== 'unknown') return brand;

        const category = p.categories?.split(',')[0];
        if (category && category.trim() && category.toLowerCase() !== 'unknown') {
            return category.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');
        }

        return "Natural Food Selection";
    };

    // Fetch product data using the barcode from URL
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductByBarcode(id);
                // Status 0 or missing product object indicates the barcode wasn't found.
                if (data.status === 0 || !data.product) {
                    setError('We couldn\'t find any details for this specific product.');
                } else {
                    setProduct(data.product);
                }
            } catch (err) {
                console.error("Fetch failure:", err);
                setError('Our database is currently unresponsive. Please try again soon.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <Navbar />
                <main className={styles.container}>
                    <div className={styles.skeletonDetails}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.skeletonInfo}>
                            <div className={styles.skeletonLine} />
                            <div className={styles.skeletonLineLarge} />
                            <div className={styles.skeletonBox} />
                            <div className={styles.skeletonBox} />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.errorContainer}>
                <Navbar />
                <div className={styles.errorContent}>
                    <AlertTriangle size={64} />
                    <h2>Notice</h2>
                    <p>{error || 'Something went wrong during retrieval.'}</p>
                    <button onClick={() => navigate('/')} className={styles.backBtn}>
                        <ArrowLeft size={20} /> Back to Exploration
                    </button>
                </div>
            </div>
        );
    }

    const name = getBestName(product);
    const rawGrade = product.nutrition_grades?.toLowerCase() || 'unknown';
    // Map long strings to short display versions for the circle,(Here the API returns Unknown grade which overflows the circles)
    const displayGradeMap = {
        'not-applicable': 'N/A',
        'unknown': '?',
    };
    const displayGrade = displayGradeMap[rawGrade] || rawGrade.toUpperCase();
    const nutriments = product.nutriments || {};

    // --- Data Processing ---

    // We prioritize Kcal values but fallback to joules or general energy if kcal is missing.
    const energy = nutriments['energy-kcal_100g'] ?? nutriments.energy_100g_kcal ?? nutriments.energy_100g;

    const nutritionFacts = [
        { label: 'Energy', value: energy, unit: 'kcal', icon: <Zap size={16} /> },
        { label: 'Fat', value: nutriments.fat_100g, unit: 'g', icon: <Droplets size={16} /> },
        { label: 'Proteins', value: nutriments.proteins_100g, unit: 'g', icon: <Beef size={16} /> },
        { label: 'Carbohydrates', value: nutriments.carbohydrates_100g, unit: 'g', icon: <Package size={16} /> }
    ];

    // Multi-language ingredient support ensures we show data even if only available in the product's origin language.
    const ingredients = product.ingredients_text ||
        product.ingredients_text_en ||
        product.ingredients_text_fr ||
        product.ingredients_text_es;

    // Quality Check: We only show the "Limited Data" banner if both critical fields are missing.
    const isCriticalDataMissing = !ingredients && (!nutriments.energy_100g && !nutriments['energy-kcal_100g']);
    const isMarkedIncomplete = product.states_tags?.some(tag => tag.includes('to-be-completed') || tag.includes('empty'));
    const showWarningBanner = isMarkedIncomplete && isCriticalDataMissing;

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <main className={styles.container}>
                {/* Back Navigation */}
                <button onClick={() => navigate(-1)} className={styles.backLink}>
                    <ArrowLeft size={20} /> Back
                </button>

                {/* Banner: shown if data is  lacking */}
                {showWarningBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.warningBanner}
                    >
                        <AlertTriangle size={20} />
                        <span>This product's data is currently incomplete. Some details may be missing.</span>
                    </motion.div>
                )}

                <div className={styles.grid}>
                    {/* Visual Media Layer */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.imageSection}
                    >
                        <img
                            src={product.image_front_url || product.image_url || 'https://via.placeholder.com/400x500?text=No+Image'}
                            alt={name}
                            className={styles.mainImage}
                        />
                    </motion.section>

                    {/* Detailed Information Layer */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={styles.detailsSection}
                    >
                        <span className={styles.brand}>
                            {product.brands ? product.brands.split(',')[0] : 'Artisanal Brand'}
                        </span>
                        <h1 className={styles.title}>{name}</h1>

                        <div className={styles.statsRow}>
                            <div className={styles.gradeCard}>
                                <span className={styles.statLabel}>Nutri-Score</span>
                                <div className={styles.gradeWrapper}>
                                    <div className={styles.gradeCircle} data-grade={rawGrade}>
                                        {displayGrade}
                                    </div>
                                    <span className={styles.gradeText}>
                                        {rawGrade === 'unknown' ? 'Not Evaluated' :
                                            rawGrade === 'not-applicable' ? 'Not Applicable' :
                                                `Grade ${rawGrade.toUpperCase()}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Discovery Badges */}
                        <div className={styles.badges}>
                            {product.categories?.split(',').slice(0, 5).map((cat, i) => (
                                <span key={i} className={styles.badge}>
                                    {cat.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')}
                                </span>
                            ))}
                        </div>

                        {/* Ingredients Breakdown */}
                        <div className={styles.detailsCard}>
                            <div className={styles.cardHeader}>
                                <Info size={20} />
                                <h3>Ingredients</h3>
                            </div>
                            <p className={styles.ingredients}>
                                {ingredients || (
                                    <span className={styles.emptyText}>
                                        Ingredients list is not yet available in the database.
                                        <br />
                                        <small>You can help by contributing data on Open Food Facts.</small>
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Nutrition Summary Table */}
                        <div className={styles.detailsCard}>
                            <div className={styles.cardHeader}>
                                <Zap size={20} />
                                <h3>Nutrition Facts (per 100g)</h3>
                            </div>
                            {nutritionFacts.some(f => f.value !== undefined) ? (
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
                                                <td>{fact.value !== undefined ? `${fact.value} ${fact.unit}` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.emptyStateBox}>
                                    <p>Comprehensive nutrition data is currently unavailable.</p>
                                </div>
                            )}
                        </div>

                        {/* Attribution & Contribution */}
                        <div className={styles.footer}>
                            <div className={styles.verification}>
                                <CheckCircle size={18} color="var(--grade-a)" />
                                Data verified via Open Food Facts
                            </div>
                            <a
                                href={`https://world.openfoodfacts.org/product/${product.code || id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalLink}
                            >
                                Help improve this data <ExternalLink size={14} />
                            </a>
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;
