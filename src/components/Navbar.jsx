import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

/**
 * Navbar Component
 * The main navigation bar that sits at the top of every page.
 * It provides branding, easy access to search, contact info, and theme switching.
 */
const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Smart Navigation
     * If the user is on the Home page, we smooth-scroll them to the products.
     * If they are on a different page, we navigate home first and then scroll.
     */
    const scrollToProducts = (e) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            // Navigate home and pass state to trigger scroll after mount
            navigate('/', { state: { scrollTo: 'product-section' } });
        } else {
            const section = document.getElementById('product-section');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                {/* Branding / Logo */}
                <Link to="/" className={styles.logo}>
                    <div className={styles.logoWrapper}>
                        <span className={styles.brandName}>Foodify</span>
                    </div>
                </Link>

                {/* Navigation Links & Actions */}
                <div className={styles.navLinks}>
                    <button onClick={scrollToProducts} className={styles.navItem}>Explore</button>
                    <Link to="/contact" className={styles.navItem}>Contact</Link>

                    {/* Theme Toggle Button */}
                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ y: 20, opacity: 0, rotate: -45 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: -20, opacity: 0, rotate: 45 }}
                                transition={{ duration: 0.3, ease: "anticipate" }}
                                className={styles.iconWrapper}
                            >
                                {/* We use a custom Sun/Moon toggle with distinct colors for visibility */}
                                {theme === 'light' ? (
                                    <Moon size={24} color="black" fill="black" />
                                ) : (
                                    <Sun size={24} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
