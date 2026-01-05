import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

/**
 * Product Card Component
 * Compact preview of a food item for the search grid.
 */
const ProductCard = ({ product }) => {
    const { addToCart, cartItems, updateQuantity } = useCart();

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

    // Check if item is in cart and get its quantity
    const cartItem = cartItems.find(item => item.id === id);
    const itemQuantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigation to product details
        e.stopPropagation();
        addToCart({
            id: id,
            name: name,
            brand: product.brands?.split(',')[0] || 'Premium',
            image: displayImage,
            grade: grade
        });
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(id, itemQuantity + 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(id, itemQuantity - 1);
    };

    return (
        <div className={styles.cardWrapper}>
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

            {/* Add to Cart Button / Quantity Controls */}
            {itemQuantity > 0 ? (
                <div className={styles.quantityControls}>
                    <button
                        className={styles.quantityBtn}
                        onClick={handleDecrement}
                        aria-label="Decrease quantity"
                    >
                        <Minus size={18} strokeWidth={3} />
                    </button>
                    <span className={styles.quantityDisplay}>{itemQuantity}</span>
                    <button
                        className={styles.quantityBtn}
                        onClick={handleIncrement}
                        aria-label="Increase quantity"
                    >
                        <Plus size={18} strokeWidth={3} />
                    </button>
                </div>
            ) : (
                <button
                    className={styles.addToCartBtn}
                    onClick={handleAddToCart}
                    aria-label="Add to cart"
                >
                    <Plus size={20} strokeWidth={3} />
                </button>
            )}
        </div>
    );
};

export default ProductCard;
