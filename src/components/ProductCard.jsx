import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

/**
 * Product Card Component
 * Compact preview of a food item for the search grid.
 */
const ProductCard = ({ product }) => {
    // Extract the most descriptive name possible
    const getBestName = (p) => {
        const name = p.product_name || p.product_name_en || p.generic_name;
        if (name && name.trim() && name.toLowerCase() !== 'unknown') return name;

        const brand = p.brands?.split(',')[0];
        const category = p.categories?.split(',')[0]?.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');

        if (brand && brand.toLowerCase() !== 'unknown' && category && category.toLowerCase() !== 'unknown') {
            return `${brand} ${category}`;
        }
        if (brand && brand.trim() && brand.toLowerCase() !== 'unknown') return brand;
        if (category && category.trim() && category.toLowerCase() !== 'unknown') return category;

        return "Premium Food Selection";
    };

    const name = getBestName(product);
    const grade = product.nutrition_grades ? product.nutrition_grades.toLowerCase() : '';
    const id = product.code || product._id;

    // Use high-resolution images where available to ensure a premium look.
    const displayImage = product.image_front_url || product.image_url || product.image_front_small_url;

    return (
        <div>
            <Link to={`/product/${id}`} className={styles.card}>
                {/* Visual Identity Layer */}
                <div className={styles.imageSection}>
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={name}
                            className={styles.mainImage}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.noImage}></div>
                    )}

                    {/* Nutri-Score Overlay Badge */}
                    {['a', 'b', 'c', 'd', 'e'].includes(grade) && (
                        <div className={styles.gradeBadge} data-grade={grade}>
                            {grade}
                        </div>
                    )}
                </div>

                {/* Product Information Layer */}
                <div className={styles.info}>
                    <span className={styles.categoryInfo}>
                        {product.categories?.split(',')[0]?.replace(/^[a-z]{2}:/, '') || "Natural"}
                    </span>
                    <h3 className={styles.name}>{name}</h3>

                    <div className={styles.footer}>
                        <span className={styles.brandTag}>
                            {product.brands?.split(',')[0] || "Essential"}
                        </span>
                        <div className={styles.dot} />
                        <span className={styles.exploreBtn}>Explore</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
