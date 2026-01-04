import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VegToggle from './VegToggle';
import styles from './Navbar.module.css';

/**
/**
 * Navbar Component
 * Main navigation bar with branding, search access, and theme toggle.
 */
const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Navigate to products section, handling page transitions if needed
    const scrollToProducts = (e) => {
        e.preventDefault();
        setIsMenuOpen(false);
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

                {/* Desktop Navigation Links & Actions */}
                <div className={`${styles.navLinks} ${styles.desktopOnly}`}>
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
                                {theme === 'light' ? (
                                    <Moon size={24} color="black" fill="black" />
                                ) : (
                                    <Sun size={24} color="#fbbf24" fill="#fbbf24" opacity={0.9} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </div>

                {/* Mobile Menu Toggle & Theme Toggle */}
                <div className={styles.mobileActions}>
                    <div className={styles.mobileVegContainer}>
                        <VegToggle />
                    </div>

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
                                {theme === 'light' ? (
                                    <Moon size={24} color="black" fill="black" />
                                ) : (
                                    <Sun size={24} color="#fbbf24" fill="#fbbf24" opacity={0.9} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button onClick={scrollToProducts} className={styles.mobileNavItem}>Explore</button>
                        <Link to="/contact" className={styles.mobileNavItem} onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
