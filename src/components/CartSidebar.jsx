import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './CartSidebar.module.css';

/**
 * Cart Sidebar Component
 * Off-canvas drawer displaying cart items with quantity controls.
 */
const CartSidebar = () => {
    const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                    />

                    {/* Sidebar */}
                    <motion.div
                        className={styles.sidebar}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerTitle}>
                                <ShoppingBag size={24} />
                                <h2>Your Cart</h2>
                                <span className={styles.itemCount}>({getTotalItems()})</span>
                            </div>
                            <button className={styles.closeBtn} onClick={toggleCart} aria-label="Close Cart">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Content */}
                        <div className={styles.content}>
                            {cartItems.length === 0 ? (
                                <div className={styles.emptyCart}>
                                    <ShoppingBag size={64} strokeWidth={1} />
                                    <h3>Your cart is empty</h3>
                                    <p>Add some delicious items to get started!</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.itemList}>
                                        {cartItems.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className={styles.cartItem}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 100 }}
                                            >
                                                <img
                                                    src={item.image || '/placeholder.png'}
                                                    alt={item.name}
                                                    className={styles.itemImage}
                                                />
                                                <div className={styles.itemDetails}>
                                                    <h4 className={styles.itemName}>{item.name}</h4>
                                                    <p className={styles.itemBrand}>{item.brand || 'Premium'}</p>

                                                    <div className={styles.itemActions}>
                                                        <div className={styles.quantityControl}>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className={styles.quantity}>{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                        <button
                                                            className={styles.removeBtn}
                                                            onClick={() => removeFromCart(item.id)}
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className={styles.footer}>
                                        <button className={styles.clearBtn} onClick={clearCart}>
                                            Clear Cart
                                        </button>
                                        <div className={styles.totalInfo}>
                                            <span>Total Items:</span>
                                            <span className={styles.totalCount}>{getTotalItems()}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
