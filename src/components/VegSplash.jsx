import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './VegSplash.module.css';

const VegSplash = ({ isVisible, onComplete }) => {
    // We use a Portal to ensure the splash is top-level and not restricted by parent CSS
    const splashContent = (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className={styles.container}>
                        {/* Radioactive Concentric Circles - Much larger for whole-page feel */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={styles.ripple}
                                initial={{ scale: 0.2, opacity: 0 }}
                                animate={{
                                    scale: [0.2, 1.5, 4],
                                    opacity: [0, 0.5, 0]
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: 1,
                                    delay: i * 0.2,
                                    ease: "circOut"
                                }}
                            />
                        ))}

                        {/* Central High-Impact Badge */}
                        <motion.div
                            className={styles.badge}
                            initial={{ scale: 0, rotate: -30, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25
                            }}
                        >
                            <div className={styles.badgeRing}>
                                <div className={styles.glow} />
                                <span className={styles.badgeTextTop}>100%</span>
                                <span className={styles.badgeTextBottom}>VEG</span>
                            </div>
                        </motion.div>

                        <motion.p
                            className={styles.description}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                        >
                            Explore veg dishes from all restaurants
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Render to body
    return ReactDOM.createPortal(splashContent, document.body);
};

export default VegSplash;
