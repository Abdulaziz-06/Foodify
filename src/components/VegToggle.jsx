import React from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import VegSplash from './VegSplash';
import styles from './VegToggle.module.css';

const VegToggle = () => {
    const { vegOnly, setVegOnly } = useProducts();
    const [showSplash, setShowSplash] = React.useState(false);

    // Trigger splash only when turning ON
    const handleToggle = () => {
        const nextState = !vegOnly;
        setVegOnly(nextState);
        if (nextState) {
            setShowSplash(true);
            setTimeout(() => setShowSplash(false), 2000); // Auto-hide after 2s
        }
    };

    return (
        <>
            <div className={styles.container}>
                <span className={styles.label}>Veg Only</span>
                <button
                    className={`${styles.toggle} ${vegOnly ? styles.active : ''}`}
                    onClick={handleToggle}
                    aria-label="Toggle Vegetarian Only"
                >
                    <motion.div
                        className={styles.handle}
                        animate={{
                            x: vegOnly ? 24 : 0,
                            backgroundColor: vegOnly ? '#059669' : '#9ca3af',
                            scale: vegOnly ? [1, 1.2, 1] : 1,
                            rotate: vegOnly ? [0, 15, -15, 0] : 0
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            scale: { duration: 0.3 },
                            rotate: { duration: 0.4 }
                        }}
                    >
                        <motion.div
                            className={styles.innerDot}
                            animate={vegOnly ? {
                                scale: [1, 1.4, 1],
                                opacity: [1, 0.6, 1]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </motion.div>

                    <motion.div
                        className={styles.ripple}
                        animate={vegOnly ? {
                            scale: [1, 1.5, 1],
                            opacity: [0, 0.5, 0]
                        } : {}}
                        transition={{ duration: 0.5 }}
                    />
                </button>
            </div>

            {/* Zomato-style Splash */}
            <VegSplash isVisible={showSplash} onComplete={() => setShowSplash(false)} />
        </>
    );
};

export default VegToggle;
