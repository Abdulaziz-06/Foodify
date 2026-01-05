import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

/**
 * Global Footer Component
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                {/* Brand Identity Section */}
                <div className={styles.brandColumn}>
                    <Link to="/" className={styles.logo}>Foodify</Link>
                    <p className={styles.tagline}>
                        Empowering you to make informed food choices with transparent, open-source nutrition data.
                    </p>
                </div>

                {/* Navigation & Help Links */}
                <div className={styles.linksColumn}>
                    <div className={styles.linkGroup}>
                        <span className={styles.groupTitle}>Explore</span>
                        <Link to="/" className={styles.link}>Search Products</Link>
                        <Link to="/" className={styles.link}>Browse Categories</Link>
                        <a
                            href="https://world.openfoodfacts.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            Open Food Facts Database
                        </a>
                    </div>

                    <div className={styles.linkGroup}>
                        <span className={styles.groupTitle}>Support</span>
                        <Link to="/contact" className={styles.link}>Contact</Link>
                        <Link to="/contact" className={styles.link}>Help Center</Link>
                    </div>
                </div>
            </div>

            {/* Legal & Copyright Bottom Bar */}
            <div className={styles.bottomBar}>
                <span>&copy; {currentYear} Foodify. All rights reserved.</span>
                <div className={styles.legalLinks}>
                    <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
                    <Link to="/terms" className={styles.link}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
