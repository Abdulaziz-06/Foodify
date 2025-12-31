
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const {
        _id,
        product_name,
        brands,
        image_front_small_url,
        nutrition_grades,
    } = product;

    // Fallback if no score
    const grade = nutrition_grades ? nutrition_grades.toLowerCase() : 'unknown';

    return (
        <Link to={`/product/${product.code || _id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                {image_front_small_url ? (
                    <img src={image_front_small_url} alt={product_name} className={styles.image} loading="lazy" />
                ) : (
                    <div style={{ color: '#ccc' }}>No Image</div>
                )}
            </div>
            <div className={styles.info}>
                <span className={styles.brand}>{brands?.split(',')[0]}</span>
                <h3 className={styles.name}>{product_name || "Unknown Product"}</h3>

                <div className={styles.footer}>
                    {nutrition_grades && (
                        <div className={styles.grade} data-grade={grade}>
                            {grade}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
