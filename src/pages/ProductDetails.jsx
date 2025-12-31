
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductByBarcode } from '../services/api';
import Navbar from '../components/Navbar';
import { ArrowLeft, Share2 } from 'lucide-react';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getProductByBarcode(id);
                if (data.status === 1 || data.status === "success") {
                    setProduct(data.product);
                    // Clear error if we got data (even if we had an error before)
                    setError(null);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                setError("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.loading}>Loading Details...</div>
            </div>
        </>
    );
    if (error || !product) return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.loading}>{error}</div>
            <Link to="/" className={styles.backLink}>Go Home</Link>
        </div>
    );

    const grade = product.nutrition_grades ? product.nutrition_grades.toLowerCase() : 'unknown';

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <Link to="/" className={styles.backLink}>
                    <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Search
                </Link>

                <div className={styles.grid}>
                    <div className={styles.imageSection}>
                        {product.image_front_url ? (
                            <img src={product.image_front_url} alt={product.product_name} className={styles.image} />
                        ) : (
                            <div>No Image Available</div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.brand}>{product.brands}</div>
                        <h1 className={styles.title}>{product.product_name || "Unknown Name"}</h1>

                        <div className={styles.nutritionGrade}>
                            <span>Nutrition Score:</span>
                            <div className={styles.gradeCircle} data-grade={grade}>{grade}</div>
                        </div>

                        <div className={styles.badges}>
                            {product.categories_tags?.slice(0, 5).map(tag => (
                                <span key={tag} className={styles.badge}>
                                    {tag.replace('en:', '').replace(/-/g, ' ')}
                                </span>
                            ))}
                        </div>

                        <h3 className={styles.sectionTitle}>Ingredients</h3>
                        <p className={styles.ingredients}>
                            {product.ingredients_text ? product.ingredients_text : "Ingredients list not available."}
                        </p>

                        <h3 className={styles.sectionTitle}>Nutritional Values (per 100g)</h3>
                        <table className={styles.nutritionTable}>
                            <tbody>
                                <tr>
                                    <th>Energy</th>
                                    <td>{product.nutriments?.energy_100g} kJ / {product.nutriments?.['energy-kcal_100g']} kcal</td>
                                </tr>
                                <tr>
                                    <th>Fat</th>
                                    <td>{product.nutriments?.fat_100g} g</td>
                                </tr>
                                <tr>
                                    <th>Carbohydrates</th>
                                    <td>{product.nutriments?.carbohydrates_100g} g</td>
                                </tr>
                                <tr>
                                    <th>Proteins</th>
                                    <td>{product.nutriments?.proteins_100g} g</td>
                                </tr>
                                <tr>
                                    <th>Salt</th>
                                    <td>{product.nutriments?.salt_100g} g</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
