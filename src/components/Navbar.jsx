import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const SantaHat = () => (
    <svg viewBox="0 0 100 80" className={styles.capSvg}>
        <path d="M10 50 Q 50 10 90 50 L 80 55 Q 50 30 20 55 Z" fill="#ef4444" />
        <ellipse cx="10" cy="50" rx="6" ry="6" fill="white" />
        <path d="M15 50 L 85 50 Q 85 65 50 65 Q 15 65 15 50" fill="white" />
    </svg>
);

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();

    const scrollToProducts = (e) => {
        e.preventDefault();
        const section = document.getElementById('product-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleContact = (e) => {
        e.preventDefault();
        window.location.href = 'mailto:hello@foodify.com';
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <Link to="/" className={styles.logo}>
                    <div className={styles.logoWrapper}>
                        <div className={styles.capAbsolute}>
                            <SantaHat />
                        </div>
                        <span className={styles.brandName}>
                            <span className={styles.fChar}>F</span>oodify
                        </span>
                    </div>
                </Link>

                <div className={styles.navLinks}>
                    <button onClick={scrollToProducts} className={styles.navItem}>• Explore</button>
                    <Link to="/contact" className={styles.navItem}>• Contact</Link>

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
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
